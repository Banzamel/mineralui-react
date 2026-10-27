import {
    Fragment,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react'

import {MStack} from '../../layout'
import {MTooltip} from '../../overlays'
import {MHeading, MSubText, MText} from '../../typography'
import {cn} from '../../../utils/cn'
import {formatMText, useMWeekGridTexts} from '../../../i18n/frameworkTexts'
import {isRtlElement} from '../../../utils/radioGroupKeys'

import type {
    MWeekGridBand,
    MWeekGridCell,
    MWeekGridCellContext,
    MWeekGridProps,
    MWeekGridRange,
} from './MWeekGrid.types'

import './MWeekGrid.css'

const DEFAULT_DAYS = 7
const DEFAULT_SLOTS = 24

const ALL_BANDS: MWeekGridBand[] = [0, 1, 2, 3]

// Largest integer max for which the reachable bands are enumerated value by value.
const ENUMERABLE_MAX = 100

function densityBand(value: number, max: number): MWeekGridBand {
    if (max <= 0 || value <= 0) return 0
    const ratio = value / max
    if (ratio >= 0.66) return 3
    if (ratio >= 0.33) return 2
    return 1
}

/**
 * Bands a cell can actually land in. On an integer grid only `1..max` can occur,
 * so e.g. `max = 1` (on/off data) reaches bands 0 and 3 only. Fractional data
 * or a large max can hit every band.
 */
function reachableBands(grid: number[][], max: number): MWeekGridBand[] {
    if (max <= 0) return [0]
    const integral = Number.isInteger(max) && grid.every((row) => row.every((value) => Number.isInteger(value)))
    if (!integral || max > ENUMERABLE_MAX) return ALL_BANDS
    const bands = new Set<MWeekGridBand>([0])
    for (let value = 1; value <= max; value += 1) bands.add(densityBand(value, max))
    return ALL_BANDS.filter((band) => bands.has(band))
}

function buildGrid(data: MWeekGridProps['data'], days: number, slots: number): number[][] {
    const grid: number[][] = Array.from({length: days}, () => Array.from({length: slots}, () => 0))

    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
        const matrix = data as number[][]
        for (let day = 0; day < Math.min(days, matrix.length); day += 1) {
            const row = matrix[day]
            if (!row) continue
            for (let slot = 0; slot < Math.min(slots, row.length); slot += 1) {
                grid[day][slot] = row[slot] ?? 0
            }
        }
        return grid
    }

    for (const cell of data as MWeekGridCell[]) {
        if (cell.day < 0 || cell.day >= days) continue
        if (cell.slot < 0 || cell.slot >= slots) continue
        grid[cell.day][cell.slot] = cell.value
    }
    return grid
}

function resolveMax(grid: number[][], max?: number): number {
    if (typeof max === 'number') return max
    let best = 0
    for (const row of grid) {
        for (const value of row) {
            if (value > best) best = value
        }
    }
    return best
}

function resolveDayLabels(
    days: number,
    weekStart: 0 | 1,
    defaultLabelsFromSunday: readonly string[],
    custom?: string[]
): {label: string; calendarDay: number}[] {
    if (custom && custom.length >= days) {
        return Array.from({length: days}, (_, index) => ({label: custom[index], calendarDay: index}))
    }

    if (days === 7) {
        const order = weekStart === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
        return order.map((calendarDay) => ({
            label: defaultLabelsFromSunday[calendarDay],
            calendarDay,
        }))
    }

    return Array.from({length: days}, (_, index) => ({
        label: String(index + 1),
        calendarDay: index,
    }))
}

function resolveSlotLabels(slots: number, custom?: string[]): string[] {
    if (custom && custom.length >= slots) return custom.slice(0, slots)
    if (slots === 24) {
        return Array.from({length: 24}, (_, hour) => hour.toString().padStart(2, '0'))
    }
    return Array.from({length: slots}, (_, slot) => String(slot + 1))
}

