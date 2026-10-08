import {useCallback, useEffect, useRef, useState} from 'react'
import type {KeyboardEvent} from 'react'
import {
    addDays,
    addMonthsClamped,
    addMonthsToMonth,
    getDateKey,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    stripTime,
} from './calendarDates'
import type {CalendarWeekStart} from './calendarDates'

/**
 * Internal (not re-exported from the package root): WAI-ARIA APG date-grid keyboard model shared
 * by MDatePicker and MDateRangePicker.
 *
 * One roving tab stop across every visible month; arrows move by day / week, PageUp / PageDown by
 * month (Shift: year), Home / End to the edges of the week, Enter / Space select. Moving past the
 * visible months scrolls the view. Unavailable days stay focusable (`aria-disabled`) so the
 * arrows never get stuck, but they are never selected.
 */
export interface UseDateGridNavOptions {
    /** First visible month (any day inside it). */
    viewMonth: Date
    /** Number of months rendered side by side. Defaults to 1. */
    monthsShown?: number
    onViewMonthChange: (month: Date) => void
    selectedDate: Date | null
    weekStartsOn: CalendarWeekStart
    onSelect: (date: Date) => void
    isDisabled: (date: Date) => boolean
    /** Called whenever the keyboard moves the focused day (e.g. a range preview). */
    onFocusDate?: (date: Date) => void
}

export interface DateGridCellProps {
    'data-date': string
    tabIndex: number
    ref: (el: HTMLElement | null) => void
    onFocus: () => void
}

export function getDateGridTarget(key: string, current: Date, shiftKey: boolean, weekStartsOn: CalendarWeekStart) {
    switch (key) {
        case 'ArrowLeft':
            return addDays(current, -1)
        case 'ArrowRight':
            return addDays(current, 1)
        case 'ArrowUp':
            return addDays(current, -7)
        case 'ArrowDown':
            return addDays(current, 7)
        case 'PageUp':
            return addMonthsClamped(current, shiftKey ? -12 : -1)
        case 'PageDown':
            return addMonthsClamped(current, shiftKey ? 12 : 1)
        case 'Home':
            return startOfWeek(current, weekStartsOn)
        case 'End':
            return addDays(startOfWeek(current, weekStartsOn), 6)
        default:
            return null
    }
}

export function useDateGridNav({
    viewMonth,
    monthsShown = 1,
    onViewMonthChange,
    selectedDate,
    weekStartsOn,
    onSelect,
    isDisabled,
    onFocusDate,
}: UseDateGridNavOptions) {
    const [focusDate, setFocusDate] = useState<Date | null>(null)
    const containerRef = useRef<HTMLElement | null>(null)
    const tabStopRef = useRef<HTMLElement | null>(null)
    const focusPendingRef = useRef(false)

    const firstMonthTime = startOfMonth(viewMonth).getTime()
    const firstMonth = new Date(firstMonthTime)
    const isVisible = useCallback(
        (date: Date) => {
            for (let index = 0; index < monthsShown; index++) {
                if (isSameMonth(date, addMonthsToMonth(new Date(firstMonthTime), index))) return true
            }
            return false
        },
        [firstMonthTime, monthsShown]
    )

    // The tab stop always sits on a day of a visible month: the last keyboard position, else the
    // selected day, else today, else the 1st of the first visible month.
    const today = stripTime(new Date())
    const tabStop =
        focusDate && isVisible(focusDate)
            ? focusDate
            : selectedDate && isVisible(selectedDate)
              ? stripTime(selectedDate)
              : isVisible(today)
                ? today
                : firstMonth
    const tabStopKey = getDateKey(tabStop)

    // Move DOM focus once the target day is rendered (it may live in a month that just scrolled in).
    useEffect(() => {
        if (!focusPendingRef.current) return
        focusPendingRef.current = false
        const node = containerRef.current?.querySelector<HTMLElement>(`[data-date="${tabStopKey}"]`)
        node?.focus()
    }, [tabStopKey])

    const moveFocus = (next: Date) => {
        const target = stripTime(next)
        setFocusDate(target)
        onFocusDate?.(target)
        if (!isVisible(target)) {
            const lastMonthTime = addMonthsToMonth(firstMonth, monthsShown - 1).getTime()
            onViewMonthChange(
                target.getTime() < firstMonthTime
                    ? startOfMonth(target)
                    : target.getTime() > lastMonthTime
                      ? addMonthsToMonth(target, -(monthsShown - 1))
                      : firstMonth
            )
        }
        if (isSameDay(target, tabStop)) {
            // Same day (e.g. Home on the first day of the week): no re-render, focus right away.
            containerRef.current?.querySelector<HTMLElement>(`[data-date="${getDateKey(target)}"]`)?.focus()
        } else {
            focusPendingRef.current = true
        }
    }

    const onGridKeyDown = (event: KeyboardEvent) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!isDisabled(tabStop)) onSelect(tabStop)
            return
        }
        const next = getDateGridTarget(event.key, tabStop, event.shiftKey, weekStartsOn)
        if (!next) return
        event.preventDefault()
        moveFocus(next)
    }

    const getCellProps = useCallback(
        (date: Date): DateGridCellProps => {
            const key = getDateKey(date)
            const isTabStop = key === tabStopKey
            return {
                'data-date': key,
                tabIndex: isTabStop ? 0 : -1,
                ref: (el: HTMLElement | null) => {
                    if (isTabStop) tabStopRef.current = el
                },
                onFocus: () => {
                    if (key !== tabStopKey) setFocusDate(stripTime(date))
                },
            }
        },
        [tabStopKey]
    )

    /** Put DOM focus on the current tab stop (e.g. after opening the picker from the keyboard). */
    const focusTabStop = useCallback(() => {
        tabStopRef.current?.focus()
    }, [])

    return {tabStop, containerRef, tabStopRef, getCellProps, onGridKeyDown, focusTabStop}
}
