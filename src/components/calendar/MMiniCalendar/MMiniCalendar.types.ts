import type {HTMLAttributes} from 'react'
import type {MColor, MSize} from '../../../theme'
import type {MMiniCalendarTexts} from '../../../i18n/frameworkTexts'

export type {MMiniCalendarTexts}

/** A dot rendered under a day number. `color` accepts an MColor family or any CSS colour. */
export interface MMiniCalendarMarker {
    color?: MColor | string
    label?: string
}

export interface MMiniCalendarProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'color' | 'children'
> {
    value?: Date | null
    defaultValue?: Date | null
    onChange?: (date: Date) => void
    /** Displayed month (any day inside it). Controlled when set. */
    month?: Date
    defaultMonth?: Date
    onMonthChange?: (month: Date) => void
    min?: Date | string
    max?: Date | string
    disabledDates?: Date[] | ((date: Date) => boolean)
    weekStartsOn?: 0 | 1
    locale?: string
    /** Tints a date range, e.g. the week the scheduler shows. `end` is inclusive. */
    highlightRange?: {start: Date; end: Date}
    markers?: (date: Date) => MMiniCalendarMarker | MMiniCalendarMarker[] | null | undefined
    showOutsideDays?: boolean
    size?: MSize
    color?: MColor
    texts?: Partial<MMiniCalendarTexts>
    /** Moves focus into the grid on mount (used inside popovers). */
    autoFocus?: boolean
}
