import {forwardRef, useCallback, useEffect, useRef, useState} from 'react'
import type {CSSProperties, ForwardedRef, PointerEvent as ReactPointerEvent, ReactElement, Ref} from 'react'
import type {MCanvasGridItem, MCanvasGridPosition, MCanvasGridProps} from './MCanvasGrid.types'
import {cn} from '../../../utils/cn'
import {MShellBreakpoints, useMaxWidth} from '../../../theme'
import {MEditIcon, MMoveIcon, MTrashIcon, MZoomInIcon} from '../../../icons'
import {MButton} from '../../controls/MButton'
import {MButtonGroup} from '../../controls/MButtonGroup'
import {ScaleToFit} from './ScaleToFit'
import './MCanvasGrid.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

interface DragState {
    itemId: string
    mode: 'drag' | 'resize'
    startClientX: number
    startClientY: number
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
    const texts = useMCommonTexts()
    const innerRef = useRef<HTMLDivElement | null>(null)
    const [size, setSize] = useState({width: 0, height: 0})
    const [drag, setDrag] = useState<DragState | null>(null)
    const [preview, setPreview] = useState<MCanvasGridPosition | null>(null)
    const [touchOrder, setTouchOrder] = useState<Record<string, number>>({})
    const touchCounterRef = useRef(0)

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
    const effectiveCols = isCompact ? Math.max(1, Math.round(totalCols / 2)) : totalCols
    const effectiveRows = isCompact ? Math.max(1, Math.round(totalRows / 2)) : totalRows
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

    function handleHeaderPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
        if (drag) {
            suppressNextClick()
            handlePointerUp(e)
        }
    }

    const guidesOn =
        guides === 'always' || (guides === 'on-edit' && interactive) || (guides === 'on-drag' && drag !== null)

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

            {items.map((item) => {
                const isDragging = drag?.itemId === item.id
                const live = isDragging && preview ? preview : item.position
                // half-precision math for compact viewport
                const x = isCompact ? Math.round(live.x / 2) : live.x
                const y = isCompact ? Math.round(live.y / 2) : live.y
                const w = Math.max(1, isCompact ? Math.round(live.w / 2) : live.w)
                const h = Math.max(1, isCompact ? Math.round(live.h / 2) : live.h)

                const baseZ = 1 + (touchOrder[item.id] ?? 0)
                const itemStyle: CSSProperties = {
                    gridColumn: `${x + 1} / span ${w}`,
                    gridRow: `${y + 1} / span ${h}`,
                    zIndex: isDragging ? baseZ + 100 : baseZ,
                }

                return (
                    <div key={item.id} className={cn('canvas-grid-item', isDragging && 'dragging')} style={itemStyle}>
                        <div
                            className="canvas-grid-item-header"
                            onPointerDown={(e) => startDragFromHeader(e, item)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handleHeaderPointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            <MButtonGroup variant="ghost" size="xs">
                                {interactive && onItemEdit && (
                                    <MButton
                                        color="primary"
                                        iconOnly
                                        aria-label={texts.editTile}
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
                                        aria-label={texts.expandTile}
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
                                        aria-label={texts.removeTile}
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
                                aria-label={texts.expandTile}
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
                                onPointerCancel={handlePointerUp}
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
