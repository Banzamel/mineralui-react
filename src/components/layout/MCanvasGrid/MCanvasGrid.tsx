import {forwardRef, useCallback, useEffect, useId, useRef, useState} from 'react'
import type {
    CSSProperties,
    ForwardedRef,
    KeyboardEvent as ReactKeyboardEvent,
    PointerEvent as ReactPointerEvent,
    ReactElement,
    Ref,
} from 'react'
import type {MCanvasGridItem, MCanvasGridPosition, MCanvasGridProps} from './MCanvasGrid.types'
import {cn} from '../../../utils/cn'
import {MShellBreakpoints, useMaxWidth} from '../../../theme'
import {MEditIcon, MMoveIcon, MTrashIcon, MZoomInIcon} from '../../../icons'
import {MButton} from '../../controls/MButton'
import {MButtonGroup} from '../../controls/MButtonGroup'
import {ScaleToFit} from './ScaleToFit'
import './MCanvasGrid.css'
import {formatMText, useMLayoutTexts} from '../../../i18n/frameworkTexts'

interface DragState {
    itemId: string
    mode: 'drag' | 'resize'
    startClientX: number
    startClientY: number
    original: MCanvasGridPosition
}

/** Keyboard move / resize in progress (the handle button is pressed). */
interface KeyboardMoveState {
    itemId: string
    original: MCanvasGridPosition
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function MCanvasGridInner<T extends MCanvasGridItem>(
    {
        columns = 24,
        rows = 24,
        snap = 4,
        items,
        renderItem,
        getItemLabel,
        minItemSize,
        maxItemSize: _maxItemSize,
        editable = false,
        onItemMove,
        onItemResize,
        onItemRemove,
        onItemEdit,
        onItemExpand,
        guides = 'always',
        compactBreakpoint = MShellBreakpoints.compact,
        mobileBreakpoint = MShellBreakpoints.mobile,
        height,
        fitContent = 'scroll',
        fitContentBaseWidth = 480,
        className,
        style,
    }: MCanvasGridProps<T>,
    ref: ForwardedRef<HTMLDivElement>
) {
    const texts = useMLayoutTexts()
    const instructionsId = `${useId()}-canvas-grid-instructions`
    const innerRef = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState({width: 0, height: 0})
    const [drag, setDrag] = useState<DragState | null>(null)
    const [preview, setPreview] = useState<MCanvasGridPosition | null>(null)
    const [touchOrder, setTouchOrder] = useState<Record<string, number>>({})
    const touchCounterRef = useRef(0)
    const [keyMove, setKeyMove] = useState<KeyboardMoveState | null>(null)
    const [announcement, setAnnouncement] = useState('')

    function bringToFront(itemId: string) {
        touchCounterRef.current += 1
        setTouchOrder((prev) => ({...prev, [itemId]: touchCounterRef.current}))
    }

    function suppressNextClick() {
        let armed = true
        const stopper = (ev: MouseEvent) => {
            if (!armed) return
            armed = false
            ev.stopPropagation()
            ev.preventDefault()
            window.removeEventListener('click', stopper, true)
        }
        window.addEventListener('click', stopper, true)
        window.setTimeout(() => {
            if (!armed) return
            armed = false
            window.removeEventListener('click', stopper, true)
        }, 60)
    }

    const isMobile = useMaxWidth(mobileBreakpoint)
    const isCompact = useMaxWidth(compactBreakpoint) && !isMobile

    const totalCols = columns * snap
    const totalRows = rows * snap
    // Tiles always live on the full-resolution track grid: halving positions in the
    // compact viewport lost precision (tiles overlapped) and made a drag move the tile
    // by half the cursor distance. Compact mode only coarsens the guide overlay.
    const effectiveCols = totalCols
    const effectiveRows = totalRows
    const effectiveCells = isCompact ? Math.max(1, Math.round(columns / 2)) : columns
    const effectiveRowCells = isCompact ? Math.max(1, Math.round(rows / 2)) : rows

    const interactive = editable && !isMobile

    useEffect(() => {
        const node = innerRef.current
        if (!node || typeof ResizeObserver === 'undefined') return
        const update = () => setSize({width: node.clientWidth, height: node.clientHeight})
        update()
        const observer = new ResizeObserver(update)
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) (ref as {current: HTMLDivElement | null}).current = node
        },
        [ref]
    )

