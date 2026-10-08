import {useCallback, useMemo} from 'react'
import {useOptionalMI18n} from './MI18nProvider'
import type {ValidationResult} from '../utils/validators'
import {fillValidationTemplate, getValidationMessageInfo} from '../utils/validationMessages'

function useTranslate() {
    const i18n = useOptionalMI18n()

    return useCallback((key: string, fallback: string) => i18n?.t(key, fallback) ?? fallback, [i18n])
}

export interface MDatePickerTexts {
    today: string
    clear: string
    previousMonth: string
    nextMonth: string
    /** Accessible name of the calendar dialog when the field has no label. */
    dialogLabel: string
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
    addEvent: string
    dayActions: string
    open: string
    edit: string
    delete: string
    overlap: string
    status: {
        planned: string
        active: string
        done: string
        cancelled: string
    }
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
    /** Accessible name of the breadcrumb `<nav>`. */
    breadcrumbs: string
    /** Accessible name of the list / grid view switch. */
    view: string
}

export function useMDatePickerTexts(): MDatePickerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            today: t('mineralui.datePicker.today', 'Today'),
            clear: t('mineralui.datePicker.clear', 'Clear'),
            previousMonth: t('mineralui.datePicker.previousMonth', 'Previous month'),
            nextMonth: t('mineralui.datePicker.nextMonth', 'Next month'),
            dialogLabel: t('mineralui.datePicker.dialogLabel', 'Choose date'),
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
            dialogLabel: t('mineralui.dateRangePicker.dialogLabel', 'Choose date range'),
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
            addEvent: t('mineralui.calendarBoard.addEvent', 'Add event'),
            dayActions: t('mineralui.calendarBoard.dayActions', 'Day actions'),
            open: t('mineralui.calendarBoard.open', 'Open'),
            edit: t('mineralui.calendarBoard.edit', 'Edit'),
            delete: t('mineralui.calendarBoard.delete', 'Delete'),
            overlap: t('mineralui.calendarBoard.overlap', 'Overlap'),
            status: {
                planned: t('mineralui.calendarBoard.status.planned', 'planned'),
                active: t('mineralui.calendarBoard.status.active', 'active'),
                done: t('mineralui.calendarBoard.status.done', 'done'),
                cancelled: t('mineralui.calendarBoard.status.cancelled', 'cancelled'),
            },
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
            breadcrumbs: t('mineralui.fileManager.breadcrumbs', 'Breadcrumbs'),
            view: t('mineralui.fileManager.view', 'View'),
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

export interface MWeekGridTexts {
    /** Legend scale text. Placeholders: `{min}`, `{max}`, `{unit}` (with a leading space when set). */
    scale: string
    /** Default density-band labels, lowest to highest. */
    bands: [string, string, string, string]
    /** Accessible name of an interactive cell. Placeholders: `{day}`, `{slot}`, `{value}`. */
    cellLabel: string
    /**
     * Default short day labels, Sunday first
     * (`mineralui.weekGrid.days.sun|mon|tue|wed|thu|fri|sat`).
     */
    days: [string, string, string, string, string, string, string]
}

/**
 * MWeekGrid texts. Resolution per key: MI18nProvider key `mineralui.weekGrid.<key>`
 * (bands: `mineralui.weekGrid.bands.none|few|some|many`) → built-in English default.
 */
export function useMWeekGridTexts(): MWeekGridTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            scale: t('mineralui.weekGrid.scale', 'Scale: {min} — {max}{unit}'),
            bands: [
                t('mineralui.weekGrid.bands.none', 'None'),
                t('mineralui.weekGrid.bands.few', 'Few'),
                t('mineralui.weekGrid.bands.some', 'Some'),
                t('mineralui.weekGrid.bands.many', 'Many'),
            ],
            cellLabel: t('mineralui.weekGrid.cellLabel', '{day} {slot}: {value}'),
            days: [
                t('mineralui.weekGrid.days.sun', 'Sun'),
                t('mineralui.weekGrid.days.mon', 'Mon'),
                t('mineralui.weekGrid.days.tue', 'Tue'),
                t('mineralui.weekGrid.days.wed', 'Wed'),
                t('mineralui.weekGrid.days.thu', 'Thu'),
                t('mineralui.weekGrid.days.fri', 'Fri'),
                t('mineralui.weekGrid.days.sat', 'Sat'),
            ],
        }),
        [t]
    )
}

/** Shared accessible names and short labels used across components. */
export interface MCommonTexts {
    close: string
    dismiss: string
    remove: string
    /** Placeholder: `{name}`. */
    removeItem: string
    clearInput: string
    clearSelection: string
    clearTime: string
    clearFiles: string
    clearCode: string
    increment: string
    decrement: string
    increase: string
    decrease: string
    moreOptions: string
    scrollToTop: string
    openMenu: string
    openCalendar: string
    loading: string
    preview: string
    imagePreview: string
    closePreview: string
    /** Placeholder: `{name}`. */
    previewItem: string
    image: string
    /** Placeholder: `{index}`. */
    imageNumber: string
    previousImage: string
    nextImage: string
    previousSlide: string
    nextSlide: string
    /** Placeholder: `{index}`. */
    slideNumber: string
    dragToClose: string
    scrollLeft: string
    scrollRight: string
    editTile: string
    expandTile: string
    removeTile: string
    expirationDate: string
    postalCodeCountry: string
    /** Placeholder: `{index}`. */
    digitNumber: string
    removeImage: string
    emoji: string
    attachImage: string
    send: string
    eventActions: string
    documentActions: string
    dayNavigator: string
    previousDay: string
    nextDay: string
    timeline: string
}

/**
 * Common texts. Resolution per key: MI18nProvider key `mineralui.common.<key>`
 * → built-in English default.
 */
