import type {ElementType, HTMLAttributes, ReactNode} from 'react'
import type {MColor} from '../../../theme'
import type {MCardActionProps} from '../shared'

export type MCardTileOverlayPosition = 'top' | 'bottom' | 'center'

/**
 * `'default'` — bordered tile with padded body (as before 2.7.0).
 * `'media'` — no frame, background or body padding: the media carries the card and the
 * title / description sit under it as a caption. Hover (when interactive) draws an accent
 * outline on the media and zooms the image slightly.
 */
export type MCardTileVariant = 'default' | 'media'

/** Media frame ratio. Without it the media keeps the built-in 16:10 frame. */
export type MCardTileRatio = '1:1' | '4:3' | '3:2' | '16:9' | '16:10' | '3:4' | '2:3' | '9:16'

/** Corner ribbon descriptor; `color` defaults to the tile `color`. */
export interface MCardTileRibbon {
    label: ReactNode
    color?: MColor
}

export interface MCardTileMenuItem {
    label: string
    onClick?: () => void
    icon?: ReactNode
    danger?: boolean
}

export interface MCardTileProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'onClick'>, MCardActionProps {
    title: string
    description?: string
    icon?: ReactNode
    color?: MColor
    onClick?: () => void
    image?: string
    video?: string
    illustration?: ReactNode
    camera?: boolean | MediaStreamConstraints
    mediaFill?: boolean
    overlayPosition?: MCardTileOverlayPosition
    favorite?: boolean
    onFavorite?: () => void
    menuItems?: MCardTileMenuItem[]
    /** Visual variant. Default `'default'`. */
    variant?: MCardTileVariant
    /** Media frame ratio (any variant). Default: the built-in 16:10 frame. */
    ratio?: MCardTileRatio
    /**
     * Badge in the bottom-right corner of the media (of the card when there is no media).
     * Strings / numbers get a dark pill; any other node (e.g. `MTag`) is placed as-is.
     */
    badge?: ReactNode
    /** Diagonal ribbon across the top-left corner: a node, or `{label, color}`. */
    ribbon?: ReactNode | MCardTileRibbon
}
