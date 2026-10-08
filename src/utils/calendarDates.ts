/**
 * Internal date helpers shared by the calendar family (MCalendarBoard, MTimelineBoard,
 * MMiniCalendar, MScheduler) and MDatePicker. Basic-safe: no Pro imports, not re-exported
 * from the package root. Every helper works in the browser's local time zone.
 */

export const MS_PER_MINUTE = 60_000
export const MS_PER_HOUR = 3_600_000
export const MS_PER_DAY = 24 * MS_PER_HOUR

export type CalendarWeekStart = 0 | 1

export function toDate(value: Date | string): Date {
    return value instanceof Date ? value : new Date(value)
}

export function isValidDate(value: Date): boolean {
    return !Number.isNaN(value.getTime())
}

export function parseHmToMinutes(value?: string): number | null {
    if (!value) {
        return null
    }
    const match = /^(\d{1,2}):(\d{2})$/.exec(value)
    if (!match) {
        return null
    }
    return Number(match[1]) * 60 + Number(match[2])
}

export function startOfDay(date: Date): Date {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    return next
}

export function stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Calendar day of `value` at local midnight. A date-only string (`yyyy-MM-dd`) is read as a
 * local day — `new Date('2026-09-24')` would read it as UTC midnight, which is the previous
 * day in every UTC−x zone.
 */
export function normalizeDate(value?: Date | string | null): Date | null {
    if (!value) {
        return null
    }
    if (typeof value === 'string') {
        const match = DATE_ONLY_PATTERN.exec(value.trim())
        if (match) {
            const local = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
            return local.getMonth() === Number(match[2]) - 1 ? local : null
        }
    }
    const parsed = toDate(value)
    if (!isValidDate(parsed)) {
        return null
    }
    return stripTime(parsed)
}

/** Adds calendar days (DST-safe, keeps the wall-clock time). */
export function addDays(date: Date, amount: number): Date {
    const next = new Date(date)
    next.setDate(next.getDate() + amount)
    return next
}

export function addMinutes(date: Date, amount: number): Date {
    return new Date(date.getTime() + amount * MS_PER_MINUTE)
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** First day of the month `amount` months away from `date`. */
export function addMonthsToMonth(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

/** Same day of month `amount` months away, clamped to the target month length. */
export function addMonthsClamped(date: Date, amount: number): Date {
    const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    target.setDate(Math.min(date.getDate(), lastDay))
    return target
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

export function startOfWeek(date: Date, weekStartsOn: CalendarWeekStart = 1): Date {
    const safeDate = stripTime(date)
    const delta = (safeDate.getDay() - weekStartsOn + 7) % 7
    return stripTime(addDays(safeDate, -delta))
}

export function getDateKey(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function isWeekend(date: Date): boolean {
    const day = date.getDay()
    return day === 0 || day === 6
}

/** Minutes elapsed since local midnight. */
export function minutesOfDay(date: Date): number {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

/** Whole calendar days between two dates (b - a), ignoring the time of day. */
export function diffCalendarDays(a: Date, b: Date): number {
    return Math.round((stripTime(b).getTime() - stripTime(a).getTime()) / MS_PER_DAY)
}

/** The 6 x 7 month grid starting on `weekStartsOn`, outside days included. */
export function getMonthMatrix(month: Date, weekStartsOn: CalendarWeekStart = 1): Date[] {
    const gridStart = startOfWeek(startOfMonth(month), weekStartsOn)
    return Array.from({length: 42}, (_, index) => stripTime(addDays(gridStart, index)))
}

/** Localised short weekday names, ordered from `weekStartsOn`. */
export function getWeekdayLabels(
    locale: string,
    weekStartsOn: CalendarWeekStart = 1,
    format: 'narrow' | 'short' | 'long' = 'short'
): string[] {
    const formatter = new Intl.DateTimeFormat(locale, {weekday: format})
    // 2023-01-01 was a Sunday.
    return Array.from({length: 7}, (_, index) => formatter.format(new Date(2023, 0, 1 + ((index + weekStartsOn) % 7))))
}

export function formatHourLabel(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {hour: '2-digit', minute: '2-digit', hour12: false}).format(date)
}

export function formatDayLabel(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {weekday: 'short', day: '2-digit', month: 'short'}).format(date)
}

export function formatShortWeekday(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {weekday: 'short'}).format(date)
}

export function formatRangeLabel(start: Date, end: Date, locale: string): string {
    return `${formatHourLabel(start, locale)} – ${formatHourLabel(end, locale)}`
}

export function formatFullDate(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}).format(
        date
    )
}

export function formatMonthTitle(date: Date, locale: string, withYear = true): string {
    return new Intl.DateTimeFormat(locale, withYear ? {month: 'long', year: 'numeric'} : {month: 'long'}).format(date)
}

type RangeFormatter = Intl.DateTimeFormat & {formatRange?: (start: Date, end: Date) => string}

/** "21 – 27 September 2026", "28 September – 4 October 2026", with a plain fallback. */
export function formatDateRange(start: Date, endInclusive: Date, locale: string): string {
    const formatter = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }) as RangeFormatter
    if (isSameDay(start, endInclusive)) {
        return formatter.format(start)
    }
    if (typeof formatter.formatRange === 'function') {
        return formatter.formatRange(start, endInclusive)
    }
    return `${formatter.format(start)} – ${formatter.format(endInclusive)}`
}

export type CalendarPeriodView = 'week' | 'day' | 'timeline' | 'month' | 'agenda'

/**
 * Toolbar title for a period. `end` is exclusive. Month uses the month that holds the
 * middle of the range, so a 6-week grid still reads "September 2026".
 */
export function formatPeriodTitle(view: CalendarPeriodView, start: Date, end: Date, locale: string): string {
    if (view === 'month') {
        const middle = new Date((start.getTime() + end.getTime()) / 2)
        return formatMonthTitle(middle, locale)
    }
    if (view === 'day' || view === 'timeline') {
        return formatFullDate(start, locale)
    }
    const lastDay = addDays(end, -1)
    return formatDateRange(start, lastDay, locale)
}