export function useMCommonTexts(): MCommonTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            close: t('mineralui.common.close', 'Close'),
            dismiss: t('mineralui.common.dismiss', 'Dismiss'),
            remove: t('mineralui.common.remove', 'Remove'),
            removeItem: t('mineralui.common.removeItem', 'Remove {name}'),
            clearInput: t('mineralui.common.clearInput', 'Clear input'),
            clearSelection: t('mineralui.common.clearSelection', 'Clear selection'),
            clearTime: t('mineralui.common.clearTime', 'Clear time'),
            clearFiles: t('mineralui.common.clearFiles', 'Clear files'),
            clearCode: t('mineralui.common.clearCode', 'Clear code'),
            increment: t('mineralui.common.increment', 'Increment'),
            decrement: t('mineralui.common.decrement', 'Decrement'),
            increase: t('mineralui.common.increase', 'Increase'),
            decrease: t('mineralui.common.decrease', 'Decrease'),
            moreOptions: t('mineralui.common.moreOptions', 'More options'),
            scrollToTop: t('mineralui.common.scrollToTop', 'Scroll to top'),
            openMenu: t('mineralui.common.openMenu', 'Open menu'),
            openCalendar: t('mineralui.common.openCalendar', 'Open calendar'),
            loading: t('mineralui.common.loading', 'Loading'),
            preview: t('mineralui.common.preview', 'Preview'),
            imagePreview: t('mineralui.common.imagePreview', 'Image preview'),
            closePreview: t('mineralui.common.closePreview', 'Close preview'),
            previewItem: t('mineralui.common.previewItem', 'Preview {name}'),
            image: t('mineralui.common.image', 'image'),
            imageNumber: t('mineralui.common.imageNumber', 'Image {index}'),
            previousImage: t('mineralui.common.previousImage', 'Previous image'),
            nextImage: t('mineralui.common.nextImage', 'Next image'),
            previousSlide: t('mineralui.common.previousSlide', 'Previous slide'),
            nextSlide: t('mineralui.common.nextSlide', 'Next slide'),
            slideNumber: t('mineralui.common.slideNumber', 'Slide {index}'),
            dragToClose: t('mineralui.common.dragToClose', 'Drag down to close'),
            scrollLeft: t('mineralui.common.scrollLeft', 'Scroll topbar left'),
            scrollRight: t('mineralui.common.scrollRight', 'Scroll topbar right'),
            editTile: t('mineralui.common.editTile', 'Edit tile'),
            expandTile: t('mineralui.common.expandTile', 'Expand tile'),
            removeTile: t('mineralui.common.removeTile', 'Remove tile'),
            expirationDate: t('mineralui.common.expirationDate', 'Expiration date'),
            postalCodeCountry: t('mineralui.common.postalCodeCountry', 'Postal code country'),
            digitNumber: t('mineralui.common.digitNumber', 'Digit {index}'),
            removeImage: t('mineralui.common.removeImage', 'Remove image'),
            emoji: t('mineralui.common.emoji', 'Emoji'),
            attachImage: t('mineralui.common.attachImage', 'Attach image'),
            send: t('mineralui.common.send', 'Send'),
            eventActions: t('mineralui.common.eventActions', 'Event actions'),
            documentActions: t('mineralui.common.documentActions', 'Open document actions'),
            dayNavigator: t('mineralui.common.dayNavigator', 'Day navigator'),
            previousDay: t('mineralui.common.previousDay', 'Previous day'),
            nextDay: t('mineralui.common.nextDay', 'Next day'),
            timeline: t('mineralui.common.timeline', 'Timeline'),
        }),
        [t]
    )
}

export interface MTimelineBoardTexts {
    /** Placeholder: `{count}`. */
    eventsCount: string
    /** Placeholder: `{count}`. */
    eventsWithConflicts: string
    /** Placeholder: `{count}` (days). */
    conflictBefore: string
    /** Placeholder: `{count}` (days). */
    conflictAfter: string
    /** Placeholder: `{count}`. */
    overlappingEvents: string
    emptyState: string
    loading: string
    dropRejected: string
    conflict: string
    /** Placeholder: `{count}`. */
    participants: string
    /** Placeholders: `{count}`, `{capacity}`. */
    participantsWithCapacity: string
    /** Keyboard move mode (M on a draggable event): announced on start and shown next to the event. */
    moveInstructions: string
    /** Announced after every keyboard move step. Placeholders: `{title}`, `{row}`, `{when}`. */
    movePosition: string
    /** Announced after a keyboard drop. Placeholders: `{title}`, `{row}`, `{when}`. */
    moved: string
    moveCancelled: string
}

/**
 * MTimelineBoard texts. Resolution per key: MI18nProvider key `mineralui.timelineBoard.<key>`
 * → built-in English default.
 */
export function useMTimelineBoardTexts(): MTimelineBoardTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            eventsCount: t('mineralui.timelineBoard.eventsCount', '{count} events'),
            eventsWithConflicts: t('mineralui.timelineBoard.eventsWithConflicts', '{count} events with conflicts'),
            conflictBefore: t('mineralui.timelineBoard.conflictBefore', 'Conflict {count} day(s) earlier'),
            conflictAfter: t('mineralui.timelineBoard.conflictAfter', 'Conflict in {count} day(s)'),
            overlappingEvents: t('mineralui.timelineBoard.overlappingEvents', '{count} overlapping events'),
            emptyState: t('mineralui.timelineBoard.emptyState', 'No events to show'),
            loading: t('mineralui.timelineBoard.loading', 'Loading…'),
            dropRejected: t('mineralui.timelineBoard.dropRejected', 'The event cannot be moved there.'),
            conflict: t('mineralui.timelineBoard.conflict', 'Conflict'),
            participants: t('mineralui.timelineBoard.participants', 'Participants ({count})'),
            participantsWithCapacity: t(
                'mineralui.timelineBoard.participantsWithCapacity',
                'Participants ({count} / {capacity})'
            ),
            moveInstructions: t(
                'mineralui.timelineBoard.moveInstructions',
                'Left and right arrows move in time, Shift+arrows by an hour, up and down change the row, Enter drops, Escape cancels.'
            ),
            movePosition: t('mineralui.timelineBoard.movePosition', '{title}: {row}, {when}'),
            moved: t('mineralui.timelineBoard.moved', '{title} moved to {row}, {when}'),
            moveCancelled: t('mineralui.timelineBoard.moveCancelled', 'Move cancelled'),
        }),
        [t]
    )
}

