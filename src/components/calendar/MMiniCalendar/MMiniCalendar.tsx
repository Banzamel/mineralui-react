import {useEffect, useMemo, useRef, useState} from 'react'
import type {CSSProperties, KeyboardEvent} from 'react'
import {cn} from '../../../utils/cn'
import {useDocumentLocale} from '../../../utils/locale'
import {useControllableState} from '../../../utils/useControllableState'
import {
    addDays,
    addMonthsClamped,
    getDateKey,
    getMonthMatrix,
    getWeekdayLabels,
    isSameDay,
    isSameMonth,
    normalizeDate,
    startOfMonth,
    startOfWeek,
    stripTime,
} from '../../../utils/calendarDates'
import {useMMiniCalendarTexts} from '../../../i18n/frameworkTexts'
import {MButton} from '../../controls'
import {MChevronLeftIcon, MChevronRightIcon} from '../../../icons'
import type {MMiniCalendarMarker, MMiniCalendarProps} from './MMiniCalendar.types'
import './MMiniCalendar.css'

const COLOR_FAMILIES = new Set(['primary', 'neutral', 'success', 'error', 'warning', 'info', 'light', 'dark', 'news'])

function markerColor(color?: string): string {
    if (!color) {
        return 'var(--mineral-primary)'
    }
    return COLOR_FAMILIES.has(color) ? `var(--mineral-${color})` : color
}

function toMarkerList(value: MMiniCalendarMarker | MMiniCalendarMarker[] | null | undefined): MMiniCalendarMarker[] {
    if (!value) {
        return []
    }
    return Array.isArray(value) ? value : [value]
}

/**
 * Compact month grid with WAI-ARIA date-grid keyboard support: arrows move by day or week,
 * PageUp/PageDown by month (Shift: year), Home/End to the week edges, Enter/Space selects.
 */
