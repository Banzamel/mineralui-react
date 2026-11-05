import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'
import type {MHiddenProps} from '../../../theme'
import type {LayoutUtilityProps} from '../../../utils/layoutProps'

export type MGridType = 'row' | 'col'
export type MGridAlign = 'stretch' | 'start' | 'center' | 'end' | 'baseline'
export const mGridColumnValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export type MGridColumns = (typeof mGridColumnValues)[number]

export interface MGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'hidden'>, LayoutUtilityProps, MHiddenProps {
    type?: MGridType
    /*
     * Column spans (1-12) per width range. Breakpoints are max-width (desktop-first) media
     * queries, so when several ranges match the narrower one wins. A missing larger prop copies
     * the nearest smaller one, and a missing smaller prop is covered by the nearest larger one
     * (`md={6}` alone also means 6 on phones). Inside a `type="row"` grid, columns without a
     * value at some width share the remaining columns automatically. Only on `type="col"`.
     */
    /** Span at widths up to 640px (phones). Wins over every wider prop there. */
    sm?: MGridColumns
    /** Span at 641-768px. Without `sm`, also used up to 640px. */
    md?: MGridColumns
    /** Span at 769-1024px. Missing → copies `md` (then `sm`). */
    lg?: MGridColumns
    /** Span at 1025-1280px. Missing → copies `lg` (then `md`, `sm`). */
    xl?: MGridColumns
    /** Span above 1280px, also past the 1536px `2xl` breakpoint. Missing → copies `xl` (then `lg`, `md`, `sm`). */
    xxl?: MGridColumns
    align?: MGridAlign
    children?: ReactNode
    className?: string
    style?: CSSProperties
}

export interface MGridItemProps extends Omit<MGridProps, 'type'> {
    children?: ReactNode
    className?: string
    style?: CSSProperties
}