/** Accessible names used by the layout components (MBreadcrumb, MPagination, MNavbar). */
export interface MLayoutTexts {
    breadcrumbLabel: string
    paginationLabel: string
    previousPage: string
    nextPage: string
    /** Placeholder: `{page}`. */
    pageNumber: string
    navbarMenu: string
    sidebarExpand: string
    sidebarCollapse: string
    /** MBreadcrumb ellipsis button that reveals the collapsed crumbs. Placeholder: `{count}`. */
    breadcrumbShowHidden: string
    /** Accessible name of the MSidebar mobile drawer (modal dialog). */
    sidebarDialogLabel: string
    /** MCanvasGrid fallback tile name when `getItemLabel` is not set. Placeholder: `{number}`. */
    canvasGridTile: string
    /** MCanvasGrid tile button names. Placeholder: `{label}`. */
    canvasGridEdit: string
    canvasGridExpand: string
    canvasGridRemove: string
    /** MCanvasGrid keyboard move / resize handle. Placeholder: `{label}`. */
    canvasGridHandle: string
    /** MCanvasGrid keyboard instructions (description of the handle). */
    canvasGridInstructions: string
    /** Placeholders: `{label}`, `{column}`, `{row}`, `{width}`, `{height}`. */
    canvasGridGrabbed: string
    /** Placeholders: `{label}`, `{column}`, `{row}`, `{width}`, `{height}`. */
    canvasGridPosition: string
    /** Placeholders: `{label}`, `{column}`, `{row}`, `{width}`, `{height}`. */
    canvasGridDropped: string
    /** Placeholder: `{label}`. */
    canvasGridCancelled: string
}

/**
 * Layout texts. Resolution per key: MI18nProvider keys `mineralui.breadcrumb.label`,
 * `mineralui.pagination.label|previous|next|page`, `mineralui.navbar.menu`,
 * `mineralui.sidebar.expand|collapse|dialogLabel`, `mineralui.breadcrumb.showHidden`,
 * `mineralui.canvasGrid.*` → built-in English default.
 */
export function useMLayoutTexts(): MLayoutTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            breadcrumbLabel: t('mineralui.breadcrumb.label', 'breadcrumb'),
            paginationLabel: t('mineralui.pagination.label', 'pagination'),
            previousPage: t('mineralui.pagination.previous', 'Previous page'),
            nextPage: t('mineralui.pagination.next', 'Next page'),
            pageNumber: t('mineralui.pagination.page', 'Page {page}'),
            navbarMenu: t('mineralui.navbar.menu', 'Open navigation'),
            sidebarExpand: t('mineralui.sidebar.expand', 'Expand sidebar'),
            sidebarCollapse: t('mineralui.sidebar.collapse', 'Collapse sidebar'),
            breadcrumbShowHidden: t('mineralui.breadcrumb.showHidden', 'Show {count} hidden items'),
            sidebarDialogLabel: t('mineralui.sidebar.dialogLabel', 'Navigation'),
            canvasGridTile: t('mineralui.canvasGrid.tile', 'Tile {number}'),
            canvasGridEdit: t('mineralui.canvasGrid.edit', 'Edit {label}'),
            canvasGridExpand: t('mineralui.canvasGrid.expand', 'Expand {label}'),
            canvasGridRemove: t('mineralui.canvasGrid.remove', 'Remove {label}'),
            canvasGridHandle: t('mineralui.canvasGrid.handle', 'Move or resize {label}'),
            canvasGridInstructions: t(
                'mineralui.canvasGrid.instructions',
                'Press Enter or Space to pick up the tile. Arrow keys move it, Shift+arrow keys resize it, Enter or Space drops it and Escape cancels.'
            ),
            canvasGridGrabbed: t(
                'mineralui.canvasGrid.grabbed',
                '{label} picked up. Column {column}, row {row}, {width} by {height}.'
            ),
            canvasGridPosition: t(
                'mineralui.canvasGrid.position',
                '{label}: column {column}, row {row}, {width} by {height}'
            ),
            canvasGridDropped: t(
                'mineralui.canvasGrid.dropped',
                '{label} dropped at column {column}, row {row}, {width} by {height}'
            ),
            canvasGridCancelled: t('mineralui.canvasGrid.cancelled', '{label}: move cancelled'),
        }),
        [t]
    )
}

/** MSpinner / MLoader texts. MI18nProvider key `mineralui.spinner.label`. */
export interface MSpinnerTexts {
    label: string
}

export function useMSpinnerTexts(): MSpinnerTexts {
    const t = useTranslate()

    return useMemo(() => ({label: t('mineralui.spinner.label', 'Loading')}), [t])
}

/** MLoadMore texts. MI18nProvider keys `mineralui.loadMore.label|loading|done`. */
export interface MLoadMoreTexts {
    label: string
    loading: string
    done: string
}

export function useMLoadMoreTexts(): MLoadMoreTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            label: t('mineralui.loadMore.label', 'Load more'),
            loading: t('mineralui.loadMore.loading', 'Loading...'),
            done: t('mineralui.loadMore.done', 'All items loaded'),
        }),
        [t]
    )
}

/** MSocialButton texts. Placeholder: `{platform}`. */
export interface MSocialButtonTexts {
    signIn: string
}

export function useMSocialButtonTexts(): MSocialButtonTexts {
    const t = useTranslate()

    return useMemo(() => ({signIn: t('mineralui.socialButton.signIn', 'Sign in with {platform}')}), [t])
}

/** MProgressRing texts. Placeholder: `{value}`. */
export interface MProgressRingTexts {
    label: string
}

export function useMProgressRingTexts(): MProgressRingTexts {
    const t = useTranslate()

    return useMemo(() => ({label: t('mineralui.progressRing.label', 'Loading {value}%')}), [t])
}

/** MCodeBlock texts. MI18nProvider keys `mineralui.codeBlock.copy|copied|label`. */
export interface MCodeBlockTexts {
    copy: string
    copied: string
    /** Accessible name of the scrollable code region. */
    label: string
}