export function MMiniCalendar({
    value,
    defaultValue = null,
    onChange,
    month,
    defaultMonth,
    onMonthChange,
    min,
    max,
    disabledDates,
    weekStartsOn = 1,
    locale: localeProp,
    highlightRange,
    markers,
    showOutsideDays = true,
    size = 'md',
    color = 'primary',
    texts: textsProp,
    autoFocus = false,
    className,
    style,
    ...rest
}: MMiniCalendarProps) {
    const locale = useDocumentLocale(localeProp)
    const texts = useMMiniCalendarTexts(locale, textsProp)
    const [selected, setSelected] = useControllableState<Date | null>(value, defaultValue, (next) => {
        if (next) {
            onChange?.(next)
        }
    })
    const today = stripTime(new Date())
    const [visibleMonth, setVisibleMonth] = useControllableState<Date>(
        month ? startOfMonth(month) : undefined,
        () => startOfMonth(defaultMonth ?? value ?? defaultValue ?? today),
        onMonthChange
    )
    const [focusDate, setFocusDate] = useState<Date>(() => stripTime(value ?? defaultValue ?? today))
    const gridRef = useRef<HTMLDivElement>(null)
    const shouldFocusRef = useRef(autoFocus)

    const minDate = useMemo(() => normalizeDate(min ?? null), [min])
    const maxDate = useMemo(() => normalizeDate(max ?? null), [max])

    const isDisabled = (date: Date) => {
        if (minDate && date < minDate) {
            return true
        }
        if (maxDate && date > maxDate) {
            return true
        }
        if (typeof disabledDates === 'function') {
            return disabledDates(date)
        }
        return Boolean(disabledDates?.some((item) => isSameDay(item, date)))
    }

    // A value set from outside (controlled `value`) brings its month into view.
    const valueKey = value ? getDateKey(value) : null
    const lastValueKeyRef = useRef(valueKey)
    useEffect(() => {
        if (valueKey === lastValueKeyRef.current) {
            return
        }
        lastValueKeyRef.current = valueKey
        if (!value) {
            return
        }
        setFocusDate(stripTime(value))
        if (!isSameMonth(value, visibleMonth)) {
            setVisibleMonth(startOfMonth(value))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueKey])

    // Keep the roving focus target inside the displayed month.
    useEffect(() => {
        if (!isSameMonth(focusDate, visibleMonth)) {
            const candidate = selected && isSameMonth(selected, visibleMonth) ? selected : visibleMonth
            setFocusDate(stripTime(candidate))
        }
    }, [visibleMonth])

    useEffect(() => {
        if (!shouldFocusRef.current) {
            return
        }
        shouldFocusRef.current = false
        const node = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${getDateKey(focusDate)}"]`)
        node?.focus()
    }, [focusDate])

    const days = useMemo(() => getMonthMatrix(visibleMonth, weekStartsOn), [visibleMonth, weekStartsOn])
    const weeks = useMemo(() => Array.from({length: 6}, (_, index) => days.slice(index * 7, index * 7 + 7)), [days])
    const weekdayLabels = useMemo(() => getWeekdayLabels(locale, weekStartsOn, 'short'), [locale, weekStartsOn])
    const weekdayLong = useMemo(() => getWeekdayLabels(locale, weekStartsOn, 'long'), [locale, weekStartsOn])
    const monthTitle = new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'}).format(visibleMonth)
    const dayLabelFormatter = useMemo(
        () => new Intl.DateTimeFormat(locale, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}),
        [locale]
    )

    const rangeStart = highlightRange ? stripTime(highlightRange.start) : null
    const rangeEnd = highlightRange ? stripTime(highlightRange.end) : null

    const moveFocus = (next: Date) => {
        const target = stripTime(next)
        shouldFocusRef.current = true
        setFocusDate(target)
        if (!isSameMonth(target, visibleMonth)) {
            setVisibleMonth(startOfMonth(target))
        }
    }

    const select = (date: Date) => {
        if (isDisabled(date)) {
            return
        }
        setSelected(date)
        setFocusDate(date)
        if (!isSameMonth(date, visibleMonth)) {
            setVisibleMonth(startOfMonth(date))
        }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const current = focusDate
        let next: Date | null = null
        switch (event.key) {
            case 'ArrowLeft':
                next = addDays(current, -1)
                break
            case 'ArrowRight':
                next = addDays(current, 1)
                break
            case 'ArrowUp':
                next = addDays(current, -7)
                break
            case 'ArrowDown':
                next = addDays(current, 7)
                break
            case 'PageUp':
                next = addMonthsClamped(current, event.shiftKey ? -12 : -1)
                break
            case 'PageDown':
                next = addMonthsClamped(current, event.shiftKey ? 12 : 1)
                break
            case 'Home':
                next = startOfWeek(current, weekStartsOn)
                break
            case 'End':
                next = addDays(startOfWeek(current, weekStartsOn), 6)
                break
            case 'Enter':
            case ' ':
                event.preventDefault()
                select(current)
                return
            default:
                return
        }
        event.preventDefault()
        moveFocus(next)
    }

    const goMonth = (amount: number) => {
        const nextMonth = startOfMonth(addMonthsClamped(visibleMonth, amount))
        setVisibleMonth(nextMonth)
    }

    return (
        <div
            className={cn('mineral-mini-calendar', `mineral-mini-calendar--${size}`, className)}
            style={
                {
                    ['--mineral-mini-calendar-accent' as string]: `var(--mineral-${color})`,
                    ['--mineral-mini-calendar-accent-contrast' as string]: `var(--mineral-${color}-contrast)`,
                    ...style,
                } as CSSProperties
            }
            {...rest}
        >
            <div className={'mineral-mini-calendar__header'}>
                <MButton
                    size={'sm'}
                    variant={'ghost'}
                    color={color}
                    iconOnly
                    aria-label={texts.previousMonth}
                    startIcon={<MChevronLeftIcon size={16} />}
                    onClick={() => goMonth(-1)}
                />
                <span className={'mineral-mini-calendar__title'} aria-live={'polite'}>
                    {monthTitle}
                </span>
                <MButton
                    size={'sm'}
                    variant={'ghost'}
                    color={color}
                    iconOnly
                    aria-label={texts.nextMonth}
                    startIcon={<MChevronRightIcon size={16} />}
                    onClick={() => goMonth(1)}
                />
            </div>
            <div
                ref={gridRef}
                className={'mineral-mini-calendar__grid'}
                role={'grid'}
                aria-label={monthTitle}
                onKeyDown={handleKeyDown}
            >
                <div className={'mineral-mini-calendar__row'} role={'row'}>
                    {weekdayLabels.map((label, index) => (
                        <span
                            key={label + index}
                            className={'mineral-mini-calendar__weekday'}
                            role={'columnheader'}
                            aria-label={weekdayLong[index]}
                        >
                            {label}
                        </span>
                    ))}
                </div>
                {weeks.map((week) => (
                    <div key={getDateKey(week[0])} className={'mineral-mini-calendar__row'} role={'row'}>
                        {week.map((day) => {
                            const outside = !isSameMonth(day, visibleMonth)
                            if (outside && !showOutsideDays) {
                                return (
                                    <span
                                        key={getDateKey(day)}
                                        className={'mineral-mini-calendar__cell'}
                                        role={'gridcell'}
                                    />
                                )
                            }
                            const disabled = isDisabled(day)
                            const isSelected = Boolean(selected && isSameDay(selected, day))
                            const isToday = isSameDay(today, day)
                            const inRange = Boolean(rangeStart && rangeEnd && day >= rangeStart && day <= rangeEnd)
                            const dayMarkers = markers ? toMarkerList(markers(day)) : []
                            const markerText = dayMarkers
                                .map((marker) => marker.label)
                                .filter(Boolean)
                                .join(', ')
                            return (
                                <span
                                    key={getDateKey(day)}
                                    className={'mineral-mini-calendar__cell'}
                                    role={'gridcell'}
                                    aria-selected={isSelected}
                                >
                                    <button
                                        type={'button'}
                                        data-date={getDateKey(day)}
                                        className={cn(
                                            'mineral-mini-calendar__day',
                                            outside && 'mineral-mini-calendar__day--outside',
                                            isToday && 'mineral-mini-calendar__day--today',
                                            isSelected && 'mineral-mini-calendar__day--selected',
                                            inRange && 'mineral-mini-calendar__day--in-range',
                                            disabled && 'mineral-mini-calendar__day--disabled',
                                            disabled && 'm-unavailable'
                                        )}
                                        tabIndex={isSameDay(day, focusDate) ? 0 : -1}
                                        // Not native `disabled`: the roving tab stop may land on an
                                        // unavailable day (arrow past min/max) and must stay focusable.
                                        aria-disabled={disabled || undefined}
                                        aria-current={isToday ? 'date' : undefined}
                                        aria-label={
                                            markerText
                                                ? `${dayLabelFormatter.format(day)}, ${markerText}`
                                                : dayLabelFormatter.format(day)
                                        }
                                        onClick={() => select(day)}
                                        onFocus={() => {
                                            if (!isSameDay(day, focusDate)) {
                                                setFocusDate(day)
                                            }
                                        }}
                                    >
                                        <span className={'mineral-mini-calendar__number'}>{day.getDate()}</span>
                                        {dayMarkers.length > 0 ? (
                                            <span className={'mineral-mini-calendar__markers'} aria-hidden={'true'}>
                                                {dayMarkers.slice(0, 3).map((marker, index) => (
                                                    <span
                                                        key={index}
                                                        className={'mineral-mini-calendar__marker'}
                                                        style={{background: markerColor(marker.color)}}
                                                    />
                                                ))}
                                            </span>
                                        ) : null}
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
