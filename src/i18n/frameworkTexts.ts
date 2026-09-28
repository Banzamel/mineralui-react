import {useCallback, useMemo} from 'react'
import {useOptionalMI18n} from './MI18nProvider'

function useTranslate() {
    const i18n = useOptionalMI18n()

    return useCallback((key: string, fallback: string) => i18n?.t(key, fallback) ?? fallback, [i18n])
}

export interface MDatePickerTexts {
    today: string
    clear: string
    previousMonth: string
    nextMonth: string
}

export interface MDateRangePickerTexts extends MDatePickerTexts {
    rangeSubtitle: string
    defaultRangePlaceholder: string
    presets: {
        today: string
        days2: string
        days3: string
        days7: string
        days14: string
        days31: string
        thisMonth: string
        previousMonth: string
        months2: string
        months3: string
        months6: string
        year1: string
    }
}

export interface MCalendarBoardTexts {
    monthView: string
    weekView: string
    previousWeek: string
    nextWeek: string
    emptyStateText: string
    timelineTitle: string
    timelineEmptyState: string
    allDay: string
    allDayTab: string
    timelineTab: string
    itemsCount: (count: number) => string
}

export interface MFileManagerTexts {
    home: string
    searchPlaceholder: string
    emptyText: string
    folders: string
    noFoldersAvailable: string
    currentFolder: string
    filteredBy: (query: string) => string
    listView: string
    gridView: string
    folder: string
    file: string
    preview: string
    path: string
    selectItemToInspect: string
    itemsCount: (count: number) => string
    rename: string
    moveTo: string
    delete: string
    download: string
    newFolder: string
}

export function useMDatePickerTexts(): MDatePickerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            today: t('mineralui.datePicker.today', 'Today'),
            clear: t('mineralui.datePicker.clear', 'Clear'),
            previousMonth: t('mineralui.datePicker.previousMonth', 'Previous month'),
            nextMonth: t('mineralui.datePicker.nextMonth', 'Next month'),
        }),
        [t]
    )
}

export function useMDateRangePickerTexts(): MDateRangePickerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            today: t('mineralui.dateRangePicker.today', 'Today'),
            clear: t('mineralui.dateRangePicker.clear', 'Clear'),
            previousMonth: t('mineralui.dateRangePicker.previousMonth', 'Previous month'),
            nextMonth: t('mineralui.dateRangePicker.nextMonth', 'Next month'),
            rangeSubtitle: t('mineralui.dateRangePicker.rangeSubtitle', 'Select start and end dates in one panel.'),
            defaultRangePlaceholder: t('mineralui.dateRangePicker.defaultRangePlaceholder', 'Select date range...'),
            presets: {
                today: t('mineralui.dateRangePicker.presets.today', 'Today'),
                days2: t('mineralui.dateRangePicker.presets.days2', '2 days'),
                days3: t('mineralui.dateRangePicker.presets.days3', '3 days'),
                days7: t('mineralui.dateRangePicker.presets.days7', '7 days'),
                days14: t('mineralui.dateRangePicker.presets.days14', '14 days'),
                days31: t('mineralui.dateRangePicker.presets.days31', '31 days'),
                thisMonth: t('mineralui.dateRangePicker.presets.thisMonth', 'This month'),
                previousMonth: t('mineralui.dateRangePicker.presets.previousMonth', 'Previous month'),
                months2: t('mineralui.dateRangePicker.presets.months2', '2 months'),
                months3: t('mineralui.dateRangePicker.presets.months3', '3 months'),
                months6: t('mineralui.dateRangePicker.presets.months6', '6 months'),
                year1: t('mineralui.dateRangePicker.presets.year1', '1 year'),
            },
        }),
        [t]
    )
}