export function useMCodeBlockTexts(): MCodeBlockTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            copy: t('mineralui.codeBlock.copy', 'Copy'),
            copied: t('mineralui.codeBlock.copied', 'Copied'),
            label: t('mineralui.codeBlock.label', 'Code'),
        }),
        [t]
    )
}

/** MStepper texts. MI18nProvider keys `mineralui.stepper.optional|completed|error`. */
export interface MStepperTexts {
    optional: string
    completed: string
    error: string
}

export function useMStepperTexts(): MStepperTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            optional: t('mineralui.stepper.optional', 'Optional'),
            completed: t('mineralui.stepper.completed', 'Completed'),
            error: t('mineralui.stepper.error', 'Error'),
        }),
        [t]
    )
}

/** MRating texts. `star` / `stars` take a `{count}` placeholder. */
export interface MRatingTexts {
    label: string
    star: string
    stars: string
    /** Accessible name of a read-only rating (`role="img"`). Placeholders: `{value}`, `{max}`. */
    readOnlyValue: string
}

export function useMRatingTexts(): MRatingTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            label: t('mineralui.rating.label', 'MRating'),
            star: t('mineralui.rating.star', '{count} star'),
            stars: t('mineralui.rating.stars', '{count} stars'),
            readOnlyValue: t('mineralui.rating.readOnlyValue', '{value} of {max} stars'),
        }),
        [t]
    )
}

/** MQrCode texts. `status` takes a `{status}` placeholder. */
export interface MQrCodeTexts {
    label: string
    status: string
}

export function useMQrCodeTexts(): MQrCodeTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            label: t('mineralui.qrCode.label', 'QR code'),
            status: t('mineralui.qrCode.status', 'QR code {status}'),
        }),
        [t]
    )
}

/** MColorPicker texts. `swatch` takes a `{color}` placeholder. */
export interface MColorPickerTexts {
    input: string
    swatch: string
    /** Accessible name of the saturation / brightness area (2D slider). */
    area: string
    /** `aria-valuetext` of the area. Placeholders: `{saturation}`, `{brightness}` (percent). */
    areaValue: string
    /** Accessible name of the hue slider. */
    hue: string
    /** `aria-valuetext` of the hue slider. Placeholder: `{value}` (degrees). */
    hueValue: string
    /** Accessible name of the swatch radio group. */
    swatches: string
}

export function useMColorPickerTexts(): MColorPickerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            input: t('mineralui.colorPicker.input', 'Color value'),
            swatch: t('mineralui.colorPicker.swatch', 'Color {color}'),
            area: t('mineralui.colorPicker.area', 'Saturation and brightness'),
            areaValue: t('mineralui.colorPicker.areaValue', 'Saturation {saturation}%, brightness {brightness}%'),
            hue: t('mineralui.colorPicker.hue', 'Hue'),
            hueValue: t('mineralui.colorPicker.hueValue', '{value} degrees'),
            swatches: t('mineralui.colorPicker.swatches', 'Swatches'),
        }),
        [t]
    )
}

export interface MMediaTexts {
    /** Accessible name of an avatar without `alt` or `name`. */
    avatar: string
    /** Accessible name of an avatar with a presence dot. Placeholders: `{name}`, `{presence}`. */
    avatarPresence: string
    presence: {
        online: string
        offline: string
        away: string
        busy: string
    }
    /** Accessible name of the avatar-stack overflow counter. Placeholder: `{count}`. */
    avatarStackMore: string
    showcasePrevious: string
    showcaseNext: string
    /** Default accessible name of MCarousel / MShowcaseCarousel (role=region). */
    carouselLabel: string
    /** `aria-roledescription` of the carousel region. */
    carouselRoleDescription: string
    /** `aria-roledescription` of each slide group. */
    slideRoleDescription: string
    /** Accessible name of each slide group. Placeholders: `{index}`, `{count}`. */
    slideOf: string
    /** MCarousel rotation control while auto-rotating. */
    stopRotation: string
    /** MCarousel rotation control while rotation is stopped. */
    startRotation: string
    /** Accessible name of the MCarousel dot picker group. */
    chooseSlide: string
}

/**
 * Media texts. Resolution per key: MI18nProvider key `mineralui.avatar.*`,
 * `mineralui.avatarStack.*`, `mineralui.showcaseCarousel.*` or `mineralui.carousel.*` → built-in English default.
 */
export function useMMediaTexts(): MMediaTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            avatar: t('mineralui.avatar.fallback', 'Avatar'),
            avatarPresence: t('mineralui.avatar.presenceLabel', '{name}, {presence}'),
            presence: {
                online: t('mineralui.avatar.presence.online', 'Online'),
                offline: t('mineralui.avatar.presence.offline', 'Offline'),
                away: t('mineralui.avatar.presence.away', 'Away'),
                busy: t('mineralui.avatar.presence.busy', 'Busy'),
            },
            avatarStackMore: t('mineralui.avatarStack.more', '{count} more'),
            showcasePrevious: t('mineralui.showcaseCarousel.previous', 'Previous'),
            showcaseNext: t('mineralui.showcaseCarousel.next', 'Next'),
            carouselLabel: t('mineralui.carousel.label', 'Carousel'),
            carouselRoleDescription: t('mineralui.carousel.roleDescription', 'carousel'),
            slideRoleDescription: t('mineralui.carousel.slideRoleDescription', 'slide'),
            slideOf: t('mineralui.carousel.slideOf', '{index} of {count}'),
            stopRotation: t('mineralui.carousel.stopRotation', 'Stop slide rotation'),
            startRotation: t('mineralui.carousel.startRotation', 'Start slide rotation'),
            chooseSlide: t('mineralui.carousel.chooseSlide', 'Choose slide'),
        }),
        [t]
    )
}

