import {useState, useRef, useCallback, useMemo, useEffect} from 'react'
import type * as React from 'react'
import type {MDatePickerProps} from './MDatePicker.types'
import type {MDateFormat} from '../../inputs'
import {MInput} from '../../inputs'
import {MPopover} from '../../primitives'
import {cn} from '../../../utils/cn'
import {useMDatePickerTexts} from '../../../i18n/frameworkTexts'
import {useDocumentLocale} from '../../../utils/locale'
import type {ValidationResult} from '../../../utils/validators'
import {parseDateString, validateDate} from '../../../utils/validators'
import {stripNonDigits, formatDateInput} from '../../../utils/formatters'
import {colorRgbVar} from '../../../utils/colorRgbVar'
import {
    formatDate,
    isSameDay,
    isDateInRange,
    getDayNames,
    getMonthNames,
    addMonths,
    stripTime,
    combineDateAndTime,
    formatHiddenDateValue,
    formatTimeWithFormat,
    parseTimeWithFormat,
} from '../../../utils/dateUtils'
import {
    MCalendarIcon,
    MChevronLeftIcon as ChevronLeftGlyphIcon,
    MChevronRightIcon as ChevronRightGlyphIcon,
} from '../../../icons'
import {getMonthMatrix} from '../../../utils/calendarDates'
import './MDatePicker.css'

const DATE_UNAVAILABLE_ERROR = 'Date is unavailable'
const INVALID_TIME_ERROR = 'Invalid time'

type Meridiem = 'AM' | 'PM'

type MDatePickerInputConfig = {
    inputFormat: MDateFormat
    separator: '/' | '.' | '-'
}

type ParsedInputState =
    | {status: 'empty'}
    | {status: 'partial'; datePart: string; timePart: string}
    | {status: 'invalid'; datePart: string; timePart: string; result: ValidationResult}
    | {status: 'valid'; datePart: string; timePart: string; value: Date}

function toDate(value: Date | string | undefined): Date | null {
    if (!value) return null
    if (value instanceof Date) return isNaN(value.getTime()) ? null : new Date(value.getTime())

    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
}

function normalizeDatePickerFormat(format: string): MDatePickerInputConfig {
    const normalizedFormat = format.replace(/DD/g, 'dd').replace(/YYYY/g, 'yyyy')
    const tokens = normalizedFormat.match(/dd|MM|yyyy/g)
    const detectedSeparator = normalizedFormat.match(/[^dMy]/)?.[0]
    const separator =
        detectedSeparator === '/' || detectedSeparator === '.' || detectedSeparator === '-' ? detectedSeparator : '.'
    const order = tokens?.join('/')

    switch (order) {
        case 'MM/dd/yyyy':
            return {inputFormat: 'MM/DD/YYYY', separator}
        case 'yyyy/MM/dd':
            return {inputFormat: 'YYYY/MM/DD', separator}
        case 'dd/MM/yyyy':
        default:
            return {inputFormat: 'DD/MM/YYYY', separator}
    }
}

function getDefaultTimePlaceholder(format: '24h' | '12h', showSeconds: boolean): string {
    if (format === '12h') {
        return showSeconds ? 'hh:mm:ss AM' : 'hh:mm AM'
    }

    return showSeconds ? 'HH:MM:SS' : 'HH:MM'
}

function getInputPlaceholder(
    basePlaceholder: string | undefined,
    dateFormat: string,
    withTime: boolean,
    timeFormat: '24h' | '12h',
    showSeconds: boolean,
    timePlaceholder?: string
): string {
    if (basePlaceholder) {
        return basePlaceholder
    }

    if (!withTime) {
        return dateFormat
    }

    return `${dateFormat} ${timePlaceholder ?? getDefaultTimePlaceholder(timeFormat, showSeconds)}`
}

function formatDisplayValue(
    date: Date | null,
    options: {
        format: string
        withTime: boolean
        timeFormat: '24h' | '12h'
        showSeconds: boolean
    }
): string {
    if (!date) return ''

    const datePart = formatDate(stripTime(date), options.format)

    if (!options.withTime) {
        return datePart
    }

    return `${datePart} ${formatTimeWithFormat(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        options.showSeconds,
        options.timeFormat
    )}`
}

