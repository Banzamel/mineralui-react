import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'

export const mSimpleGridColumnValues = [1, 2, 3, 4] as const
export type MSimpleGridColumns = (typeof mSimpleGridColumnValues)[number]

/**
 * Mobile-first per-breakpoint column counts for `MSimpleGrid` — same shape and
 * breakpoints as `MCardGridResponsiveColumns`. `base` applies on the smallest screens,
 * each larger key kicks in through a `min-width` media query, and a missing key inherits
 * the next smaller one (ending at `base`, default `1`).
 *
 *  - `sm`  — `min-width: 640px`
 *  - `md`  — `min-width: 768px`
 *  - `lg`  — `min-width: 1024px`
 *  - `xl`  — `min-width: 1280px`
 *  - `xxl` — `min-width: 1536px`
 */
export interface MSimpleGridResponsiveColumns {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
}

export interface MSimpleGridProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * `1`–`4` — fixed count with the built-in steps (3–4 → 2 columns at ≤1024px, → 1 at ≤720px).
     * Object — mobile-first counts per breakpoint, no built-in steps (since 2.7.0).
     * Default `2`.
     */
    columns?: MSimpleGridColumns | MSimpleGridResponsiveColumns
    minItemWidth?: string
    children?: ReactNode
    className?: string
    style?: CSSProperties
}