export interface MCardTexts {
    addToFavorites: string
    removeFromFavorites: string
    serviceCard: {
        available: string
        unavailable: string
        /** Placeholder: `{count}`. */
        spots: string
        register: string
        addToCart: string
        bookNow: string
        joinCourse: string
        /** Placeholder: `{value}`. */
        rating: string
        /** Placeholders: `{value}`, `{count}`. */
        ratingWithReviews: string
        /** Placeholders: `{count}`, `{max}`. */
        participants: string
    }
    cardPayment: {
        currentBalance: string
        cardHolder: string
        expirationDate: string
    }
    cardPaymentMethod: {
        title: string
        change: string
        helperText: string
        expirationDate: string
        securityCode: string
        defaultBadge: string
        creditCard: string
        /** Placeholder: `{date}`. */
        creditCardExpires: string
    }
    daySchedule: {
        title: string
        emptyTimeline: string
    }
    cardBusiness: {
        qrCode: string
    }
    cardDocumentTree: {
        title: string
        emptyDetails: string
    }
    cardGrid: {
        searchPlaceholder: string
        filter: string
        sort: string
        /** Placeholder: `{label}`. */
        sortBy: string
        loading: string
        emptyMessage: string
        /** Visually hidden sort-direction text (ascending). */
        sortAscending: string
        /** Visually hidden sort-direction text (descending). */
        sortDescending: string
    }
}

/**
 * Card texts. Resolution per key: MI18nProvider key `mineralui.card.*`, `mineralui.serviceCard.*`,
 * `mineralui.cardPayment.*`, `mineralui.cardPaymentMethod.*`, `mineralui.daySchedule.*`,
 * `mineralui.cardBusiness.*`, `mineralui.cardDocumentTree.*` or `mineralui.cardGrid.*` → built-in English default.
 */
export function useMCardTexts(): MCardTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            addToFavorites: t('mineralui.card.addToFavorites', 'Add to favorites'),
            removeFromFavorites: t('mineralui.card.removeFromFavorites', 'Remove from favorites'),
            serviceCard: {
                available: t('mineralui.serviceCard.available', 'Available'),
                unavailable: t('mineralui.serviceCard.unavailable', 'Unavailable'),
                spots: t('mineralui.serviceCard.spots', '{count} spots'),
                register: t('mineralui.serviceCard.register', 'Register'),
                addToCart: t('mineralui.serviceCard.addToCart', 'Add to cart'),
                bookNow: t('mineralui.serviceCard.bookNow', 'Book now'),
                joinCourse: t('mineralui.serviceCard.joinCourse', 'Join course'),
                rating: t('mineralui.serviceCard.rating', 'Rated {value} out of 5'),
                ratingWithReviews: t(
                    'mineralui.serviceCard.ratingWithReviews',
                    'Rated {value} out of 5, {count} reviews'
                ),
                participants: t('mineralui.serviceCard.participants', '{count} of {max} participants'),
            },
            cardPayment: {
                currentBalance: t('mineralui.cardPayment.currentBalance', 'Current balance'),
                cardHolder: t('mineralui.cardPayment.cardHolder', 'Card holder'),
                expirationDate: t('mineralui.cardPayment.expirationDate', 'Expiration date'),
            },
            cardPaymentMethod: {
                title: t('mineralui.cardPaymentMethod.title', 'Your payment methods'),
                change: t('mineralui.cardPaymentMethod.change', 'Change'),
                helperText: t(
                    'mineralui.cardPaymentMethod.helperText',
                    'All fields are required, unless stated otherwise.'
                ),
                expirationDate: t('mineralui.cardPaymentMethod.expirationDate', 'Expiration date'),
                securityCode: t('mineralui.cardPaymentMethod.securityCode', 'Security code'),
                defaultBadge: t('mineralui.cardPaymentMethod.defaultBadge', 'Default'),
                creditCard: t('mineralui.cardPaymentMethod.creditCard', 'Credit card'),
                creditCardExpires: t(
                    'mineralui.cardPaymentMethod.creditCardExpires',
                    'Credit card - Expiration date {date}'
                ),
            },
            daySchedule: {
                title: t('mineralui.daySchedule.title', 'Today'),
                emptyTimeline: t('mineralui.daySchedule.emptyTimeline', 'No events scheduled for this day.'),
            },
            cardBusiness: {
                qrCode: t('mineralui.cardBusiness.qrCode', 'QR'),
            },
            cardDocumentTree: {
                title: t('mineralui.cardDocumentTree.title', 'Documents'),
                emptyDetails: t('mineralui.cardDocumentTree.emptyDetails', 'Select a document to inspect its details.'),
            },
            cardGrid: {
                searchPlaceholder: t('mineralui.cardGrid.searchPlaceholder', 'Search...'),
                filter: t('mineralui.cardGrid.filter', 'Filter'),
                sort: t('mineralui.cardGrid.sort', 'Sort'),
                sortBy: t('mineralui.cardGrid.sortBy', 'Sort: {label}'),
                loading: t('mineralui.cardGrid.loading', 'Loading'),
                emptyMessage: t('mineralui.cardGrid.emptyMessage', 'No results found.'),
                sortAscending: t('mineralui.cardGrid.sortAscending', 'ascending'),
                sortDescending: t('mineralui.cardGrid.sortDescending', 'descending'),
            },
        }),
        [t]
    )
}

/** Built-in texts of the specialised inputs (password, search, OTP, slider, postal code, IBAN, expiry date). */
export interface MInputTexts {
    showPassword: string
    /** Placeholder: `{strength}`. */
    passwordStrength: string
    strength: {
        weak: string
        fair: string
        good: string
        strong: string
    }
    searchPlaceholder: string
    ibanCountry: string
    /** Placeholder: `{example}`. */
    formatHint: string
    otpGroup: string
    /** Placeholders: `{index}`, `{count}`. Falls back to a translated `mineralui.common.digitNumber`. */
    otpDigit: string
    sliderValue: string
    expMonthPlaceholder: string
    expYearPlaceholder: string
    /** Accessible name of the expiry month picker. */
    expMonth: string
    /** Accessible name of the expiry year picker. */
    expYear: string
}

/**
 * Input texts. Resolution per key: MI18nProvider key `mineralui.input.<key>`
 * (strength labels: `mineralui.input.strength.weak|fair|good|strong`) → built-in English default.
 */