export function useMCalendarBoardTexts(): MCalendarBoardTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            monthView: t('mineralui.calendarBoard.monthView', 'Month'),
            weekView: t('mineralui.calendarBoard.weekView', 'Week'),
            previousWeek: t('mineralui.calendarBoard.previousWeek', 'Previous week'),
            nextWeek: t('mineralui.calendarBoard.nextWeek', 'Next week'),
            emptyStateText: t('mineralui.calendarBoard.emptyStateText', 'No events for the selected day.'),
            timelineTitle: t('mineralui.calendarBoard.timelineTitle', 'Daily timeline'),
            timelineEmptyState: t('mineralui.calendarBoard.timelineEmptyState', 'No events in this hour.'),
            allDay: t('mineralui.calendarBoard.allDay', 'All day'),
            allDayTab: t('mineralui.calendarBoard.allDayTab', 'All day'),
            timelineTab: t('mineralui.calendarBoard.timelineTab', 'Hourly timeline'),
            itemsCount: (count) =>
                t('mineralui.calendarBoard.itemsCount', '{count} items').replace('{count}', String(count)),
        }),
        [t]
    )
}

export function useMFileManagerTexts(): MFileManagerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            home: t('mineralui.fileManager.home', 'Home'),
            searchPlaceholder: t('mineralui.fileManager.searchPlaceholder', 'Search in folder...'),
            emptyText: t('mineralui.fileManager.emptyText', 'This folder is empty.'),
            folders: t('mineralui.fileManager.folders', 'Folders'),
            noFoldersAvailable: t('mineralui.fileManager.noFoldersAvailable', 'No folders available.'),
            currentFolder: t('mineralui.fileManager.currentFolder', 'Current folder'),
            filteredBy: (query) =>
                t('mineralui.fileManager.filteredBy', 'Filtered by "{query}"').replace('{query}', query),
            listView: t('mineralui.fileManager.listView', 'List'),
            gridView: t('mineralui.fileManager.gridView', 'Grid'),
            folder: t('mineralui.fileManager.folder', 'Folder'),
            file: t('mineralui.fileManager.file', 'File'),
            preview: t('mineralui.fileManager.preview', 'Preview'),
            path: t('mineralui.fileManager.path', 'Path'),
            selectItemToInspect: t(
                'mineralui.fileManager.selectItemToInspect',
                'Select a file or folder to inspect its details.'
            ),
            itemsCount: (count) =>
                t('mineralui.fileManager.itemsCount', '{count} items').replace('{count}', String(count)),
            rename: t('mineralui.fileManager.rename', 'Rename'),
            moveTo: t('mineralui.fileManager.moveTo', 'Move to...'),
            delete: t('mineralui.fileManager.delete', 'Delete'),
            download: t('mineralui.fileManager.download', 'Download'),
            newFolder: t('mineralui.fileManager.newFolder', 'New folder'),
        }),
        [t]
    )
}

// Cookie-consent texts moved to @banzamel/honey in mineralui-pro 2.0.0.
// Consumers that need to retheme cookie copy now pass `texts` directly to
// `<CookieConsentProvider>` from `@banzamel/honey`.

/** Count-bearing texts accept a `{count}` template or a function, so apps can pluralise. */
export type MSchedulerCountText = string | ((count: number) => string)

export interface MSchedulerTexts {
    today: string
    previous: string
    next: string
    chooseDate: string
    add: string
    viewLabel: string
    viewWeek: string
    viewDay: string
    viewMonth: string
    viewAgenda: string
    showWeekends: string
    filters: string
    filtersActive: MSchedulerCountText
    clearFilters: string
    allOption: string
    searchPlaceholder: string
    noOptions: string
    allDay: string
    more: MSchedulerCountText
    /** `{count}` and `{date}` placeholders. */
    moreAria: string
    eventCount: MSchedulerCountText
    emptyState: string
    loading: string
    now: string
    recurring: string
    cancelled: string
    conflict: string
    eventDetails: string
    eventActions: string
    close: string
    participants: MSchedulerCountText
    /** `{count}` and `{capacity}` placeholders. */
    participantsCapacity: string
    location: string
    /** `{title}` placeholder, announced on every period change. */
    periodAnnouncement: string
    /** `{date}` placeholder — label of a day-number button. */
    openDay: string
    viewTimeline: string
    /** `{view}` and `{set}` placeholders — view-menu entry of a resource set. */
    viewWithSet: string
    move: string
    resize: string
    moveInstructions: string
    /** Announced when the keyboard move mode starts in the month view. */
    moveInstructionsMonth: string
    /** Appended to the native tooltip of a draggable event. */
    dragHint: string
    /** `{title}` and `{when}` placeholders. */
    moved: string
    /** `{title}` and `{time}` placeholders. */
    resized: string
    moveRefused: string
    moveCancelled: string
    unavailable: string
    blocked: string
    /** Caption above the leader row in the event details. */
    leader: string
    /** Visible label of the "open this day" action in the month "+N more" popover. */
    openDayView: string
    /** Toolbar button shown in the day view after a drill-down from the month view. */
    backToMonth: string
}

