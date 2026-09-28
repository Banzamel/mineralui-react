import type {HTMLAttributes, ReactNode} from 'react'
import type {MColor} from '../../../theme/MTheme.types'

/** A single cell of week-grid data. `day` is the row index, `slot` is the
 *  column index, both 0-based. */
export interface MWeekGridCell {
    day: number
    slot: number
    value: number
}

/** Density band for a cell — 0 = empty, 3 = max density. The component
 *  derives the band from `value / max`. Custom renderers can read it back
 *  to colour-match icons / labels. */
export type MWeekGridBand = 0 | 1 | 2 | 3

export interface MWeekGridCellContext {
    day: number
    slot: number
    value: number
    band: MWeekGridBand
}

export interface MWeekGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'color' | 'title'> {
    /** Grid data. Accepts either a 2D matrix indexed `[day][slot]` or a sparse
     *  list of `{day, slot, value}` cells. Missing cells fall back to 0. */
    data: number[][] | MWeekGridCell[]
    /** Maximum value used to derive density bands. Auto-computed from `data`
     *  if omitted. */
    max?: number
    /** Number of rows. Defaults to 7 (days of week). */
    days?: number
    /** Number of columns. Defaults to 24 (hours of day). */
    slots?: number
    /** Override row labels. When omitted the component uses three-letter day
     *  names (`Mon`..`Sun` or `Sun`..`Sat` depending on `weekStart`). */
    dayLabels?: string[]
    /** Override column labels. When omitted the component uses zero-padded
     *  hour numbers (`00`..`23`). */
    slotLabels?: string[]
    /** Week start: `0` = Sunday first, `1` = Monday first (default). Data is
     *  always indexed by the calendar day (0 = Sunday, matching
     *  `Date.getDay()`); this prop only reorders the visual rows. */
    weekStart?: 0 | 1
    /** Color family used to shade cells. Defaults to `'warning'` (amber). */
    color?: MColor
    /** Title rendered above the grid. */
    title?: ReactNode
    /** Description rendered under the title. */
    description?: ReactNode
    /** Hint rendered under the header — typically an interaction tip. */
    hint?: ReactNode
    /** Slot rendered on the right of the title row — typically a peak / summary
     *  badge. */
    peakLabel?: ReactNode
    /** Custom cell renderer. Default: numeric `value` for non-zero, empty for 0. */
    renderCell?: (cell: MWeekGridCellContext) => ReactNode
    /** Tooltip content per cell. Returning `null` disables the tooltip for
     *  that cell. Default: `Day SLOT — value`. */
    renderTooltip?: (cell: MWeekGridCellContext) => ReactNode
    /** Click handler — fires on the cell `<div>`. Cells become focusable
     *  buttons (Enter / Space activate them) named `Day SLOT: value`
     *  (i18n key `mineralui.weekGrid.cellLabel`). */
    onCellClick?: (cell: MWeekGridCellContext) => void
    /** Show the density legend (None / Few / Some / Many) below the grid.
     *  Only bands the data can reach are listed — an integer grid with
     *  `max = 1` shows bands 0 and 3. Default `true`. */
    showLegend?: boolean
    /** Override the four density-band labels. Default: i18n keys
     *  `mineralui.weekGrid.bands.none|few|some|many`, English fallback. */
    bandLabels?: [string, string, string, string]
    /** Unit appended to the legend's scale text — e.g. `'teachers'` renders
     *  `Scale: 0 — 65 teachers`. The scale text itself comes from the i18n key
     *  `mineralui.weekGrid.scale` (`{min}`, `{max}`, `{unit}`). */
    legendUnit?: string
    /** Width of the row-label column in pixels. Default `48`. */
    rowLabelWidth?: number
    /** Cell height in pixels. Default `24`. */
    cellHeight?: number
    /** Minimum cell width in pixels — the grid still expands to fill its
     *  container. Default `24`. */
    cellMinWidth?: number
}