export function useMInputTexts(): MInputTexts {
    const t = useTranslate()

    return useMemo(() => {
        // Apps that already translated the older `mineralui.common.digitNumber` keep their text.
        const legacyDigit = t('mineralui.common.digitNumber', '')

        return {
            showPassword: t('mineralui.input.showPassword', 'Show password'),
            passwordStrength: t('mineralui.input.passwordStrength', 'Password strength: {strength}'),
            strength: {
                weak: t('mineralui.input.strength.weak', 'Weak'),
                fair: t('mineralui.input.strength.fair', 'Fair'),
                good: t('mineralui.input.strength.good', 'Good'),
                strong: t('mineralui.input.strength.strong', 'Strong'),
            },
            searchPlaceholder: t('mineralui.input.searchPlaceholder', 'Search...'),
            ibanCountry: t('mineralui.input.ibanCountry', 'IBAN country'),
            formatHint: t('mineralui.input.formatHint', 'Format: {example}'),
            otpGroup: t('mineralui.input.otpGroup', 'Verification code'),
            otpDigit: t('mineralui.input.otpDigit', legacyDigit || 'Digit {index} of {count}'),
            sliderValue: t('mineralui.input.sliderValue', 'Slider value'),
            expMonthPlaceholder: t('mineralui.input.expMonthPlaceholder', 'MM'),
            expYearPlaceholder: t('mineralui.input.expYearPlaceholder', 'YYYY'),
            expMonth: t('mineralui.input.expMonth', 'Month'),
            expYear: t('mineralui.input.expYear', 'Year'),
        }
    }, [t])
}

/** Built-in texts of MInputFile and its crop editor. */
export interface MInputFileTexts {
    placeholder: string
    drop: string
    /** Placeholder: `{size}`. */
    maxSize: string
    /** Placeholder: `{count}` — used when the limit is 1. */
    maxFilesOne: string
    /** Placeholder: `{count}`. */
    maxFiles: string
    /** Placeholder: `{name}` — the rejected file names. */
    type: string
    /** Placeholder: `{apply}` — rendered as the emphasised apply label. */
    cropHint: string
    cropApply: string
    cropCancel: string
    /** Accessible name of the crop editor's zoom slider. */
    cropZoom: string
    /** Accessible name of the crop editor's image area (`role="application"`). */
    cropArea: string
    /** Keyboard instructions announced with the crop area. */
    cropKeyboardHint: string
}

/** MInputFile texts. Resolution per key: MI18nProvider key `mineralui.inputFile.<key>` → built-in English default. */
export function useMInputFileTexts(): MInputFileTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            placeholder: t('mineralui.inputFile.placeholder', 'Drop files here or click to browse'),
            drop: t('mineralui.inputFile.drop', 'Drop files here'),
            maxSize: t('mineralui.inputFile.maxSize', 'Max file size: {size}'),
            maxFilesOne: t('mineralui.inputFile.maxFilesOne', 'Max {count} file'),
            maxFiles: t('mineralui.inputFile.maxFiles', 'Max {count} files'),
            type: t('mineralui.inputFile.type', 'File type not allowed: {name}'),
            cropHint: t(
                'mineralui.inputFile.cropHint',
                'Drag the image to reposition, scroll or use the slider to zoom, then click {apply} to confirm the crop.'
            ),
            cropApply: t('mineralui.inputFile.cropApply', 'Apply'),
            cropCancel: t('mineralui.inputFile.cropCancel', 'Cancel'),
            cropZoom: t('mineralui.inputFile.cropZoom', 'Zoom'),
            cropArea: t('mineralui.inputFile.cropArea', 'Crop area'),
            cropKeyboardHint: t(
                'mineralui.inputFile.cropKeyboardHint',
                'Use the arrow keys to move the image (hold Shift to move faster), plus and minus to zoom.'
            ),
        }),
        [t]
    )
}

/** Toolbar texts shared by data views (MDataTable). */
export interface MDataViewTexts {
    searchPlaceholder: string
    filter: string
    sort: string
    /** Sort button label while a sort key is active. Placeholder: `{label}`. */
    sortBy: string
    /** Visually hidden sort-direction text (ascending). */
    sortAscending: string
    /** Visually hidden sort-direction text (descending). */
    sortDescending: string
}

/**
 * Data-view toolbar texts. Resolution per key: MI18nProvider key `mineralui.dataView.<key>`
 * → built-in English default.
 */
export function useMDataViewTexts(): MDataViewTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            searchPlaceholder: t('mineralui.dataView.searchPlaceholder', 'Search...'),
            filter: t('mineralui.dataView.filter', 'Filter'),
            sort: t('mineralui.dataView.sort', 'Sort'),
            sortBy: t('mineralui.dataView.sortBy', 'Sort: {label}'),
            sortAscending: t('mineralui.dataView.sortAscending', 'ascending'),
            sortDescending: t('mineralui.dataView.sortDescending', 'descending'),
        }),
        [t]
    )
}

export interface MDataTableTexts {
    empty: string
    /** Accessible name of the header "select all" checkbox. */
    selectAllRows: string
    /** Accessible name of a row checkbox. Placeholder: `{index}` (1-based row number). */
    selectRow: string
}

/**
 * MDataTable texts. Resolution per key: MI18nProvider key `mineralui.dataTable.<key>`
 * → built-in English default.
 */
export function useMDataTableTexts(): MDataTableTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            empty: t('mineralui.dataTable.empty', 'No data'),
            selectAllRows: t('mineralui.dataTable.selectAllRows', 'Select all rows'),
            selectRow: t('mineralui.dataTable.selectRow', 'Select row {index}'),
        }),
        [t]
    )
}

export interface MChartTexts {
    /** Fallback pie-segment label. Placeholder: `{index}` (1-based). */
    segment: string
    /** Fallback accessible name of the chart when no `label` is given. */
    chart: string
    /** Keyboard hint attached to the focusable plot. */
    keyboardHint: string
    /** Header of the category column in the visually hidden data table. */
    category: string
    /** Header of the value column of a pie chart's data table. */
    value: string
    /** One series value in a keyboard announcement. Placeholders: `{series}`, `{value}`. */
    seriesValue: string
    /** Keyboard announcement of the active point. Placeholders: `{label}`, `{values}`. */
    pointAnnouncement: string
}