/**
 * Next cell for an APG grid key, or `null` when the key does not move.
 * Rows and columns clamp at the edges (no wrapping), as in the APG data grid.
 */
function gridKeyTarget(
    key: string,
    ctrl: boolean,
    row: number,
    col: number,
    rowCount: number,
    colCount: number,
    rtl: boolean
): {row: number; col: number} | null {
    const lastRow = rowCount - 1
    const lastCol = colCount - 1
    switch (key) {
        case 'ArrowRight':
            return {row, col: rtl ? Math.max(col - 1, 0) : Math.min(col + 1, lastCol)}
        case 'ArrowLeft':
            return {row, col: rtl ? Math.min(col + 1, lastCol) : Math.max(col - 1, 0)}
        case 'ArrowDown':
            return {row: Math.min(row + 1, lastRow), col}
        case 'ArrowUp':
            return {row: Math.max(row - 1, 0), col}
        case 'Home':
            return ctrl ? {row: 0, col: 0} : {row, col: 0}
        case 'End':
            return ctrl ? {row: lastRow, col: lastCol} : {row, col: lastCol}
        case 'PageUp':
            return {row: 0, col}
        case 'PageDown':
            return {row: lastRow, col}
        default:
            return null
    }
}

/** A selection in visual coordinates: rows as rendered (after `weekStart`), columns = slots. */
interface CellPoint {
    row: number
    col: number
}

interface Selection {
    anchor: CellPoint
    focus: CellPoint
    source: 'pointer' | 'keyboard'
}

function selectionBounds(selection: Selection, mode: 'rect' | 'row') {
    const {anchor, focus} = selection
    const rowTo = mode === 'row' ? anchor.row : focus.row
    return {
        rowFrom: Math.min(anchor.row, rowTo),
        rowTo: Math.max(anchor.row, rowTo),
        colFrom: Math.min(anchor.col, focus.col),
        colTo: Math.max(anchor.col, focus.col),
    }
}

function defaultRenderCell(ctx: MWeekGridCellContext): ReactNode {
    return ctx.value > 0 ? ctx.value : ''
}

function defaultRenderTooltip(ctx: MWeekGridCellContext, dayLabel: string, slotLabel: string): ReactNode {
    return `${dayLabel} ${slotLabel} — ${ctx.value}`
}

/**
 * Week-grid heatmap — rows = days, columns = hours (or any fixed slot range).
 * Cells colour-shade by density (four discrete bands) and accept tooltips,
 * custom renderers and click handlers. Common use cases: availability /
 * attendance maps, booking density, opening hours, peak-load views.
 */
