import type {ReactNode} from 'react'
import type {MColor} from '../../../theme'
import type {MCardProps} from '../MCard'
import type {MDetailListItem} from '../../display/MDetailList'
import type {MHeadingLevel} from '../../typography'

export interface MDayScheduleEntry {
    id: string
    title: ReactNode
    description?: ReactNode
    time: ReactNode
    icon?: ReactNode
    color?: MColor
}

/**
 * Semantic role of a side-panel tab. Drives the colored indicator next to the
 * tab label so the user can spot "available", "needs attention" and "neutral
 * info" buckets at a glance, and lets analytics/automation reason about the
 * panels without inspecting their titles.
 */
export type MCardDayScheduleTabType = 'free' | 'alerts' | 'info'

export interface MCardDayScheduleTab {
    type: MCardDayScheduleTabType
    title: ReactNode
    items: MDetailListItem[]
}

export interface MCardDayScheduleProps extends Omit<MCardProps, 'children' | 'title'> {
    title?: ReactNode
    /** Heading level of the title. Defaults to 4. */
    titleLevel?: MHeadingLevel
    description?: ReactNode
    workdayStart?: ReactNode
    workdayEnd?: ReactNode
    timeline: MDayScheduleEntry[]
    /**
     * Limits the timeline height (number = px, string = any CSS length) and scrolls it inside the card.
     * Unset, the timeline grows with its entries.
     */
    timelineMaxHeight?: number | string
    summary?: ReactNode
    /**
     * Side-panel content — rendered as a single `MTabs` strip in the right
     * column. Empty `items` arrays are skipped automatically; the first tab
     * with items is selected by default. Pass an empty array (or omit the prop)
     * to render only the timeline + summary on the side.
     */
    tabs?: MCardDayScheduleTab[]
    footer?: ReactNode
    emptyTimeline?: ReactNode
}