/**
 * MChart texts. Resolution per key: MI18nProvider key `mineralui.chart.<key>`
 * → built-in English default.
 */
export function useMChartTexts(): MChartTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            segment: t('mineralui.chart.segment', 'Segment {index}'),
            chart: t('mineralui.chart.chart', 'Chart'),
            keyboardHint: t('mineralui.chart.keyboardHint', 'Use the arrow keys to move between data points.'),
            category: t('mineralui.chart.category', 'Category'),
            value: t('mineralui.chart.value', 'Value'),
            seriesValue: t('mineralui.chart.seriesValue', '{series}: {value}'),
            pointAnnouncement: t('mineralui.chart.pointAnnouncement', '{label}, {values}'),
        }),
        [t]
    )
}

export interface MTreeViewTexts {
    /** Accessible name of the node context menu. Placeholder: `{label}`. */
    menuLabel: string
    /** Built-in context-menu action that picks a node up for a move (alternative to dragging). */
    cut: string
    /** Built-in context-menu action that moves the picked-up node into this folder. */
    moveHere: string
    /** Built-in context-menu action that drops the pending move. */
    cancelMove: string
    /** Announced after cutting. Placeholder: `{label}`. */
    cutAnnouncement: string
    /** Announced after a keyboard / menu move. Placeholders: `{label}`, `{target}`. */
    movedAnnouncement: string
    /** Announced when a pending move is cancelled. */
    moveCancelled: string
}

/**
 * MTreeView texts. Resolution per key: MI18nProvider key `mineralui.treeView.<key>`
 * → built-in English default.
 */
export function useMTreeViewTexts(): MTreeViewTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            menuLabel: t('mineralui.treeView.menuLabel', '{label} actions'),
            cut: t('mineralui.treeView.cut', 'Cut'),
            moveHere: t('mineralui.treeView.moveHere', 'Move here'),
            cancelMove: t('mineralui.treeView.cancelMove', 'Cancel move'),
            cutAnnouncement: t(
                'mineralui.treeView.cutAnnouncement',
                '{label} cut. Go to a folder and press Ctrl+V, or choose Move here from its menu.'
            ),
            movedAnnouncement: t('mineralui.treeView.movedAnnouncement', '{label} moved to {target}.'),
            moveCancelled: t('mineralui.treeView.moveCancelled', 'Move cancelled.'),
        }),
        [t]
    )
}

export interface MDashboardGridTexts {
    dragHandle: string
    widthLabel: string
    /** Placeholders: `{span}`, `{columns}`. */
    widthValue: string
    remove: string
    moveLeft: string
    moveRight: string
    narrower: string
    wider: string
    emptyHint: string
    /** Placeholder: `{label}`. */
    itemActions: string
    /** Placeholders: `{label}`, `{position}`, `{total}`. */
    positionAnnouncement: string
    /** Placeholders: `{label}`, `{span}`, `{columns}`. */
    widthAnnouncement: string
    /** Placeholder: `{label}`. */
    lifted: string
    /** Placeholder: `{label}`. */
    dropped: string
    /** Placeholder: `{label}`. */
    resizeHandle: string
    /** `aria-roledescription` of a drag handle. */
    sortableItem: string
}

/**
 * MDashboardGrid texts. Resolution per key: `locale` prop → MI18nProvider key
 * `mineralui.dashboardGrid.<key>` → built-in English default.
 */
export function useMDashboardGridTexts(overrides?: Partial<MDashboardGridTexts>): MDashboardGridTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            dragHandle: t('mineralui.dashboardGrid.dragHandle', 'Drag to reorder'),
            widthLabel: t('mineralui.dashboardGrid.widthLabel', 'Width'),
            widthValue: t('mineralui.dashboardGrid.widthValue', '{span} of {columns} columns'),
            remove: t('mineralui.dashboardGrid.remove', 'Remove from dashboard'),
            moveLeft: t('mineralui.dashboardGrid.moveLeft', 'Move earlier'),
            moveRight: t('mineralui.dashboardGrid.moveRight', 'Move later'),
            narrower: t('mineralui.dashboardGrid.narrower', 'Narrower'),
            wider: t('mineralui.dashboardGrid.wider', 'Wider'),
            emptyHint: t('mineralui.dashboardGrid.emptyHint', 'No widgets on this dashboard yet.'),
            itemActions: t('mineralui.dashboardGrid.itemActions', '{label} actions'),
            positionAnnouncement: t(
                'mineralui.dashboardGrid.positionAnnouncement',
                '{label}: position {position} of {total}'
            ),
            widthAnnouncement: t('mineralui.dashboardGrid.widthAnnouncement', '{label}: {span} of {columns} columns'),
            lifted: t('mineralui.dashboardGrid.lifted', '{label} lifted. Use the arrow keys to move it.'),
            dropped: t('mineralui.dashboardGrid.dropped', '{label} dropped.'),
            resizeHandle: t('mineralui.dashboardGrid.resizeHandle', 'Resize {label}'),
            sortableItem: t('mineralui.dashboardGrid.sortableItem', 'sortable item'),
            ...overrides,
        }),
        [t, overrides]
    )
}

export interface MChatTexts {
    /** Accessible name of the chat region. */
    chat: string
    openChat: string
    closeChat: string
    /** Accessible name of the message log. */
    messages: string
    /** Accessible name of the message field. */
    messageInput: string
    placeholder: string
    /** Prefix of an own last message in a conversation preview. */
    youPrefix: string
    /** Compact "just now" timestamp in a conversation item. */
    now: string
    statusSent: string
    statusDelivered: string
    statusRead: string
    /** Placeholder: `{name}`. */
    typingOne: string
    /** Placeholders: `{first}`, `{second}`. */
    typingTwo: string
    /** Placeholders: `{name}`, `{count}`. */
    typingMany: string
}

/**
 * MChat texts. Resolution per key: MI18nProvider key `mineralui.chat.<key>`
 * → built-in English default.
 */
