import {useState, useRef, useCallback, useMemo, useEffect} from 'react'
import type * as React from 'react'
import type {MTimePickerProps} from './MTimePicker.types'
import {MPopover} from '../../primitives'
import {cn} from '../../../utils/cn'
import {MClockIcon, MCloseIcon} from '../../../icons'
import {formatTime, parseTime} from '../../../utils/dateUtils'
import './MTimePicker.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

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
    const [open, setOpen] = useState(false)
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

    // Apply the selected time and keep uncontrolled usage in sync.
    const handleSelect = useCallback(
        (hoursValue: number, minutesValue: number, secondsValue: number = 0) => {
            if (!isSelectable(hoursValue, minutesValue, secondsValue)) return
            const time = formatTimeValue(hoursValue, minutesValue, secondsValue, showSeconds, format)
            if (value === undefined) setInternalValue(time)
            onChange?.(time)
        },
        [format, isSelectable, onChange, showSeconds, value]
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
                onClose={() => setOpen(false)}
                placement="bottom-start"
            >
                <div className="time columns">
                    <TimeColumn
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
                            !isSelectable(
                                format === '12h'
                                    ? to24HourValue(hoursValue, displayTime?.meridiem ?? 'AM')
                                    : hoursValue,
                                parsed?.minutes ?? 0,
                                parsed?.seconds ?? 0
                            )
                        }
                        label="Hr"
                    />
                    <TimeColumn
                        items={minutes}
                        selected={parsed?.minutes}
                        onSelect={(minutesValue) =>
                            handleSelect(parsed?.hours ?? 0, minutesValue, parsed?.seconds ?? 0)
                        }
                        isDisabled={(minutesValue) =>
                            !isSelectable(parsed?.hours ?? 0, minutesValue, parsed?.seconds ?? 0)
                        }
                        label="Min"
                    />
                    {showSeconds && (
                        <TimeColumn
                            items={seconds}
                            selected={parsed?.seconds}
                            onSelect={(secondsValue) =>
                                handleSelect(parsed?.hours ?? 0, parsed?.minutes ?? 0, secondsValue)
                            }
                            isDisabled={(secondsValue) =>
                                !isSelectable(parsed?.hours ?? 0, parsed?.minutes ?? 0, secondsValue)
                            }
                            label="Sec"
                        />
                    )}
                    {format === '12h' && (
                        <TimeColumn
                            items={['AM', 'PM']}
                            selected={displayTime?.meridiem}
                            onSelect={handleMeridiemChange}
                            label="AM/PM"
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

// Render one scrollable time column and keep the selected value centered.
function TimeColumn<T extends number | Meridiem>({
    items,
    selected,
    onSelect,
    isDisabled,
    label,
}: {
    items: T[]
    selected?: T
    onSelect: (value: T) => void
    isDisabled?: (value: T) => boolean
    label: string
}) {
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (selected === undefined || !listRef.current) return
        const element = listRef.current.querySelector(`[data-value="${selected}"]`) as HTMLElement | null
        if (element) {
            const list = listRef.current
            list.scrollTop = element.offsetTop - list.clientHeight / 2 + element.offsetHeight / 2
        }
    }, [selected])

    const renderValue = (value: T) => (typeof value === 'number' ? value.toString().padStart(2, '0') : value)

    return (
        <div className="time column">
            <div className="time column label">{label}</div>
            <div ref={listRef} className="time column list">
                {items.map((item) => {
                    const disabled = isDisabled?.(item) ?? false
                    return (
                        <button
                            key={item}
                            type="button"
                            data-value={item}
                            className={cn('time column item', item === selected && 'selected', disabled && 'disabled')}
                            onClick={() => onSelect(item)}
                            disabled={disabled}
                        >
                            {renderValue(item)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