function polishPlural(count: number, one: string, few: string, many: string): string {
    const mod10 = count % 10
    const mod100 = count % 100
    if (count === 1) {
        return one
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return few
    }
    return many
}

export const mineralSchedulerTextsEn: MSchedulerTexts = {
    today: 'Today',
    previous: 'Previous period',
    next: 'Next period',
    chooseDate: 'Choose date',
    add: 'Add',
    viewLabel: 'View',
    viewWeek: 'Week',
    viewDay: 'Day',
    viewMonth: 'Month',
    viewAgenda: 'Agenda',
    showWeekends: 'Show weekends',
    filters: 'Filters',
    filtersActive: 'Filters ({count})',
    clearFilters: 'Clear filters',
    allOption: 'All',
    searchPlaceholder: 'Search…',
    noOptions: 'No results',
    allDay: 'All day',
    more: '+{count} more',
    moreAria: 'Show {count} more events on {date}',
    eventCount: (count) => (count === 1 ? '1 event' : `${count} events`),
    emptyState: 'No events to display',
    loading: 'Loading events',
    now: 'Now',
    recurring: 'Recurring',
    cancelled: 'Cancelled',
    conflict: 'Conflict',
    eventDetails: 'Event details',
    eventActions: 'Event actions',
    close: 'Close',
    participants: 'Participants ({count})',
    participantsCapacity: 'Participants ({count} / {capacity})',
    location: 'Location',
    periodAnnouncement: '{title}',
    openDay: 'Open {date}',
    viewTimeline: 'Timeline',
    viewWithSet: '{view} – {set}',
    move: 'Move',
    resize: 'Resize',
    moveInstructions: 'Arrows move, Shift+arrows move by an hour, Enter drops, Escape cancels.',
    moveInstructionsMonth: 'Left and right arrows move by a day, up and down by a week, Enter drops, Escape cancels.',
    dragHint: 'Drag to move',
    moved: '{title} moved to {when}',
    resized: '{title} now ends at {time}',
    moveRefused: 'Cannot move here',
    moveCancelled: 'Move cancelled',
    unavailable: 'Unavailable',
    blocked: 'Blocked',
    leader: 'Leader',
    openDayView: 'Open day',
    backToMonth: 'Back to month',
}

