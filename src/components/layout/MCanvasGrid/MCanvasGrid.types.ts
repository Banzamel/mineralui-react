import type {CSSProperties, ReactNode} from 'react'

export interface MCanvasGridPosition {
    x: number
    y: number
    w: number
    h: number
}

export interface MCanvasGridItem {
    id: string
    position: MCanvasGridPosition
}

export type MCanvasGridGuides = 'always' | 'never' | 'on-edit' | 'on-drag'

export interface MCanvasGridProps<T extends MCanvasGridItem> {
    columns?: number
    rows?: number
    snap?: number
    items: T[]
    renderItem: (item: T) => ReactNode
    /**
     * Human-readable tile name used in the tile buttons ("Edit Sales"), the keyboard move handle
     * and the move / resize announcements. Defaults to "Tile {number}".
     */
    getItemLabel?: (item: T) => string
    minItemSize?: (item: T) => {w: number; h: number}
    maxItemSize?: (item: T) => {w: number; h: number}
    editable?: boolean
    onItemMove?: (id: string, position: MCanvasGridPosition) => void
    onItemResize?: (id: string, position: MCanvasGridPosition) => void
    onItemRemove?: (id: string) => void
    onItemEdit?: (id: string) => void
    onItemExpand?: (id: string) => void
    guides?: MCanvasGridGuides
    compactBreakpoint?: number
    mobileBreakpoint?: number
    height?: number | string
    /** How tile content behaves when it overflows the cell. `'scroll'` (default) shows a native scrollbar; `'scale'` proportionally shrinks the content via CSS transform. */
    fitContent?: 'scroll' | 'scale'
    /** When `fitContent='scale'`, render width used as the natural content size before scaling. Default 480. */
    fitContentBaseWidth?: number
    className?: string
    style?: CSSProperties
}