export function MWeekGrid({
    data,
    max,
    days = DEFAULT_DAYS,
    slots = DEFAULT_SLOTS,
    dayLabels,
    slotLabels,
    weekStart = 1,
    color = 'warning',
    title,
    description,
    hint,
    peakLabel,
    renderCell,
    renderTooltip,
    onCellClick,
    showLegend = true,
    bandLabels,
    legendUnit,
    rowLabelWidth = 48,
    cellHeight = 24,
    cellMinWidth = 24,
    interactive,
    selectable,
    onSelectRange,
    onSelectingRange,
    className,
    style,
    ...rest
}: MWeekGridProps) {
    const selectMode = selectable === 'row' ? 'row' : selectable ? 'rect' : null
    // Grid mode: one tab stop and APG grid arrow keys instead of a tab stop per cell.
    const gridMode = interactive ?? (!!onCellClick || !!selectMode)
    const legacyButtons = !gridMode && !!onCellClick
    const [activeCell, setActiveCell] = useState({row: 0, col: 0})
    const matrixRef = useRef<HTMLDivElement>(null)
    const titleId = `${useId()}-title`
    const grid = useMemo(() => buildGrid(data, days, slots), [data, days, slots])
    const resolvedMax = useMemo(() => resolveMax(grid, max), [grid, max])
    const cols = useMemo(() => resolveSlotLabels(slots, slotLabels), [slots, slotLabels])
    const legendBands = useMemo(() => reachableBands(grid, resolvedMax), [grid, resolvedMax])
    const texts = useMWeekGridTexts()
    const rows = useMemo(
        () => resolveDayLabels(days, weekStart, texts.days, dayLabels),
        [days, weekStart, texts.days, dayLabels]
    )
    const resolvedBandLabels = bandLabels ?? texts.bands
    const [selection, setSelection] = useState<Selection | null>(null)
    const selectionRef = useRef<Selection | null>(null)
    const draggingRef = useRef(false)
    const [announcement, setAnnouncement] = useState('')

    const matrixStyle: CSSProperties = {
        gridTemplateColumns: `${rowLabelWidth}px repeat(${slots}, minmax(${cellMinWidth}px, 1fr))`,
    }

    const wrapperStyle: CSSProperties = {
        ['--mineral-week-grid-color' as never]: `var(--mineral-${color})`,
        ...style,
    }

    const hasHeader = title != null || description != null || hint != null || peakLabel != null
    const rowCount = rows.length
    const colCount = cols.length
    const active = {
        row: Math.min(activeCell.row, Math.max(rowCount - 1, 0)),
        col: Math.min(activeCell.col, Math.max(colCount - 1, 0)),
    }
    const labelledByTitle = gridMode && typeof title === 'string' && !rest['aria-label'] && !rest['aria-labelledby']

    function focusCell(row: number, col: number) {
        setActiveCell({row, col})
        matrixRef.current?.querySelector<HTMLElement>(`[data-week-grid-cell="${row}-${col}"]`)?.focus()
    }

    function cellContext(point: CellPoint): MWeekGridCellContext {
        const day = rows[point.row]?.calendarDay ?? point.row
        const value = grid[day]?.[point.col] ?? 0
        return {day, slot: point.col, value, band: densityBand(value, resolvedMax)}
    }

    // Visual rows are reported as calendar days (see MWeekGridRange.days).
    function toRange(next: Selection): MWeekGridRange {
        const bounds = selectionBounds(next, selectMode ?? 'rect')
        const days: number[] = []
        for (let row = bounds.rowFrom; row <= bounds.rowTo; row += 1) days.push(rows[row].calendarDay)
        const slotList: number[] = []
        for (let col = bounds.colFrom; col <= bounds.colTo; col += 1) slotList.push(col)
        return {days, slots: slotList, origin: cellContext(next.anchor)}
    }

    function announce(next: Selection) {
        const bounds = selectionBounds(next, selectMode ?? 'rect')
        setAnnouncement(
            formatMText(texts.rangeLabel, {
                fromDay: rows[bounds.rowFrom].label,
                fromSlot: cols[bounds.colFrom],
                toDay: rows[bounds.rowTo].label,
                toSlot: cols[bounds.colTo],
            })
        )
    }

    function updateSelection(next: Selection | null) {
        const previous = selectionRef.current
        if (
            previous &&
            next &&
            previous.anchor.row === next.anchor.row &&
            previous.anchor.col === next.anchor.col &&
            previous.focus.row === next.focus.row &&
            previous.focus.col === next.focus.col
        ) {
            return
        }
        selectionRef.current = next
        setSelection(next)
        onSelectingRange?.(next ? toRange(next) : null)
        if (next?.source === 'keyboard') announce(next)
    }

    function commitSelection() {
        const current = selectionRef.current
        draggingRef.current = false
        if (!current) return
        const single = current.anchor.row === current.focus.row && current.anchor.col === current.focus.col
        updateSelection(null)
        if (single) onCellClick?.(cellContext(current.anchor))
        else onSelectRange?.(toRange(current))
    }

    function cancelSelection() {
        draggingRef.current = false
        if (selectionRef.current) updateSelection(null)
    }

    // Escape cancels a drag even though focus may sit outside the grid.
    useEffect(() => {
        if (!selection || selection.source !== 'pointer') return
        function handleKey(event: globalThis.KeyboardEvent) {
            if (event.key === 'Escape') cancelSelection()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    })

    function pointFromElement(element: Element | null): CellPoint | null {
        const cell = element?.closest<HTMLElement>('[data-week-grid-cell]')
        if (!cell || !matrixRef.current?.contains(cell)) return null
        const [row, col] = (cell.dataset.weekGridCell ?? '').split('-').map(Number)
        return Number.isFinite(row) && Number.isFinite(col) ? {row, col} : null
    }

    // Under pointer capture the other cells get no pointerenter, so the cell is found by
    // position. Leaving the grid clamps to its edge instead of cancelling.
    function pointFromPosition(clientX: number, clientY: number): CellPoint | null {
        const matrix = matrixRef.current
        if (!matrix || typeof document.elementFromPoint !== 'function') return null
        const first = matrix.querySelector<HTMLElement>('[data-week-grid-cell="0-0"]')
        const last = matrix.querySelector<HTMLElement>(`[data-week-grid-cell="${rowCount - 1}-${colCount - 1}"]`)
        let x = clientX
        let y = clientY
        if (first && last) {
            const a = first.getBoundingClientRect()
            const b = last.getBoundingClientRect()
            x = Math.min(Math.max(x, Math.min(a.left, b.left) + 1), Math.max(a.right, b.right) - 1)
            y = Math.min(Math.max(y, a.top + 1), b.bottom - 1)
        }
        return pointFromElement(document.elementFromPoint(x, y))
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (!selectMode || event.button !== 0) return
        const point = pointFromElement(event.target as Element)
        if (!point) return
        event.preventDefault()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        draggingRef.current = true
        setActiveCell(point)
        updateSelection({anchor: point, focus: point, source: 'pointer'})
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const current = selectionRef.current
        if (!draggingRef.current || !current) return
        const point = pointFromPosition(event.clientX, event.clientY)
        if (point) updateSelection({...current, focus: point})
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        if (!draggingRef.current) return
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        commitSelection()
    }

    function selectHeader(anchor: CellPoint, focus: CellPoint) {
        if (!selectMode) return
        const next: Selection = {anchor, focus, source: 'pointer'}
        onSelectRange?.(toRange(next))
    }

    function handleGridKeyDown(
        event: KeyboardEvent<HTMLDivElement>,
        row: number,
        col: number,
        ctx: MWeekGridCellContext
    ) {
        const keyboardSelection = selectionRef.current?.source === 'keyboard' ? selectionRef.current : null
        if (event.key === 'Enter' || event.key === ' ') {
            if (keyboardSelection) {
                event.preventDefault()
                commitSelection()
                return
            }
            if (!onCellClick) return
            event.preventDefault()
            onCellClick(ctx)
            return
        }
        if (event.key === 'Escape' && keyboardSelection) {
            event.preventDefault()
            cancelSelection()
            return
        }
        const rtl = isRtlElement(matrixRef.current)
        const target = gridKeyTarget(event.key, event.ctrlKey || event.metaKey, row, col, rowCount, colCount, rtl)
        if (!target) return
        event.preventDefault()
        if (selectMode && event.shiftKey) {
            const anchor = keyboardSelection?.anchor ?? {row, col}
            updateSelection({anchor, focus: target, source: 'keyboard'})
        } else if (keyboardSelection) {
            cancelSelection()
        }
        focusCell(target.row, target.col)
    }

    const selectingBounds = selection ? selectionBounds(selection, selectMode ?? 'rect') : null
    const dragging = selection?.source === 'pointer'

    return (
        <div
            className={cn('mineral-week-grid', selectMode && 'mineral-week-grid--selectable', className)}
            style={wrapperStyle}
            {...rest}
        >
            {hasHeader && (
                <MStack spacing={'xs'}>
                    <div className={'mineral-week-grid__title-row'}>
                        <div className={'mineral-week-grid__title-text'}>
                            {title != null &&
                                (typeof title === 'string' ? (
                                    <MHeading level={5} id={labelledByTitle ? titleId : undefined}>
                                        {title}
                                    </MHeading>
                                ) : (
                                    title
                                ))}
                            {description != null &&
                                (typeof description === 'string' ? (
                                    <MSubText tone={'muted'}>{description}</MSubText>
                                ) : (
                                    description
                                ))}
                        </div>
                        {peakLabel != null && (
                            <MText size={'sm'} tone={'muted'}>
                                {peakLabel}
                            </MText>
                        )}
                    </div>
                    {hint != null && (
                        <MSubText size={'xs'} tone={'muted'}>
                            {hint}
                        </MSubText>
                    )}
                </MStack>
            )}

            <div
                ref={matrixRef}
                className={cn('mineral-week-grid__matrix', gridMode && 'mineral-week-grid__matrix--grid')}
                style={matrixStyle}
                role={gridMode ? 'grid' : undefined}
                aria-labelledby={labelledByTitle ? titleId : undefined}
                aria-multiselectable={selectMode ? true : undefined}
                onPointerDown={selectMode ? handlePointerDown : undefined}
                onPointerMove={selectMode ? handlePointerMove : undefined}
                onPointerUp={selectMode ? handlePointerUp : undefined}
                onPointerCancel={selectMode ? cancelSelection : undefined}
            >
                <GridRow enabled={gridMode}>
                    <div role={gridMode ? 'columnheader' : undefined} />
                    {cols.map((label, slot) => (
                        <div
                            key={`col-${slot}`}
                            className={'mineral-week-grid__col-header'}
                            role={gridMode ? 'columnheader' : undefined}
                        >
                            {selectMode === 'rect' ? (
                                // Whole column: every day at this slot.
                                <button
                                    type={'button'}
                                    className={'mineral-week-grid__header-button'}
                                    tabIndex={-1}
                                    onClick={() => selectHeader({row: 0, col: slot}, {row: rowCount - 1, col: slot})}
                                >
                                    <MSubText size={'xs'} tone={'muted'}>
                                        {label}
                                    </MSubText>
                                </button>
                            ) : (
                                <MSubText size={'xs'} tone={'muted'}>
                                    {label}
                                </MSubText>
                            )}
                        </div>
                    ))}
                </GridRow>

                {rows.map(({label: dayLabel, calendarDay}, rowIndex) => (
                    <GridRow enabled={gridMode} key={`row-${rowIndex}-${calendarDay}`}>
                        <div className={'mineral-week-grid__row-label'} role={gridMode ? 'rowheader' : undefined}>
                            {selectMode ? (
                                // Whole row: every slot of this day.
                                <button
                                    type={'button'}
                                    className={'mineral-week-grid__header-button'}
                                    tabIndex={-1}
                                    onClick={() =>
                                        selectHeader({row: rowIndex, col: 0}, {row: rowIndex, col: colCount - 1})
                                    }
                                >
                                    <MSubText size={'xs'} tone={'muted'}>
                                        {dayLabel}
                                    </MSubText>
                                </button>
                            ) : (
                                <MSubText size={'xs'} tone={'muted'}>
                                    {dayLabel}
                                </MSubText>
                            )}
                        </div>
                        {cols.map((slotLabel, slot) => {
                            const value = grid[calendarDay]?.[slot] ?? 0
                            const band = densityBand(value, resolvedMax)
                            const ctx: MWeekGridCellContext = {day: calendarDay, slot, value, band}
                            const cellContent = renderCell ? renderCell(ctx) : defaultRenderCell(ctx)
                            const tooltipContent = renderTooltip
                                ? renderTooltip(ctx)
                                : defaultRenderTooltip(ctx, dayLabel, slotLabel)

                            const selecting =
                                !!selectingBounds &&
                                rowIndex >= selectingBounds.rowFrom &&
                                rowIndex <= selectingBounds.rowTo &&
                                slot >= selectingBounds.colFrom &&
                                slot <= selectingBounds.colTo
                            const cellClasses = cn(
                                'mineral-week-grid__cell',
                                `mineral-week-grid__cell--band-${band}`,
                                (onCellClick || selectMode) && 'mineral-week-grid__cell--interactive',
                                selecting && 'mineral-week-grid__cell--selecting',
                                !onCellClick && tooltipContent != null && 'mineral-week-grid__cell--tooltip',
                                gridMode && 'mineral-week-grid__cell--grid'
                            )
                            const isActive = active.row === rowIndex && active.col === slot

                            const handleKeyDown = gridMode
                                ? (event: KeyboardEvent<HTMLDivElement>) =>
                                      handleGridKeyDown(event, rowIndex, slot, ctx)
                                : onCellClick
                                  ? (event: KeyboardEvent<HTMLDivElement>) => {
                                        if (event.key !== 'Enter' && event.key !== ' ') return
                                        event.preventDefault()
                                        onCellClick(ctx)
                                    }
                                  : undefined

                            const cellNode = (
                                <div
                                    className={cellClasses}
                                    style={{height: cellHeight}}
                                    // With selectable the click comes from pointerup, so it never doubles up.
                                    onClick={onCellClick && !selectMode ? () => onCellClick(ctx) : undefined}
                                    onKeyDown={handleKeyDown}
                                    onFocus={gridMode ? () => setActiveCell({row: rowIndex, col: slot}) : undefined}
                                    data-week-grid-cell={gridMode ? `${rowIndex}-${slot}` : undefined}
                                    data-selecting={selecting || undefined}
                                    aria-selected={selectMode ? selecting : undefined}
                                    role={gridMode ? 'gridcell' : legacyButtons ? 'button' : undefined}
                                    tabIndex={gridMode ? (isActive ? 0 : -1) : legacyButtons ? 0 : undefined}
                                    aria-label={
                                        gridMode || legacyButtons
                                            ? formatMText(texts.cellLabel, {day: dayLabel, slot: slotLabel, value})
                                            : undefined
                                    }
                                >
                                    {cellContent}
                                </div>
                            )

                            if (tooltipContent == null) {
                                return <Fragment key={`cell-${rowIndex}-${slot}`}>{cellNode}</Fragment>
                            }

                            return (
                                // No tooltip while dragging: it would cover the cells being picked.
                                <MTooltip key={`cell-${rowIndex}-${slot}`} content={dragging ? null : tooltipContent}>
                                    {cellNode}
                                </MTooltip>
                            )
                        })}
                    </GridRow>
                ))}
            </div>

            {selectMode && (
                <span className={'mineral-week-grid__sr-only'} aria-live={'polite'}>
                    {announcement}
                </span>
            )}

            {showLegend && (
                <div className={'mineral-week-grid__legend'}>
                    <MSubText size={'xs'} tone={'muted'}>
                        {formatMText(texts.scale, {
                            min: 0,
                            max: resolvedMax,
                            unit: legendUnit ? ` ${legendUnit}` : '',
                        })}
                    </MSubText>
                    <div className={'mineral-week-grid__legend-bands'}>
                        {legendBands.map((band) => (
                            <div key={`legend-${band}`} className={'mineral-week-grid__legend-band'}>
                                <span
                                    className={cn(
                                        'mineral-week-grid__legend-swatch',
                                        `mineral-week-grid__cell--band-${band}`
                                    )}
                                />
                                <MSubText size={'xs'} tone={'muted'}>
                                    {resolvedBandLabels[band]}
                                </MSubText>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

/** A `role="row"` wrapper in grid mode (`display: contents`, so the CSS grid is untouched). */
function GridRow({enabled, children}: {enabled: boolean; children: ReactNode}) {
    if (!enabled) return <>{children}</>
    return (
        <div role={'row'} className={'mineral-week-grid__row'}>
            {children}
        </div>
    )
}