export const mineralSchedulerTextsPl: MSchedulerTexts = {
    today: 'Dzisiaj',
    previous: 'Poprzedni okres',
    next: 'Następny okres',
    chooseDate: 'Wybierz datę',
    add: 'Dodaj',
    viewLabel: 'Widok',
    viewWeek: 'Tydzień',
    viewDay: 'Dzień',
    viewMonth: 'Miesiąc',
    viewAgenda: 'Lista',
    showWeekends: 'Pokaż weekendy',
    filters: 'Filtry',
    filtersActive: 'Filtry ({count})',
    clearFilters: 'Wyczyść filtry',
    allOption: 'Wszystkie',
    searchPlaceholder: 'Szukaj…',
    noOptions: 'Brak wyników',
    allDay: 'Cały dzień',
    more: '+{count} więcej',
    moreAria: 'Pokaż {count} więcej wydarzeń w dniu {date}',
    eventCount: (count) => `${count} ${polishPlural(count, 'wydarzenie', 'wydarzenia', 'wydarzeń')}`,
    emptyState: 'Brak wydarzeń do wyświetlenia',
    loading: 'Wczytywanie wydarzeń',
    now: 'Teraz',
    recurring: 'Cykliczne',
    cancelled: 'Odwołane',
    conflict: 'Konflikt',
    eventDetails: 'Szczegóły wydarzenia',
    eventActions: 'Akcje wydarzenia',
    close: 'Zamknij',
    participants: 'Uczestnicy ({count})',
    participantsCapacity: 'Uczestnicy ({count} / {capacity})',
    location: 'Miejsce',
    periodAnnouncement: '{title}',
    openDay: 'Otwórz {date}',
    viewTimeline: 'Oś czasu',
    viewWithSet: '{view} – {set}',
    move: 'Przenieś',
    resize: 'Zmień długość',
    moveInstructions: 'Strzałki przesuwają, Shift+strzałki o godzinę, Enter upuszcza, Escape anuluje.',
    moveInstructionsMonth:
        'Strzałki w lewo i w prawo przesuwają o dzień, w górę i w dół o tydzień, Enter upuszcza, Escape anuluje.',
    dragHint: 'Przeciągnij, aby przenieść',
    moved: '{title} przeniesiono na {when}',
    resized: '{title} kończy się o {time}',
    moveRefused: 'Nie można tu przenieść',
    moveCancelled: 'Anulowano przenoszenie',
    unavailable: 'Niedostępne',
    blocked: 'Zablokowane',
    leader: 'Prowadzący',
    openDayView: 'Otwórz dzień',
    backToMonth: 'Wróć do miesiąca',
}

/** Fills `{name}` placeholders. */
export function formatMText(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** Resolves a count text (template or function) for `count`. */
export function formatMCountText(text: MSchedulerCountText, count: number): string {
    return typeof text === 'function' ? text(count) : formatMText(text, {count})
}

function isPolishLocale(locale?: string): boolean {
    return Boolean(locale && locale.toLowerCase().startsWith('pl'))
}

/**
 * Scheduler texts. Resolution per key: `overrides` → MI18nProvider key
 * `mineralui.scheduler.<key>` → built-in default for `locale` (Polish or English).
 */
export function useMSchedulerTexts(locale?: string, overrides?: Partial<MSchedulerTexts>): MSchedulerTexts {
    const t = useTranslate()

    return useMemo(() => {
        const defaults = isPolishLocale(locale) ? mineralSchedulerTextsPl : mineralSchedulerTextsEn
        const resolved = {} as Record<keyof MSchedulerTexts, MSchedulerTexts[keyof MSchedulerTexts]>
        ;(Object.keys(defaults) as Array<keyof MSchedulerTexts>).forEach((key) => {
            const override = overrides?.[key]
            if (override !== undefined) {
                resolved[key] = override
                return
            }
            const fallback = defaults[key]
            const i18nKey = `mineralui.scheduler.${key}`
            const translated = t(i18nKey, typeof fallback === 'string' ? fallback : i18nKey)
            resolved[key] = typeof fallback === 'function' && translated === i18nKey ? fallback : translated
        })
        return resolved as MSchedulerTexts
    }, [t, locale, overrides])
}

export interface MMiniCalendarTexts {
    previousMonth: string
    nextMonth: string
}

export function useMMiniCalendarTexts(locale?: string, overrides?: Partial<MMiniCalendarTexts>): MMiniCalendarTexts {
    const t = useTranslate()

    return useMemo(() => {
        const polish = isPolishLocale(locale)
        return {
            previousMonth:
                overrides?.previousMonth ??
                t('mineralui.miniCalendar.previousMonth', polish ? 'Poprzedni miesiąc' : 'Previous month'),
            nextMonth:
                overrides?.nextMonth ??
                t('mineralui.miniCalendar.nextMonth', polish ? 'Następny miesiąc' : 'Next month'),
        }
    }, [t, locale, overrides])
}
