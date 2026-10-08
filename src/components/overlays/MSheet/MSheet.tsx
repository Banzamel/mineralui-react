import {useEffect, useId, useRef, useState} from 'react'
import type {PointerEvent as ReactPointerEvent, MouseEvent} from 'react'
import type {MSheetProps, MSheetSize} from './MSheet.types'
import {MCard, MCardBody, MCardFooter, MCardHeader} from '../../cards'
import {MButton} from '../../controls'
import {MPortal} from '../../primitives'
import {MCloseIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import {useModalLayer} from '../../../utils/useModalLayer'
import {lockBodyScroll} from '../scrollLock'
import './MSheet.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

const EXIT_DURATION = 540
const CLOSE_DRAG_THRESHOLD = 72

const SHEET_HEIGHTS: Record<MSheetSize, string> = {
    sm: '32vh',
    md: '52vh',
    lg: '72vh',
    full: '92vh',
}

export function MSheet({
    open,
    onClose,
    title,
    description,
    footer,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    className,
    children,
    style,
    ...rest
}: MSheetProps) {
    const texts = useMCommonTexts()
    const titleId = useId()
    const [mounted, setMounted] = useState(false)
    const [closing, setClosing] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)

    const dragStateRef = useRef<{pointerId: number; startY: number} | null>(null)
    const dragOffsetRef = useRef(0)
    const backdropRef = useRef<HTMLDivElement>(null)

    useModalLayer({active: open && mounted, containerRef: backdropRef, onEscape: closeOnEscape ? onClose : undefined})

    useEffect(() => {
        if (open) {
            setMounted(true)
            setClosing(false)
            setDragOffset(0)
            dragOffsetRef.current = 0
        }
    }, [open])

    useEffect(() => {
        if (!open && mounted) {
            setClosing(true)
            const timer = window.setTimeout(() => {
                setMounted(false)
                setClosing(false)
            }, EXIT_DURATION)
            return () => window.clearTimeout(timer)
        }
    }, [open, mounted])

    useEffect(() => {
        if (!mounted) return
        return lockBodyScroll()
    }, [mounted])

    function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose()
        }
    }

    function handleHandlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)

        dragStateRef.current = {
            pointerId: event.pointerId,
            startY: event.clientY,
        }
        setDragOffset(0)
        dragOffsetRef.current = 0
    }

    function handleHandlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
        const dragState = dragStateRef.current
        if (!dragState || dragState.pointerId !== event.pointerId) {
            return
        }

        const nextOffset = Math.max(event.clientY - dragState.startY, 0)
        dragOffsetRef.current = nextOffset
        setDragOffset(nextOffset)
    }

    function finishDrag(pointerId: number) {
        const dragState = dragStateRef.current
        if (!dragState || dragState.pointerId !== pointerId) {
            return
        }

        dragStateRef.current = null

        if (dragOffsetRef.current > CLOSE_DRAG_THRESHOLD) {
            setDragOffset(0)
            dragOffsetRef.current = 0
            onClose()
            return
        }

        setDragOffset(0)
        dragOffsetRef.current = 0
    }

    if (!mounted) return null

    const resolvedHeight = SHEET_HEIGHTS[size]
    const transformStyle = dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined

    return (
        <MPortal>
            <div
                ref={backdropRef}
                className={cn('mineral-backdrop', 'sheet-backdrop', closing && 'closing')}
                onMouseDown={handleBackdropClick}
            >
                <div className="sheet-shell" style={{transform: transformStyle}}>
                    <MCard
                        className={cn('sheet', `size-${size}`, className)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? titleId : undefined}
                        style={{
                            ...style,
                            height: size === 'full' ? resolvedHeight : undefined,
                            maxHeight: resolvedHeight,
                        }}
                        {...rest}
                    >
                        <button
                            type="button"
                            className="sheet-grabber"
                            onPointerDown={handleHandlePointerDown}
                            onPointerMove={handleHandlePointerMove}
                            onPointerUp={(event) => finishDrag(event.pointerId)}
                            onPointerCancel={(event) => finishDrag(event.pointerId)}
                            // Enter / Space on the grabber produce a click with `detail === 0`;
                            // keyboard users get the same "close" the drag gesture offers.
                            // Pointer clicks (detail >= 1) stay drag-only.
                            onClick={(event) => {
                                if (event.detail === 0) onClose()
                            }}
                            aria-label={texts.dragToClose}
                        >
                            <span className="sheet-handle" />
                        </button>

                        {(title || description) && (
                            <MCardHeader className="sheet-header">
                                <div className="sheet-copy">
                                    {title && (
                                        <div id={titleId} className="sheet-title">
                                            {title}
                                        </div>
                                    )}
                                    {description && <div className="sheet-description">{description}</div>}
                                </div>
                                <MButton
                                    variant="link"
                                    color="neutral"
                                    iconOnly
                                    size="sm"
                                    onClick={onClose}
                                    aria-label={texts.close}
                                    className="sheet-close"
                                >
                                    <MCloseIcon />
                                </MButton>
                            </MCardHeader>
                        )}

                        <MCardBody className="sheet-body">{children}</MCardBody>

                        {footer && <MCardFooter className="sheet-footer">{footer}</MCardFooter>}
                    </MCard>
                </div>
            </div>
        </MPortal>
    )
}
