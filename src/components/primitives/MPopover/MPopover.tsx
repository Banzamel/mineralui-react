import {useState, useEffect, useRef, useCallback} from 'react'
import {MPortal} from '../MPortal'
import {cn} from '../../../utils/cn'
import {isInsideDescendantPopover, nextPopoverId, registerPopover} from './popoverStack'
import type {MPopoverProps} from './MPopover.types'
import './MPopover.css'

// Position floating content relative to an anchor with viewport-aware flipping.
export function MPopover({
    open,
    anchorRef,
    onClose,
    placement = 'bottom-start',
    matchWidth = false,
    offset = 4,
    zIndex,
    children,
    className,
    style,
}: MPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null)
    const popoverIdRef = useRef<number>(null)
    if (popoverIdRef.current === null) popoverIdRef.current = nextPopoverId()
    const popoverId = popoverIdRef.current
    const [position, setPosition] = useState<{top: number; left: number; width?: number} | null>(null)
    const [flipped, setFlipped] = useState(false)
    const [layerZ, setLayerZ] = useState<number | string | null>(null)

    // Lift popovers above drawers, modals and mobile sidebars when the anchor sits inside them.
    const updateLayer = useCallback(() => {
        if (zIndex !== undefined) {
            setLayerZ(zIndex)
            return
        }

        const anchor = anchorRef.current
        if (!anchor || typeof window === 'undefined') {
            setLayerZ(null)
            return
        }

        const layerHost = anchor.closest(
            '.drawer-backdrop, .modal-backdrop, .sheet-backdrop, .sidebar.mobile-open, .popover'
        )
        if (!layerHost) {
            setLayerZ(null)
            return
        }

        const computedZ = window.getComputedStyle(layerHost).zIndex
        const parsedZ = Number.parseInt(computedZ, 10)
        setLayerZ(Number.isFinite(parsedZ) ? parsedZ + 1 : null)
    }, [anchorRef, zIndex])

    // Recalculate popover position whenever layout or viewport constraints change.
    const updatePosition = useCallback(() => {
        if (!anchorRef.current || !popoverRef.current) return

        const anchor = anchorRef.current.getBoundingClientRect()
        // Layout size, not getBoundingClientRect: the open animation scales the popover, and
        // measuring mid-animation under-reports its height by ~5 % (enough to overflow the
        // viewport after a flip / shift).
        const popover = {width: popoverRef.current.offsetWidth, height: popoverRef.current.offsetHeight}
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        }

        const isTop = placement.startsWith('top')
        const isRight = placement.startsWith('right')
        const isLeft = placement.startsWith('left')
        const isHorizontal = isRight || isLeft
        const isEnd = placement.endsWith('end')

        let top: number
        let left: number

        if (isHorizontal) {
            // Horizontal placement: position to the right or left of the anchor
            const spaceRight = viewport.width - anchor.right - offset
            const spaceLeft = anchor.left - offset
            const shouldFlip = isRight
                ? spaceRight < popover.width && spaceLeft > spaceRight
                : spaceLeft < popover.width && spaceRight > spaceLeft

            setFlipped(shouldFlip)

            const showOnRight = isRight ? !shouldFlip : shouldFlip

            if (showOnRight) {
                left = anchor.right + offset + window.scrollX
            } else {
                left = anchor.left - popover.width - offset + window.scrollX
            }

            if (isEnd) {
                top = anchor.bottom - popover.height + window.scrollY
            } else {
                top = anchor.top + window.scrollY
            }

            // Shift along the anchor edge so a side popover near the bottom of the viewport
            // slides up instead of running off-screen (the top clamp below wins when it is
            // taller than the viewport).
            top = Math.min(top, window.scrollY + viewport.height - popover.height - 8)
        } else {
            // Vertical placement: position above or below the anchor
            const spaceBelow = viewport.height - anchor.bottom - offset
            const spaceAbove = anchor.top - offset
            const shouldFlip = isTop
                ? spaceAbove < popover.height && spaceBelow > spaceAbove
                : spaceBelow < popover.height && spaceAbove > spaceBelow

            setFlipped(shouldFlip)

            const showOnTop = isTop ? !shouldFlip : shouldFlip

            if (showOnTop) {
                top = anchor.top - popover.height - offset + window.scrollY
            } else {
                top = anchor.bottom + offset + window.scrollY
            }

            if (isEnd) {
                left = anchor.right - popover.width + window.scrollX
            } else {
                left = anchor.left + window.scrollX
            }
        }

        // Clamp to viewport
        left = Math.max(8, Math.min(left, viewport.width - popover.width - 8))
        top = Math.max(8 + window.scrollY, top)

        setPosition({
            top,
            left,
            width: matchWidth ? anchor.width : undefined,
        })
    }, [anchorRef, placement, offset, matchWidth])

    useEffect(() => {
        if (!open) {
            setPosition(null)
            setLayerZ(null)
            return
        }

        updateLayer()
        // Wait one frame so the rendered popover can be measured accurately.
        requestAnimationFrame(updatePosition)

        // Content that grows after opening (images, expanded lists) must re-run the
        // flip / shift, or the popover drifts past the viewport edge.
        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => updatePosition())
        if (resizeObserver && popoverRef.current) {
            resizeObserver.observe(popoverRef.current)
        }

        // `scroll` does not bubble, so a window listener only ever sees the
        // document scrolling. Anchors living inside a scrollable ancestor — an
        // app shell with a scrolling main region, MStickyPanel, an overflowing
        // card — would leave the popover stranded at its opening coordinates
        // while the anchor moved away underneath it. Scroll events do capture,
        // so a capture-phase listener on the document catches scrolling from
        // ANY container, including the document itself.
        document.addEventListener('scroll', updatePosition, {capture: true, passive: true})
        window.addEventListener('resize', updatePosition, {passive: true})
        return () => {
            resizeObserver?.disconnect()
            document.removeEventListener('scroll', updatePosition, {capture: true})
            window.removeEventListener('resize', updatePosition)
        }
    }, [open, updateLayer, updatePosition])

    // Close the popover with the standard Escape key interaction.
    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    // Publish this instance while it is open so nested popovers can be related
    // back to it — see popoverStack.ts for why the DOM alone cannot answer this.
    useEffect(() => {
        if (!open) return
        return registerPopover({
            id: popoverId,
            getPopoverEl: () => popoverRef.current,
            getAnchorEl: () => anchorRef.current,
        })
    }, [open, popoverId, anchorRef])

    // Close when the user interacts outside both the popover and its anchor.
    useEffect(() => {
        if (!open) return
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node

            if (popoverRef.current?.contains(target) || anchorRef.current?.contains(target)) {
                return
            }

            // A popover nested inside this one is portaled to `document.body`,
            // so it fails the `contains` checks above even though the click
            // belongs to this popover's own subtree. Closing here would unmount
            // that child between mousedown and mouseup and swallow its click.
            if (isInsideDescendantPopover(popoverId, target)) {
                return
            }

            onClose()
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open, onClose, anchorRef, popoverId])

    if (!open) return null

    return (
        <MPortal>
            <div
                ref={popoverRef}
                className={cn('popover', flipped ? 'flipped' : 'normal', className)}
                style={{
                    position: 'absolute',
                    top: position?.top ?? 0,
                    left: position?.left ?? 0,
                    width: position?.width,
                    zIndex: layerZ ?? undefined,
                    visibility: position ? 'visible' : 'hidden',
                    ...style,
                }}
                role="listbox"
            >
                {children}
            </div>
        </MPortal>
    )
}