export function useMChatTexts(): MChatTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            chat: t('mineralui.chat.chat', 'Chat'),
            openChat: t('mineralui.chat.openChat', 'Open chat'),
            closeChat: t('mineralui.chat.closeChat', 'Close chat'),
            messages: t('mineralui.chat.messages', 'Messages'),
            messageInput: t('mineralui.chat.messageInput', 'Message'),
            placeholder: t('mineralui.chat.placeholder', 'Type a message…'),
            youPrefix: t('mineralui.chat.youPrefix', 'You: '),
            now: t('mineralui.chat.now', 'now'),
            statusSent: t('mineralui.chat.statusSent', 'sent'),
            statusDelivered: t('mineralui.chat.statusDelivered', 'delivered'),
            statusRead: t('mineralui.chat.statusRead', 'read'),
            typingOne: t('mineralui.chat.typingOne', '{name} is typing'),
            typingTwo: t('mineralui.chat.typingTwo', '{first} and {second} are typing'),
            typingMany: t('mineralui.chat.typingMany', '{name} and {count} others are typing'),
        }),
        [t]
    )
}

/**
 * Translate results of the built-in `validate*` functions through `mineralui.validation.<key>`
 * (e.g. `mineralui.validation.email`, `mineralui.validation.minLength` with `{min}`,
 * `mineralui.validation.postCode.PL`). Results from custom validators are returned unchanged.
 */
export function useMValidationMessage(): (result: ValidationResult) => ValidationResult {
    const t = useTranslate()

    return useCallback(
        (result: ValidationResult) => {
            const info = result.valid ? undefined : getValidationMessageInfo(result)
            if (!info) return result
            const template = t(`mineralui.validation.${info.key}`, info.template)
            return {...result, error: fillValidationTemplate(template, info.params)}
        },
        [t]
    )
}

export interface MSelectTexts {
    placeholder: string
    searchPlaceholder: string
    noOptions: string
    /** Accessible name of the search combobox when the field has no visible label. */
    searchLabel: string
}

/** MSelect texts. Resolution per key: MI18nProvider key `mineralui.select.<key>` → built-in English default. */
export function useMSelectTexts(): MSelectTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            placeholder: t('mineralui.select.placeholder', 'Select...'),
            searchPlaceholder: t('mineralui.select.searchPlaceholder', 'Search...'),
            noOptions: t('mineralui.select.noOptions', 'No options'),
            searchLabel: t('mineralui.select.searchLabel', 'Search options'),
        }),
        [t]
    )
}

export interface MAutocompleteTexts {
    placeholder: string
    noOptions: string
    loading: string
}

/** MAutocomplete texts. Resolution per key: MI18nProvider key `mineralui.autocomplete.<key>` → built-in English default. */
export function useMAutocompleteTexts(): MAutocompleteTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            placeholder: t('mineralui.autocomplete.placeholder', 'Type to search...'),
            noOptions: t('mineralui.autocomplete.noOptions', 'No options'),
            loading: t('mineralui.autocomplete.loading', 'Loading...'),
        }),
        [t]
    )
}

export interface MTimePickerTexts {
    /** Heading of the time panel in MDatePicker (`withTime`). */
    time: string
    hours: string
    minutes: string
    seconds: string
    meridiem: string
    /** Accessible name of the MTimePicker dialog when the field has no label. */
    dialogLabel: string
}

/** Time column texts (MTimePicker, MDatePicker). Resolution per key: `mineralui.time.<key>` → built-in English default. */
export function useMTimePickerTexts(): MTimePickerTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            time: t('mineralui.time.time', 'Time'),
            hours: t('mineralui.time.hours', 'Hr'),
            minutes: t('mineralui.time.minutes', 'Min'),
            seconds: t('mineralui.time.seconds', 'Sec'),
            meridiem: t('mineralui.time.meridiem', 'AM/PM'),
            dialogLabel: t('mineralui.time.dialogLabel', 'Choose time'),
        }),
        [t]
    )
}

export interface MPopconfirmTexts {
    confirm: string
    cancel: string
}

/** MPopconfirm texts. Resolution per key: `mineralui.popconfirm.<key>` → built-in English default. */
export function useMPopconfirmTexts(): MPopconfirmTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            confirm: t('mineralui.popconfirm.confirm', 'Yes'),
            cancel: t('mineralui.popconfirm.cancel', 'No'),
        }),
        [t]
    )
}

export interface MCommandPaletteTexts {
    title: string
    open: string
    placeholder: string
    empty: string
    featured: string
    featuredDescription: string
    results: string
    /** Placeholder: `{count}`. */
    resultsCount: string
    generalGroup: string
    /** Accessible name of the search combobox. */
    searchLabel: string
    /** Screen-reader announcement after the results change. Placeholder: `{count}`. */
    resultsAnnouncement: string
}

/** MCommandPalette texts. Resolution per key: `mineralui.commandPalette.<key>` → built-in English default. */
export function useMCommandPaletteTexts(): MCommandPaletteTexts {
    const t = useTranslate()

    return useMemo(
        () => ({
            title: t('mineralui.commandPalette.title', 'Command palette'),
            open: t('mineralui.commandPalette.open', 'Open command palette'),
            placeholder: t('mineralui.commandPalette.placeholder', 'Search modules, records and actions...'),
            empty: t('mineralui.commandPalette.empty', 'No matching results.'),
            featured: t('mineralui.commandPalette.featured', 'Featured'),
            featuredDescription: t(
                'mineralui.commandPalette.featuredDescription',
                'Quick launch for the most frequent dashboard actions.'
            ),
            results: t('mineralui.commandPalette.results', 'Results'),
            resultsCount: t('mineralui.commandPalette.resultsCount', '{count} ready'),
            generalGroup: t('mineralui.commandPalette.generalGroup', 'General'),
            searchLabel: t('mineralui.commandPalette.searchLabel', 'Search commands'),
            resultsAnnouncement: t('mineralui.commandPalette.resultsAnnouncement', 'Results: {count}'),
        }),
        [t]
    )
}
