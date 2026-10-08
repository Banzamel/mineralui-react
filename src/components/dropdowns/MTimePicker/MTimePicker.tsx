import {useState, useRef, useCallback, useMemo} from 'react'
import type * as React from 'react'
import type {MTimePickerProps} from './MTimePicker.types'
import {MPopover} from '../../primitives'
import {TimeColumnListbox} from '../shared/TimeColumnListbox'
import {cn} from '../../../utils/cn'
import {MClockIcon, MCloseIcon} from '../../../icons'
import {formatTime, parseTime} from '../../../utils/dateUtils'
import './MTimePicker.css'
import {useMCommonTexts, useMTimePickerTexts} from '../../../i18n/frameworkTexts'

type ParsedTimeValue = {hours: number; minutes: number; seconds: number}
type Meridiem = 'AM' | 'PM'

function to12HourParts(value: ParsedTimeValue) {
    const meridiem: Meridiem = value.hours >= 12 ? 'PM' : 'AM'
    const hours = value.hours % 12 || 12
    return {hours, minutes: value.minutes, seconds: value.seconds, meridiem}
}

function to24HourValue(hours: number, meridiem: Meridiem): number {
    if (meridiem === 'AM') {
        return hours === 12 ? 0 : hours
    }
    return hours === 12 ? 12 : hours + 12
}

function formatTimeValue(
    hours: number,
    minutes: number,
    seconds: number,
    showSeconds: boolean,
    format: '24h' | '12h'
): string {
    if (format === '24h') {
        return formatTime(hours, minutes, seconds, showSeconds)
    }

    const parts = to12HourParts({hours, minutes, seconds})
    const base = `${parts.hours.toString().padStart(2, '0')}:${parts.minutes.toString().padStart(2, '0')}`
    const withSeconds = showSeconds ? `${base}:${parts.seconds.toString().padStart(2, '0')}` : base
    return `${withSeconds} ${parts.meridiem}`
}

function parseTimeValue(value: string, format: '24h' | '12h'): ParsedTimeValue | null {
    if (format === '24h') {
        return parseTime(value)
    }

    const normalized = value.trim().toUpperCase()
    const match = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/)
    if (match) {
        const hours = parseInt(match[1], 10)
        const minutes = parseInt(match[2], 10)
        const seconds = match[3] ? parseInt(match[3], 10) : 0
        const meridiem = match[4] as Meridiem

        if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) {
            return null
        }

        return {hours: to24HourValue(hours, meridiem), minutes, seconds}
    }

    return parseTime(value)
}

// Compare time tuples so min/max checks can stay string-format agnostic.
function compareTimeParts(
    left: {hours: number; minutes: number; seconds: number},
    right: {hours: number; minutes: number; seconds: number}
): number {
    if (left.hours !== right.hours) return left.hours - right.hours
    if (left.minutes !== right.minutes) return left.minutes - right.minutes
    return left.seconds - right.seconds
}

// Check whether a time falls within optional min and max boundaries.
function isTimeInRange(
    value: {hours: number; minutes: number; seconds: number},
    min?: {hours: number; minutes: number; seconds: number} | null,
    max?: {hours: number; minutes: number; seconds: number} | null
): boolean {
    return (!min || compareTimeParts(value, min) >= 0) && (!max || compareTimeParts(value, max) <= 0)
}

type TimeParts = {hours: number; minutes: number; seconds: number}

// True when the closed window [from, to] overlaps the optional min / max range.
function windowIntersectsRange(from: TimeParts, to: TimeParts, min?: TimeParts | null, max?: TimeParts | null) {
    return (!min || compareTimeParts(to, min) >= 0) && (!max || compareTimeParts(from, max) <= 0)
}

// Pull a time back inside the optional min / max range.
function clampTime(value: TimeParts, min?: TimeParts | null, max?: TimeParts | null): TimeParts {
    if (min && compareTimeParts(value, min) < 0) return {...min}
    if (max && compareTimeParts(value, max) > 0) return {...max}
    return value
}

