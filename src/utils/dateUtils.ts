// Return the number of days for a month in a given year.
export function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}

// Return the first weekday index for the given month.
export function firstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay()
}

// Compare two dates using only the calendar day.
export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Check whether a date falls inside optional min and max boundaries.
export function isDateInRange(date: Date, min?: Date | null, max?: Date | null): boolean {
    return (!min || date >= stripTime(min)) && (!max || date <= stripTime(max))
}

// Drop the time portion to make date comparisons predictable.
export function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Shift a date by a number of whole months, clamping the day to the target month length
// (31 Jan + 1 month = 28/29 Feb, not 3 Mar). The time of day is preserved.
export function addMonths(date: Date, count: number): Date {
    const result = new Date(date)
    const day = result.getDate()
    result.setDate(1)
    result.setMonth(result.getMonth() + count)
    result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())))
    return result
}

// Shift a date by a number of whole years, clamping 29 Feb to 28 Feb in non-leap years.
export function addYears(date: Date, count: number): Date {
    return addMonths(date, count * 12)
}

// Pad numeric date parts to two digits.
const pad = (n: number): string => n.toString().padStart(2, '0')

// Format a date with a lightweight token format.
export function formatDate(date: Date, format: string = 'dd.MM.yyyy'): string {
    const day = pad(date.getDate())
    const month = pad(date.getMonth() + 1)
    const year = date.getFullYear().toString()

    return format.replace('dd', day).replace('MM', month).replace('yyyy', year)
}

// Parse a date string according to the provided lightweight token format.
export function parseDate(value: string, format: string = 'dd.MM.yyyy'): Date | null {
    const dayIdx = format.indexOf('dd')
    const monthIdx = format.indexOf('MM')
    const yearIdx = format.indexOf('yyyy')

    if (dayIdx === -1 || monthIdx === -1 || yearIdx === -1) return null

    const day = parseInt(value.slice(dayIdx, dayIdx + 2), 10)
    const month = parseInt(value.slice(monthIdx, monthIdx + 2), 10)
    const year = parseInt(value.slice(yearIdx, yearIdx + 4), 10)

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null
    if (month < 1 || month > 12) return null
    if (day < 1 || day > daysInMonth(year, month - 1)) return null

    return new Date(year, month - 1, day)
}

function normalizeWeekdayLabel(label: string): string {
    return label.replace(/\.$/u, '')
}

// Return localized short day names for calendar headers.
export function getDayNames(locale: string = 'en', firstDayOfWeek: 0 | 1 = 1): string[] {
    const formatter = new Intl.DateTimeFormat(locale, {weekday: 'short'})
    const sunday = new Date(Date.UTC(2021, 7, 1))
    const dayNames = Array.from({length: 7}, (_, index) => {
        const date = new Date(sunday)
        date.setUTCDate(sunday.getUTCDate() + index)
        return normalizeWeekdayLabel(formatter.format(date))
    })

    return firstDayOfWeek === 1 ? [...dayNames.slice(1), dayNames[0]] : dayNames
}

// Return localized month names for pickers and headers.
export function getMonthNames(locale: string = 'en'): string[] {
    const formatter = new Intl.DateTimeFormat(locale, {month: 'long'})

    return Array.from({length: 12}, (_, month) => formatter.format(new Date(Date.UTC(2021, month, 1))))
}

// Parse a time string into numeric hour, minute and second parts.
export function parseTime(value: string): {hours: number; minutes: number; seconds: number} | null {
    const parts = value.split(':')
    if (parts.length < 2) return null

    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const seconds = parts.length > 2 ? parseInt(parts[2], 10) : 0

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null

    return {hours, minutes, seconds}
}

// Format time values with optional seconds output.
export function formatTime(hours: number, minutes: number, seconds?: number, showSeconds: boolean = false): string {
    const base = `${pad(hours)}:${pad(minutes)}`
    return showSeconds ? `${base}:${pad(seconds ?? 0)}` : base
}

type Meridiem = 'AM' | 'PM'

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

// Parse a time string in either 24h or 12h format.
export function parseTimeWithFormat(
    value: string,
    format: '24h' | '12h' = '24h'
): {hours: number; minutes: number; seconds: number} | null {
    if (format === '24h') {
        return parseTime(value)
    }

    const normalized = value.trim().toUpperCase()
    const match = normalized.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/)

    if (!match) {
        return parseTime(value)
    }

    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    const seconds = match[3] ? parseInt(match[3], 10) : 0
    const meridiem = match[4] as Meridiem

    if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) {
        return null
    }

    return {hours: to24HourValue(hours, meridiem), minutes, seconds}
}

// Format a time string in either 24h or 12h format.
export function formatTimeWithFormat(
    hours: number,
    minutes: number,
    seconds: number = 0,
    showSeconds: boolean = false,
    format: '24h' | '12h' = '24h'
): string {
    if (format === '24h') {
        return formatTime(hours, minutes, seconds, showSeconds)
    }

    const parts = to12HourParts({hours, minutes, seconds})
    const base = `${pad(parts.hours)}:${pad(parts.minutes)}`
    const withSeconds = showSeconds ? `${base}:${pad(parts.seconds)}` : base

    return `${withSeconds} ${parts.meridiem}`
}

// Combine a calendar date with an optional time string into one Date value.
export function combineDateAndTime(
    date: Date,
    timeValue?: string | null,
    options: {format?: '24h' | '12h'; showSeconds?: boolean} = {}
): Date {
    const {format = '24h', showSeconds = false} = options
    const parsedTime = timeValue ? parseTimeWithFormat(timeValue, format) : null

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parsedTime?.hours ?? 0,
        parsedTime?.minutes ?? 0,
        showSeconds ? (parsedTime?.seconds ?? 0) : 0
    )
}

// Format the hidden input value without applying a timezone conversion.
export function formatHiddenDateValue(date: Date, withTime: boolean = false, showSeconds: boolean = false): string {
    const datePart = formatDate(date, 'yyyy-MM-dd')

    if (!withTime) {
        return datePart
    }

    return `${datePart}T${formatTime(date.getHours(), date.getMinutes(), date.getSeconds(), showSeconds)}`
}