function formatTimeDraft(digits: string, showSeconds: boolean): string {
    if (!digits) return ''

    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`
    if (!showSeconds) return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`
}

function normalizeMeridiemDraft(value: string): string {
    const letters = value.toUpperCase().replace(/[^APM]/g, '')

    if (!letters) return ''
    if (letters.startsWith('AM')) return 'AM'
    if (letters.startsWith('PM')) return 'PM'
    if (letters.startsWith('A')) return 'A'
    if (letters.startsWith('P')) return 'P'

    return ''
}

function splitInputValue(value: string, withTime: boolean) {
    const trimmed = value.trim()

    if (!trimmed) {
        return {datePart: '', timePart: ''}
    }

    if (!withTime) {
        return {datePart: trimmed, timePart: ''}
    }

    const firstSpaceIndex = trimmed.indexOf(' ')

    if (firstSpaceIndex === -1) {
        return {datePart: trimmed, timePart: ''}
    }

    return {
        datePart: trimmed.slice(0, firstSpaceIndex).trim(),
        timePart: trimmed.slice(firstSpaceIndex + 1).trim(),
    }
}

function formatTypedInput(
    rawValue: string,
    options: {
        inputFormat: MDateFormat
        separator: '/' | '.' | '-'
        withTime: boolean
        timeFormat: '24h' | '12h'
        showSeconds: boolean
    }
) {
    const normalizedValue = rawValue.toUpperCase()
    const digits = stripNonDigits(normalizedValue)
    const dateDigits = digits.slice(0, 8)
    const timeDigits = options.withTime ? digits.slice(8, 8 + (options.showSeconds ? 6 : 4)) : ''
    const datePart = formatDateInput(dateDigits, options.inputFormat, options.separator)

    if (!options.withTime) {
        return {formatted: datePart, datePart, timePart: ''}
    }

    const timeBase = formatTimeDraft(timeDigits, options.showSeconds)
    const meridiem = options.timeFormat === '12h' ? normalizeMeridiemDraft(normalizedValue) : ''
    const timePart = `${timeBase}${meridiem ? `${timeBase ? ' ' : ''}${meridiem}` : ''}`.trim()

    if (!datePart) {
        return {formatted: timePart, datePart: '', timePart}
    }

    // Preserve the space delimiter once the date is complete so the user can keep typing the time.
    const dateComplete = dateDigits.length === 8
    const userTypedSpaceAfterDate = /\s/.test(normalizedValue.slice(datePart.length))
    const showSpace = timePart || (dateComplete && userTypedSpaceAfterDate)

    return {
        formatted: showSpace ? `${datePart} ${timePart}` : datePart,
        datePart,
        timePart,
    }
}

function getTimeDraftFromDate(date: Date | null, showSeconds: boolean): string {
    if (!date) return ''
    return formatTimeWithFormat(date.getHours(), date.getMinutes(), date.getSeconds(), showSeconds, '24h')
}

function parseInputValue(
    value: string,
    options: {
        inputFormat: MDateFormat
        minDate: Date | null
        maxDate: Date | null
        withTime: boolean
        timeFormat: '24h' | '12h'
        showSeconds: boolean
        isDisabled: (date: Date) => boolean
    }
): ParsedInputState {
    const {datePart, timePart} = splitInputValue(value, options.withTime)

    if (!datePart && !timePart) {
        return {status: 'empty'}
    }

    const validation = validateDate(datePart, {
        format: options.inputFormat,
        minDate: options.minDate ?? undefined,
        maxDate: options.maxDate ?? undefined,
    })

    if (!validation.valid) {
        return validation.error === 'Incomplete date'
            ? {status: 'partial', datePart, timePart}
            : {status: 'invalid', datePart, timePart, result: validation}
    }

    const parsedDate = parseDateString(datePart, options.inputFormat)

    if (!parsedDate) {
        return {status: 'invalid', datePart, timePart, result: {valid: false, error: 'Invalid date'}}
    }

    if (options.isDisabled(parsedDate)) {
        return {status: 'invalid', datePart, timePart, result: {valid: false, error: DATE_UNAVAILABLE_ERROR}}
    }

    if (!options.withTime) {
        return {status: 'valid', datePart, timePart: '', value: stripTime(parsedDate)}
    }

    if (!timePart) {
        return {
            status: 'valid',
            datePart,
            timePart: '',
            value: combineDateAndTime(parsedDate, '', {format: options.timeFormat, showSeconds: options.showSeconds}),
        }
    }

    const parsedTime = parseTimeWithFormat(timePart, options.timeFormat)

    if (!parsedTime) {
        return {status: 'invalid', datePart, timePart, result: {valid: false, error: INVALID_TIME_ERROR}}
    }

    return {
        status: 'valid',
        datePart,
        timePart,
        value: combineDateAndTime(parsedDate, timePart, {format: options.timeFormat, showSeconds: options.showSeconds}),
    }
}