// Render a time input backed by scrollable hour, minute and second columns.
export function MTimePicker({
    value,
    defaultValue,
    onChange,
    format = '24h',
    showSeconds = false,
    minuteStep = 1,
    min,
    max,
    placeholder,
    disabled = false,
    readOnly = false,
    name,
    id,
    variant = 'outlined',
    size = 'md',
    color,
    label,
    helperText,
    errorText,
    error = false,
    required = false,
    clearable = false,
    fullWidth = false,
    className,
    style,
}: MTimePickerProps) {
    const texts = useMCommonTexts()
    const timeTexts = useMTimePickerTexts()
    const [open, setOpen] = useState(false)
    // Opening from the keyboard moves focus into the first column (APG dialog); a click keeps it in the field.
    const [focusOnOpen, setFocusOnOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const triggerRef = useRef<HTMLDivElement>(null)

    const currentValue = value !== undefined ? value : internalValue
    const hasError = error || !!errorText
    const parsed = parseTimeValue(currentValue, format)
    const minTime = parseTimeValue(min ?? '', format)
    const maxTime = parseTimeValue(max ?? '', format)
    const displayTime = parsed ? to12HourParts(parsed) : null
    const displayValue = parsed
        ? formatTimeValue(parsed.hours, parsed.minutes, parsed.seconds, showSeconds, format)
        : currentValue

    // Build the visible hour list based on the selected time format.
    const hours = useMemo(() => {
        const items: number[] = []
        const maxHour = format === '12h' ? 12 : 23
        const startHour = format === '12h' ? 1 : 0
        for (let index = startHour; index <= maxHour; index++) {
            items.push(index)
        }
        return items
    }, [format])

    // Build the minute list using the configured step size.
    const minutes = useMemo(() => {
        const items: number[] = []
        for (let index = 0; index < 60; index += minuteStep) {
            items.push(index)
        }
        return items
    }, [minuteStep])

    // Build the seconds list only when the picker exposes seconds.
    const seconds = useMemo(() => {
        if (!showSeconds) return []
        const items: number[] = []
        for (let index = 0; index < 60; index++) {
            items.push(index)
        }
        return items
    }, [showSeconds])

    // Reuse range validation for list rendering and direct text input.
    const isSelectable = useCallback(
        (hoursValue: number, minutesValue: number, secondsValue: number = 0) => {
            return isTimeInRange({hours: hoursValue, minutes: minutesValue, seconds: secondsValue}, minTime, maxTime)
        },
        [maxTime, minTime]
    )

    // A column option is available when ANY time it can lead to lies in range — not just
    // the combination with the other columns' current values. Picking hour 9 while the
    // minutes read 15 with `min="09:30"` is allowed and clamps to 09:30.
    const lastSecond = showSeconds ? 59 : 0
    const isMinuteAvailable = useCallback(
        (hoursValue: number, minutesValue: number) =>
            windowIntersectsRange(
                {hours: hoursValue, minutes: minutesValue, seconds: 0},
                {hours: hoursValue, minutes: minutesValue, seconds: lastSecond},
                minTime,
                maxTime
            ),
        [lastSecond, maxTime, minTime]
    )
    const isHourAvailable = useCallback(
        (hoursValue: number) => minutes.some((minutesValue) => isMinuteAvailable(hoursValue, minutesValue)),
        [isMinuteAvailable, minutes]
    )
    const isMeridiemAvailable = useCallback(
        (meridiem: Meridiem) => {
            const offset = meridiem === 'AM' ? 0 : 12
            for (let hour = offset; hour < offset + 12; hour++) {
                if (isHourAvailable(hour)) return true
            }
            return false
        },
        [isHourAvailable]
    )

    // Apply the selected time and keep uncontrolled usage in sync.
    const handleSelect = useCallback(
        (hoursValue: number, minutesValue: number, secondsValue: number = 0) => {
            const next = clampTime({hours: hoursValue, minutes: minutesValue, seconds: secondsValue}, minTime, maxTime)
            if (!isSelectable(next.hours, next.minutes, next.seconds)) return
            const time = formatTimeValue(next.hours, next.minutes, next.seconds, showSeconds, format)
            if (value === undefined) setInternalValue(time)
            onChange?.(time)
        },
        [format, isSelectable, maxTime, minTime, onChange, showSeconds, value]
    )

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const raw = event.target.value
            if (value === undefined) setInternalValue(raw)
        },
        [value]
    )

    // Normalize manual input once the user leaves the field.
    const handleInputBlur = useCallback(() => {
        const nextValue = parseTimeValue(currentValue, format)
        if (nextValue && isTimeInRange(nextValue, minTime, maxTime)) {
            const time = formatTimeValue(nextValue.hours, nextValue.minutes, nextValue.seconds, showSeconds, format)
            if (value === undefined) setInternalValue(time)
            onChange?.(time)
        }
    }, [currentValue, format, maxTime, minTime, onChange, showSeconds, value])

    const handleMeridiemChange = useCallback(
        (meridiem: Meridiem) => {
            const currentHours = displayTime?.hours ?? 12
            const minutesValue = parsed?.minutes ?? 0
            const secondsValue = parsed?.seconds ?? 0
            const nextHours = to24HourValue(currentHours, meridiem)
            handleSelect(nextHours, minutesValue, secondsValue)
        },
        [displayTime?.hours, handleSelect, parsed?.minutes, parsed?.seconds]
    )

    // ArrowDown / Alt+ArrowDown in the field opens the columns and moves focus into them.
    const handleInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (disabled || readOnly || event.key !== 'ArrowDown') return
            event.preventDefault()
            setFocusOnOpen(true)
            setOpen(true)
        },
        [disabled, readOnly]
    )

    const handleClose = useCallback(() => {
        setOpen(false)
        setFocusOnOpen(false)
    }, [])

    // Clear the current time without closing the trigger first.
    const handleClear = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation()
            if (value === undefined) setInternalValue('')
            onChange?.('')
        },
        [onChange, value]
    )

    return (
        <div
            className={cn('time picker', color && `color-${color}`, fullWidth && 'full-width', className)}
            style={style}
        >
            {label && (
                <label
                    htmlFor={id}
                    className={cn('field-label', open && 'focused', hasError && 'error', required && 'required')}
                >
                    {label}
                </label>
            )}

            <div
                ref={triggerRef}
                className={cn(
                    'time trigger',
                    `field-${variant}`,
                    `field-${size}`,
                    open && 'focused',
                    hasError && 'error',
                    disabled && 'disabled'
                )}
                onClick={() => !disabled && !readOnly && setOpen(true)}
            >
                <span className="time icon">
                    <MClockIcon />
                </span>
                <input
                    type="text"
                    className="time input"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    placeholder={
                        placeholder ??
                        (format === '12h'
                            ? showSeconds
                                ? 'hh:mm:ss AM'
                                : 'hh:mm AM'
                            : showSeconds
                              ? 'HH:MM:SS'
                              : 'HH:MM')
                    }
                    disabled={disabled}
                    readOnly={readOnly}
                    id={id}
                    aria-invalid={hasError || undefined}
                />
                {clearable && currentValue && !disabled && (
                    <button
                        type="button"
                        className="time clear clear-btn-base"
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label={texts.clearTime}
                    >
                        <MCloseIcon />
                    </button>
                )}
            </div>

            {name && <input type="hidden" name={name} value={displayValue} />}

            <MPopover
                className="time picker popover"
                open={open}
                anchorRef={triggerRef}
                onClose={handleClose}
                placement="bottom-start"
                role="dialog"
                aria-label={label ?? timeTexts.dialogLabel}
                initialFocus={focusOnOpen ? 'first' : undefined}
                closeOnTabOut
            >
                <div className="time columns">
                    <TimeColumnListbox
                        classNames={TIME_COLUMN_CLASSES}
                        items={hours}
                        selected={format === '12h' ? displayTime?.hours : parsed?.hours}
                        onSelect={(hoursValue) =>
                            handleSelect(
                                format === '12h'
                                    ? to24HourValue(hoursValue, displayTime?.meridiem ?? 'AM')
                                    : hoursValue,
                                parsed?.minutes ?? 0,
                                parsed?.seconds ?? 0
                            )
                        }
                        isDisabled={(hoursValue) =>
                            !isHourAvailable(
                                format === '12h' ? to24HourValue(hoursValue, displayTime?.meridiem ?? 'AM') : hoursValue
                            )
                        }
                        label={timeTexts.hours}
                    />
                    <TimeColumnListbox
                        classNames={TIME_COLUMN_CLASSES}
                        items={minutes}
                        selected={parsed?.minutes}
                        onSelect={(minutesValue) =>
                            handleSelect(parsed?.hours ?? 0, minutesValue, parsed?.seconds ?? 0)
                        }
                        isDisabled={(minutesValue) => !isMinuteAvailable(parsed?.hours ?? 0, minutesValue)}
                        label={timeTexts.minutes}
                    />
                    {showSeconds && (
                        <TimeColumnListbox
                            classNames={TIME_COLUMN_CLASSES}
                            items={seconds}
                            selected={parsed?.seconds}
                            onSelect={(secondsValue) =>
                                handleSelect(parsed?.hours ?? 0, parsed?.minutes ?? 0, secondsValue)
                            }
                            isDisabled={(secondsValue) =>
                                !isSelectable(parsed?.hours ?? 0, parsed?.minutes ?? 0, secondsValue)
                            }
                            label={timeTexts.seconds}
                        />
                    )}
                    {format === '12h' && (
                        <TimeColumnListbox
                            classNames={TIME_COLUMN_CLASSES}
                            items={['AM', 'PM']}
                            selected={displayTime?.meridiem}
                            onSelect={handleMeridiemChange}
                            isDisabled={(meridiem) => !isMeridiemAvailable(meridiem)}
                            label={timeTexts.meridiem}
                        />
                    )}
                </div>
            </MPopover>

            {(errorText || helperText) && (
                <div className="time bottom">
                    {errorText ? (
                        <span className="field-error" role="alert">
                            {errorText}
                        </span>
                    ) : (
                        <span className="time helper">{helperText}</span>
                    )}
                </div>
            )}
        </div>
    )
}

const TIME_COLUMN_CLASSES = {
    column: 'time column',
    label: 'time column label',
    list: 'time column list',
    item: 'time column item',
}