    function getMin(item: T) {
        const m = minItemSize?.(item)
        if (!m) return {w: snap, h: snap}
        return {w: Math.max(snap, m.w * snap), h: Math.max(snap, m.h * snap)}
    }

    function startResize(e: ReactPointerEvent<HTMLDivElement>, item: T) {
        if (!interactive) return
        e.stopPropagation()
        e.preventDefault()
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        bringToFront(item.id)
        setKeyMove(null)
        setDrag({
            itemId: item.id,
            mode: 'resize',
            startClientX: e.clientX,
            startClientY: e.clientY,
            original: {...item.position},
        })
        setPreview({...item.position})
    }

    function startDragFromHeader(e: ReactPointerEvent<HTMLDivElement>, item: T) {
        if (!interactive) return
        if ((e.target as Element).closest('button, [role="button"]')) return
        e.stopPropagation()
        e.preventDefault()
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        bringToFront(item.id)
        setKeyMove(null)
        setDrag({
            itemId: item.id,
            mode: 'drag',
            startClientX: e.clientX,
            startClientY: e.clientY,
            original: {...item.position},
        })
        setPreview({...item.position})
    }

    function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!drag || size.width === 0 || size.height === 0) return
        const cellPxX = size.width / effectiveCols
        const cellPxY = size.height / effectiveRows
        const dx = Math.round((e.clientX - drag.startClientX) / cellPxX)
        const dy = Math.round((e.clientY - drag.startClientY) / cellPxY)
        const original = drag.original

        const targetItem = items.find((it) => it.id === drag.itemId)
        const min = targetItem ? getMin(targetItem) : {w: snap, h: snap}

        if (drag.mode === 'drag') {
            const x = clamp(original.x + dx, 0, effectiveCols - original.w)
            const y = clamp(original.y + dy, 0, effectiveRows - original.h)
            setPreview({x, y, w: original.w, h: original.h})
        } else {
            const w = clamp(original.w + dx, min.w, effectiveCols - original.x)
            const h = clamp(original.h + dy, min.h, effectiveRows - original.y)
            setPreview({x: original.x, y: original.y, w, h})
        }
    }

    function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
        if (!drag) return
        try {
            ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
        } catch {
            // pointer may have already been released
        }
        if (preview) {
            if (drag.mode === 'drag') onItemMove?.(drag.itemId, preview)
            else onItemResize?.(drag.itemId, preview)
        }
        setDrag(null)
        setPreview(null)
    }

    // A cancelled gesture (pointercancel, Escape) restores the original position
    // instead of committing the preview.
    function cancelDrag(e?: ReactPointerEvent<HTMLDivElement>) {
        if (!drag) return
        if (e) {
            try {
                ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
            } catch {
                // pointer may have already been released
            }
        }
        setDrag(null)
        setPreview(null)
    }

    useEffect(() => {
        if (!drag) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            setDrag(null)
            setPreview(null)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [drag])

    function handleHeaderPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
        if (drag) {
            suppressNextClick()
            handlePointerUp(e)
        }
    }

    function labelOf(item: T) {
        const custom = getItemLabel?.(item)
        if (custom) return custom
        return formatMText(texts.canvasGridTile, {number: items.indexOf(item) + 1})
    }

    function describePosition(template: string, label: string, position: MCanvasGridPosition) {
        return formatMText(template, {
            label,
            column: position.x + 1,
            row: position.y + 1,
            width: position.w,
            height: position.h,
        })
    }

    // The handle is a toggle: pressing it picks the tile up, pressing it again drops it there.
    function toggleKeyboardMove(item: T) {
        if (!interactive) return
        const label = labelOf(item)
        if (keyMove?.itemId === item.id) {
            const final = preview ?? item.position
            const original = keyMove.original
            if (final.x !== original.x || final.y !== original.y) onItemMove?.(item.id, final)
            if (final.w !== original.w || final.h !== original.h) onItemResize?.(item.id, final)
            setKeyMove(null)
            setPreview(null)
            setAnnouncement(describePosition(texts.canvasGridDropped, label, final))
            return
        }
        // A pointer gesture and a keyboard move never run at the same time.
        setDrag(null)
        bringToFront(item.id)
        setKeyMove({itemId: item.id, original: {...item.position}})
        setPreview({...item.position})
        setAnnouncement(describePosition(texts.canvasGridGrabbed, label, item.position))
    }

    function cancelKeyboardMove(item: T, announce: boolean) {
        if (keyMove?.itemId !== item.id) return
        setKeyMove(null)
        setPreview(null)
        if (announce) setAnnouncement(formatMText(texts.canvasGridCancelled, {label: labelOf(item)}))
    }

    function handleHandleKeyDown(event: ReactKeyboardEvent<HTMLElement>, item: T) {
        if (keyMove?.itemId !== item.id) return
        if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            cancelKeyboardMove(item, true)
            return
        }
        const deltas: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
        }
        const delta = deltas[event.key]
        if (!delta || event.altKey || event.ctrlKey || event.metaKey) return
        event.preventDefault()
        const current = preview ?? item.position
        let next: MCanvasGridPosition
        if (event.shiftKey) {
            if (!onItemResize) return
            const min = getMin(item)
            next = {
                ...current,
                w: clamp(current.w + delta[0], min.w, effectiveCols - current.x),
                h: clamp(current.h + delta[1], min.h, effectiveRows - current.y),
            }
        } else {
            if (!onItemMove) return
            next = {
                ...current,
                x: clamp(current.x + delta[0], 0, effectiveCols - current.w),
                y: clamp(current.y + delta[1], 0, effectiveRows - current.h),
            }
        }
        setPreview(next)
        setAnnouncement(describePosition(texts.canvasGridPosition, labelOf(item), next))
    }

    const guidesOn =
        guides === 'always' ||
        (guides === 'on-edit' && interactive) ||
        (guides === 'on-drag' && (drag !== null || keyMove !== null))

    const heightStyle: CSSProperties | undefined =
        height !== undefined ? {height: typeof height === 'number' ? `${height}px` : height} : undefined

    if (isMobile) {
        const ordered = [...items].sort((a, b) => a.position.y - b.position.y)
        return (
            <div
                ref={setRefs}
                className={cn('canvas-grid', 'mobile', className)}
                data-guides="off"
                style={{...heightStyle, ...style}}
            >
                {ordered.map((item) => (
                    <div key={item.id} className="canvas-grid-item">
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        )
    }

    const gridStyle: CSSProperties = {
        ...heightStyle,
        ...style,
        gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
        gridTemplateRows: `repeat(${effectiveRows}, 1fr)`,
        ['--canvas-grid-cells' as string]: String(effectiveCells),
        ['--canvas-grid-row-cells' as string]: String(effectiveRowCells),
    }

    const overlayCells = effectiveCells * effectiveRowCells

    return (
        <div
            ref={setRefs}
            className={cn('canvas-grid', isCompact && 'compact', interactive && 'editable', className)}
            data-guides={guidesOn ? 'on' : 'off'}
            style={gridStyle}
        >
            <div className="canvas-grid-overlay" aria-hidden>
                {Array.from({length: overlayCells}, (_, idx) => {
                    const isLastCol = (idx + 1) % effectiveCells === 0
                    const isLastRow = idx >= overlayCells - effectiveCells
                    return (
                        <div
                            key={idx}
                            className={cn('canvas-grid-cell', isLastCol && 'no-right', isLastRow && 'no-bottom')}
                        />
                    )
                })}
            </div>

            {interactive && (
                <>
                    <span id={instructionsId} className="canvas-grid-sr-only">
                        {texts.canvasGridInstructions}
                    </span>
                    <div role="status" aria-live="polite" aria-atomic="true" className="canvas-grid-sr-only">
                        {announcement}
                    </div>
                </>
            )}

            {items.map((item) => {
                const isDragging = drag?.itemId === item.id
                const isKeyMoving = interactive && keyMove?.itemId === item.id
                const label = labelOf(item)
                const live = (isDragging || isKeyMoving) && preview ? preview : item.position
                const x = live.x
                const y = live.y
                const w = Math.max(1, live.w)
                const h = Math.max(1, live.h)

                const baseZ = 1 + (touchOrder[item.id] ?? 0)
                const itemStyle: CSSProperties = {
                    gridColumn: `${x + 1} / span ${w}`,
                    gridRow: `${y + 1} / span ${h}`,
                    zIndex: isDragging || isKeyMoving ? baseZ + 100 : baseZ,
                }
                const canKeyboardMove = interactive && (onItemMove !== undefined || onItemResize !== undefined)

                return (
                    <div
                        key={item.id}
                        className={cn('canvas-grid-item', isDragging && 'dragging', isKeyMoving && 'keyboard-moving')}
                        style={itemStyle}
                    >
                        <div
                            className="canvas-grid-item-header"
                            onPointerDown={(e) => startDragFromHeader(e, item)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handleHeaderPointerUp}
                            onPointerCancel={cancelDrag}
                        >
                            <MButtonGroup variant="ghost" size="xs">
                                {canKeyboardMove && (
                                    <MButton
                                        className="canvas-grid-move-handle"
                                        color="primary"
                                        iconOnly
                                        aria-label={formatMText(texts.canvasGridHandle, {label})}
                                        aria-describedby={instructionsId}
                                        aria-pressed={isKeyMoving}
                                        startIcon={<MMoveIcon />}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleKeyboardMove(item)
                                        }}
                                        onKeyDown={(e) => handleHandleKeyDown(e, item)}
                                        onBlur={() => cancelKeyboardMove(item, true)}
                                    />
                                )}
                                {interactive && onItemEdit && (
                                    <MButton
                                        color="primary"
                                        iconOnly
                                        aria-label={formatMText(texts.canvasGridEdit, {label})}
                                        startIcon={<MEditIcon />}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onItemEdit(item.id)
                                        }}
                                    />
                                )}
                                {onItemExpand && (
                                    <MButton
                                        color="primary"
                                        iconOnly
                                        aria-label={formatMText(texts.canvasGridExpand, {label})}
                                        startIcon={<MZoomInIcon />}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onItemExpand(item.id)
                                        }}
                                    />
                                )}
                                {interactive && onItemRemove && (
                                    <MButton
                                        color="error"
                                        iconOnly
                                        aria-label={formatMText(texts.canvasGridRemove, {label})}
                                        startIcon={<MTrashIcon />}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onItemRemove(item.id)
                                        }}
                                    />
                                )}
                            </MButtonGroup>
                        </div>
                        <div className="canvas-grid-item-body">
                            {fitContent === 'scale' ? (
                                <ScaleToFit baseWidth={fitContentBaseWidth}>{renderItem(item)}</ScaleToFit>
                            ) : (
                                renderItem(item)
                            )}
                        </div>
                        {!interactive && onItemExpand && (
                            <MButton
                                className="canvas-grid-view-expand-handle"
                                variant="filled"
                                shape="circle"
                                size="sm"
                                color="primary"
                                iconOnly
                                aria-label={formatMText(texts.canvasGridExpand, {label})}
                                startIcon={<MZoomInIcon />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onItemExpand(item.id)
                                }}
                            />
                        )}
                        {interactive && isDragging && (
                            <div className="canvas-grid-item-glass" aria-hidden>
                                <MMoveIcon size={28} />
                            </div>
                        )}
                        {interactive && (
                            <div
                                className="canvas-grid-resize-handle"
                                aria-hidden
                                onPointerDown={(e) => startResize(e, item)}
                                onPointerMove={handlePointerMove}
                                onPointerUp={(e) => {
                                    if (drag) suppressNextClick()
                                    handlePointerUp(e)
                                }}
                                onPointerCancel={cancelDrag}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export const MCanvasGrid = forwardRef(MCanvasGridInner) as <T extends MCanvasGridItem>(
    props: MCanvasGridProps<T> & {ref?: Ref<HTMLDivElement>}
) => ReactElement | null