function to12HourParts(value: {hours: number; minutes: number; seconds: number}) {
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

export function MDatePicker({
    value,
    defaultValue,
    onChange,
    format = 'dd.MM.yyyy',
    locale: localeOverride,
    min,
    max,
    disabledDates,
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
    withTime = false,
    validateOnBlur = true,
    validateOnChange = false,
    onValidationChange,
    timeFormat = '24h',
    showSeconds = false,
    minuteStep = 1,
    timePlaceholder,
    inline = false,
    showTodayButton = true,
    firstDayOfWeek = 1,
    fullWidth = false,
    className,
    style,
}: MDatePickerProps) {
    const locale = useDocumentLocale(localeOverride)
    const texts = useMDatePickerTexts()
    const {inputFormat, separator} = useMemo(() => normalizeDatePickerFormat(format), [format])
    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<Date | null>(() => toDate(defaultValue))
    const [validationState, setValidationState] = useState<ValidationResult>({valid: true})
    const [touched, setTouched] = useState(false)
    const selectedValue = value !== undefined ? toDate(value) : internalValue
    const [inputValue, setInputValue] = useState(() =>
        formatDisplayValue(selectedValue, {format, withTime, timeFormat, showSeconds})
    )
    const [draftTimeValue, setDraftTimeValue] = useState(() => getTimeDraftFromDate(selectedValue, showSeconds))
    const [viewDate, setViewDate] = useState(() => {
        const baseDate = selectedValue ? stripTime(selectedValue) : new Date()
        return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    })
    const [viewMode, setViewMode] = useState<'days' | 'months'>('days')
    const anchorRef = useRef<HTMLDivElement>(null)
    const selectedValueKey = selectedValue?.getTime() ?? null
    const minDate = toDate(min)
    const maxDate = toDate(max)
    const hasError = error || (touched && !validationState.valid)
    const resolvedErrorText = errorText || (touched && !validationState.valid ? validationState.error : undefined)
    const dayNames = getDayNames(locale, firstDayOfWeek)
    const monthNames = getMonthNames(locale)

    useEffect(() => {
        setInputValue(formatDisplayValue(selectedValue, {format, withTime, timeFormat, showSeconds}))
        setDraftTimeValue(getTimeDraftFromDate(selectedValue, showSeconds))
        if (selectedValue) {
            const normalizedDate = stripTime(selectedValue)
            setViewDate(new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), 1))
        }
    }, [format, selectedValueKey, showSeconds, timeFormat, withTime])

    const isDisabled = useCallback(
        (date: Date): boolean => {
            if (!isDateInRange(date, minDate, maxDate)) return true
            if (Array.isArray(disabledDates)) {
                return disabledDates.some((disabledDate) => isSameDay(disabledDate, date))
            }
            if (typeof disabledDates === 'function') {
                return disabledDates(date)
            }
            return false
        },
        [disabledDates, maxDate, minDate]
    )

    const emitValidation = useCallback(
        (result: ValidationResult) => {
            setValidationState(result)
            onValidationChange?.(result)
        },
        [onValidationChange]
    )

    const commitValue = useCallback(
        (nextValue: Date | null) => {
            if (value === undefined) {
                setInternalValue(nextValue)
            }

            onChange?.(nextValue)
        },
        [onChange, value]
    )

    const parsedInputState = useMemo(
        () =>
            parseInputValue(inputValue, {
                inputFormat,
                minDate,
                maxDate,
                withTime,
                timeFormat,
                showSeconds,
                isDisabled,
            }),
        [inputFormat, inputValue, isDisabled, maxDate, minDate, showSeconds, timeFormat, withTime]
    )

    const currentDateForPanel = useMemo(() => {
        if (parsedInputState.status === 'valid') {
            return stripTime(parsedInputState.value)
        }

        return selectedValue ? stripTime(selectedValue) : null
    }, [parsedInputState, selectedValue])

    const currentTimeForPanel = useMemo(() => {
        if (!withTime) return null

        const timeSource =
            parsedInputState.status !== 'empty' && parsedInputState.timePart
                ? parsedInputState.timePart
                : draftTimeValue || getTimeDraftFromDate(selectedValue, showSeconds)

        return parseTimeWithFormat(timeSource, timeFormat) ?? {hours: 0, minutes: 0, seconds: 0}
    }, [draftTimeValue, parsedInputState, selectedValue, showSeconds, timeFormat, withTime])

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const nextTyped = formatTypedInput(event.target.value, {
                inputFormat,
                separator,
                withTime,
                timeFormat,
                showSeconds,
            })

            setInputValue(nextTyped.formatted)
            setDraftTimeValue(nextTyped.timePart)

            const nextParsedState = parseInputValue(nextTyped.formatted, {
                inputFormat,
                minDate,
                maxDate,
                withTime,
                timeFormat,
                showSeconds,
                isDisabled,
            })

            if (nextParsedState.status === 'empty') {
                emitValidation({valid: true})
                commitValue(null)
                return
            }

            if (nextParsedState.status === 'invalid' && validateOnChange) {
                emitValidation(nextParsedState.result)
            } else if (nextParsedState.status === 'valid') {
                emitValidation({valid: true})
                setViewDate(new Date(nextParsedState.value.getFullYear(), nextParsedState.value.getMonth(), 1))
                // Hold the commit until the time is fully typed so the formatter doesn't pad
                // partial minutes/seconds (e.g. "21:3" → "21:03") and overwrite the cursor while typing.
                // Blur falls back to 00:00 via the INVALID_TIME_ERROR retry if the user never finishes.
                const requiredTimeDigits = showSeconds ? 6 : 4
                const typedTimeDigits = withTime ? stripNonDigits(event.target.value).slice(8).length : 0
                const timeComplete = !withTime || typedTimeDigits >= requiredTimeDigits
                if (timeComplete) {
                    commitValue(nextParsedState.value)
                }
            }
        },
        [
            commitValue,
            emitValidation,
            inputFormat,
            isDisabled,
            maxDate,
            minDate,
            separator,
            showSeconds,
            timeFormat,
            validateOnChange,
            withTime,
        ]
    )

    const handleInputBlur = useCallback(() => {
        setTouched(true)

        const nextParsedState = parseInputValue(inputValue, {
            inputFormat,
            minDate,
            maxDate,
            withTime,
            timeFormat,
            showSeconds,
            isDisabled,
        })

        if (nextParsedState.status === 'empty') {
            emitValidation({valid: true})
            return
        }

        if (nextParsedState.status === 'partial') {
            if (validateOnBlur) {
                emitValidation({valid: false, error: 'Incomplete date'})
            }
            return
        }

        if (nextParsedState.status === 'invalid') {
            // Out-of-range time entry (e.g. 48:69) clamps to 00:00 on blur instead of staying invalid.
            if (withTime && nextParsedState.result.error === INVALID_TIME_ERROR && nextParsedState.datePart) {
                const fallbackTimePart = formatTimeWithFormat(0, 0, 0, showSeconds, timeFormat)
                const retry = parseInputValue(`${nextParsedState.datePart} ${fallbackTimePart}`, {
                    inputFormat,
                    minDate,
                    maxDate,
                    withTime,
                    timeFormat,
                    showSeconds,
                    isDisabled,
                })

                if (retry.status === 'valid') {
                    emitValidation({valid: true})
                    setInputValue(formatDisplayValue(retry.value, {format, withTime, timeFormat, showSeconds}))
                    setDraftTimeValue(getTimeDraftFromDate(retry.value, showSeconds))
                    commitValue(retry.value)
                    return
                }
            }

            if (validateOnBlur) {
                emitValidation(nextParsedState.result)
            }
            return
        }

        emitValidation({valid: true})
        setInputValue(formatDisplayValue(nextParsedState.value, {format, withTime, timeFormat, showSeconds}))
        setDraftTimeValue(getTimeDraftFromDate(nextParsedState.value, showSeconds))
        commitValue(nextParsedState.value)
    }, [
        commitValue,
        emitValidation,
        format,
        inputFormat,
        inputValue,
        isDisabled,
        maxDate,
        minDate,
        showSeconds,
        timeFormat,
        validateOnBlur,
        withTime,
    ])

    const handleInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(event.key)) {
                return
            }

            if (event.ctrlKey || event.metaKey) {
                return
            }

            const allowCharacter = withTime ? /^[0-9\s:./-APMapm]$/ : /^[0-9./-]$/

            if (!allowCharacter.test(event.key)) {
                event.preventDefault()
            }
        },
        [withTime]
    )

    const handleClear = useCallback(() => {
        setInputValue('')
        setDraftTimeValue('')
        setTouched(false)
        emitValidation({valid: true})
        commitValue(null)
    }, [commitValue, emitValidation])

    const handleTogglePopover = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            event.stopPropagation()

            if (disabled || readOnly || inline) return

            setOpen((current) => !current)
        },
        [disabled, inline, readOnly]
    )

    const handleSelectDate = useCallback(
        (date: Date) => {
            if (isDisabled(date)) return

            const nextTime = withTime ? draftTimeValue || formatTimeWithFormat(0, 0, 0, showSeconds, timeFormat) : ''
            const nextValue = withTime
                ? combineDateAndTime(date, nextTime, {format: timeFormat, showSeconds})
                : stripTime(date)

            setTouched(true)
            emitValidation({valid: true})
            setDraftTimeValue(nextTime)
            setInputValue(formatDisplayValue(nextValue, {format, withTime, timeFormat, showSeconds}))
            setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
            commitValue(nextValue)

            if (!withTime && !inline) {
                setOpen(false)
            }
        },
        [commitValue, draftTimeValue, emitValidation, format, inline, isDisabled, showSeconds, timeFormat, withTime]
    )

    const handleToday = useCallback(() => {
        const today = stripTime(new Date())

        if (isDisabled(today)) return

        handleSelectDate(today)
    }, [handleSelectDate, isDisabled])

    const hours = useMemo(() => {
        if (!withTime) return []

        const items: number[] = []
        const maxHour = timeFormat === '12h' ? 12 : 23
        const startHour = timeFormat === '12h' ? 1 : 0

        for (let index = startHour; index <= maxHour; index += 1) {
            items.push(index)
        }

        return items
    }, [timeFormat, withTime])

    const minutes = useMemo(() => {
        if (!withTime) return []

        const items: number[] = []

        for (let index = 0; index < 60; index += minuteStep) {
            items.push(index)
        }

        return items
    }, [minuteStep, withTime])

    const seconds = useMemo(() => {
        if (!withTime || !showSeconds) return []

        const items: number[] = []

        for (let index = 0; index < 60; index += 1) {
            items.push(index)
        }

        return items
    }, [showSeconds, withTime])

    const handleTimeSelection = useCallback(
        (hoursValue: number, minutesValue: number, secondsValue: number = 0) => {
            const formattedTime = formatTimeWithFormat(hoursValue, minutesValue, secondsValue, showSeconds, timeFormat)
            const nextDate = currentDateForPanel

            setTouched(true)
            setDraftTimeValue(formattedTime)

            if (!nextDate) {
                setInputValue(formattedTime)
                return
            }

            const nextValue = combineDateAndTime(nextDate, formattedTime, {format: timeFormat, showSeconds})

            emitValidation({valid: true})
            setInputValue(formatDisplayValue(nextValue, {format, withTime, timeFormat, showSeconds}))
            commitValue(nextValue)
        },
        [commitValue, currentDateForPanel, emitValidation, format, showSeconds, timeFormat, withTime]
    )

    const handleMeridiemChange = useCallback(
        (meridiem: Meridiem) => {
            const currentHours = currentTimeForPanel ? to12HourParts(currentTimeForPanel).hours : 12
            const nextHours = to24HourValue(currentHours, meridiem)

            handleTimeSelection(nextHours, currentTimeForPanel?.minutes ?? 0, currentTimeForPanel?.seconds ?? 0)
        },
        [currentTimeForPanel, handleTimeSelection]
    )

    const calendarDays = useMemo(
        () =>
            getMonthMatrix(viewDate, firstDayOfWeek).map((date) => ({
                date,
                currentMonth: date.getMonth() === viewDate.getMonth(),
            })),
        [firstDayOfWeek, viewDate]
    )

    const today = stripTime(new Date())
    const selectedDate = selectedValue ? stripTime(selectedValue) : currentDateForPanel

    const renderCalendar = () => (
        <div className="calendar">
            <div className="calendar-header">
                <button
                    type="button"
                    className="nav-btn"
                    onClick={() => setViewDate(addMonths(viewDate, -1))}
                    aria-label={texts.previousMonth}
                >
                    <ChevronLeftGlyphIcon />
                </button>
                <button
                    type="button"
                    className="header-title"
                    onClick={() => setViewMode((current) => (current === 'days' ? 'months' : 'days'))}
                >
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </button>
                <button
                    type="button"
                    className="nav-btn"
                    onClick={() => setViewDate(addMonths(viewDate, 1))}
                    aria-label={texts.nextMonth}
                >
                    <ChevronRightGlyphIcon />
                </button>
            </div>

            {viewMode === 'days' ? (
                <>
                    <div className="day-names">
                        {dayNames.map((dayName) => (
                            <span key={dayName} className="day-name">
                                {dayName}
                            </span>
                        ))}
                    </div>

                    <div className="day-grid">
                        {calendarDays.map(({date, currentMonth}, index) => {
                            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
                            const isToday = isSameDay(date, today)
                            const disabledDay = isDisabled(date)

                            return (
                                <button
                                    key={`${date.toISOString()}-${index}`}
                                    type="button"
                                    className={cn(
                                        'day',
                                        !currentMonth && 'other-month',
                                        isToday && 'today',
                                        isSelected && 'selected',
                                        disabledDay && 'disabled'
                                    )}
                                    onClick={() => handleSelectDate(date)}
                                    disabled={disabledDay}
                                    tabIndex={-1}
                                >
                                    {date.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </>
            ) : (
                <div className="month-grid">
                    {monthNames.map((monthName, index) => (
                        <button
                            key={monthName}
                            type="button"
                            className={cn('month-cell', viewDate.getMonth() === index && 'selected')}
                            onClick={() => {
                                setViewDate(new Date(viewDate.getFullYear(), index, 1))
                                setViewMode('days')
                            }}
                        >
                            {monthName.slice(0, 3)}
                        </button>
                    ))}
                </div>
            )}

            {showTodayButton && (
                <div className="footer">
                    <button type="button" className="today-btn" onClick={handleToday}>
                        {texts.today}
                    </button>
                </div>
            )}
        </div>
    )

    const renderTimePanel = () => {
        if (!withTime) return null

        const displayTime = currentTimeForPanel ? to12HourParts(currentTimeForPanel) : null

        return (
            <div className="date-picker-time-panel">
                <div className="date-picker-time-header">Time</div>
                <div className="date-picker-time-columns">
                    <TimeColumn
                        items={hours}
                        selected={timeFormat === '12h' ? displayTime?.hours : currentTimeForPanel?.hours}
                        onSelect={(hoursValue) =>
                            handleTimeSelection(
                                timeFormat === '12h'
                                    ? to24HourValue(hoursValue, displayTime?.meridiem ?? 'AM')
                                    : hoursValue,
                                currentTimeForPanel?.minutes ?? 0,
                                currentTimeForPanel?.seconds ?? 0
                            )
                        }
                        label="Hr"
                    />
                    <TimeColumn
                        items={minutes}
                        selected={currentTimeForPanel?.minutes}
                        onSelect={(minutesValue) =>
                            handleTimeSelection(
                                currentTimeForPanel?.hours ?? 0,
                                minutesValue,
                                currentTimeForPanel?.seconds ?? 0
                            )
                        }
                        label="Min"
                    />
                    {showSeconds && (
                        <TimeColumn
                            items={seconds}
                            selected={currentTimeForPanel?.seconds}
                            onSelect={(secondsValue) =>
                                handleTimeSelection(
                                    currentTimeForPanel?.hours ?? 0,
                                    currentTimeForPanel?.minutes ?? 0,
                                    secondsValue
                                )
                            }
                            label="Sec"
                        />
                    )}
                    {timeFormat === '12h' && (
                        <TimeColumn
                            items={['AM', 'PM']}
                            selected={displayTime?.meridiem}
                            onSelect={handleMeridiemChange}
                            label="AM/PM"
                        />
                    )}
                </div>
            </div>
        )
    }

    const renderPopoverContent = () => (
        <div className={cn('date-picker-popover-content', withTime && 'with-time')}>
            {renderCalendar()}
            {renderTimePanel()}
        </div>
    )

    const maxLength = withTime ? (timeFormat === '12h' ? (showSeconds ? 22 : 19) : showSeconds ? 19 : 16) : 10
    const inputPlaceholder = getInputPlaceholder(
        placeholder,
        format,
        withTime,
        timeFormat,
        showSeconds,
        timePlaceholder
    )

    if (inline) {
        return (
            <div
                className={cn('date-picker', color && `color-${color}`, fullWidth && 'full-width', className)}
                style={style}
            >
                <MInput
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    onClear={handleClear}
                    type="text"
                    inputMode={withTime ? 'text' : 'numeric'}
                    autoComplete="off"
                    maxLength={maxLength}
                    placeholder={inputPlaceholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    id={id}
                    variant={variant}
                    size={size}
                    color={color}
                    label={label}
                    helperText={helperText}
                    error={hasError}
                    errorText={resolvedErrorText}
                    required={required}
                    clearable={clearable}
                    fullWidth={fullWidth}
                />
                {renderPopoverContent()}
                {name && selectedValue && (
                    <input
                        type="hidden"
                        name={name}
                        value={formatHiddenDateValue(selectedValue, withTime, showSeconds)}
                    />
                )}
            </div>
        )
    }

    return (
        <div
            className={cn('date-picker', color && `color-${color}`, fullWidth && 'full-width', className)}
            style={style}
        >
            <div ref={anchorRef} className="date-picker-input-anchor">
                <MInput
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    onClear={handleClear}
                    type="text"
                    inputMode={withTime ? 'text' : 'numeric'}
                    autoComplete="off"
                    maxLength={maxLength}
                    placeholder={inputPlaceholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    id={id}
                    variant={variant}
                    size={size}
                    color={color}
                    label={label}
                    helperText={helperText}
                    error={hasError}
                    errorText={resolvedErrorText}
                    required={required}
                    clearable={clearable}
                    fullWidth={fullWidth}
                    endIcon={
                        <button
                            type="button"
                            className="date-picker-toggle"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={handleTogglePopover}
                            aria-label="Open calendar"
                            disabled={disabled || readOnly}
                        >
                            <MCalendarIcon />
                        </button>
                    }
                />
            </div>

            {name && selectedValue && (
                <input type="hidden" name={name} value={formatHiddenDateValue(selectedValue, withTime, showSeconds)} />
            )}

            <MPopover
                className="date-picker-popover"
                style={{'--color-rgb': colorRgbVar(color)} as React.CSSProperties}
                open={open}
                anchorRef={anchorRef}
                onClose={() => setOpen(false)}
                placement="bottom-start"
            >
                {renderPopoverContent()}
            </MPopover>
        </div>
    )
}

function TimeColumn<T extends number | Meridiem>({
    items,
    selected,
    onSelect,
    label,
}: {
    items: T[]
    selected?: T
    onSelect: (value: T) => void
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
        <div className="date-picker-time-column">
            <div className="date-picker-time-column-label">{label}</div>
            <div ref={listRef} className="date-picker-time-column-list">
                {items.map((item) => (
                    <button
                        key={item}
                        type="button"
                        data-value={item}
                        className={cn('date-picker-time-column-item', item === selected && 'selected')}
                        onClick={() => onSelect(item)}
                    >
                        {renderValue(item)}
                    </button>
                ))}
            </div>
        </div>
    )
}
