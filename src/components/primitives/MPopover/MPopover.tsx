import {useState, useEffect, useRef, useCallback} from 'react'
import type {FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent} from 'react'
import {MPortal} from '../MPortal'
import {cn} from '../../../utils/cn'
import {getFocusable, getTabbable} from '../../../utils/useModalLayer'
import {isInsideDescendantPopover, isTopPopover, nextPopoverId, registerPopover} from './popoverStack'
import type {MPopoverProps} from './MPopover.types'
import './MPopover.css'

// Focus the anchor itself when it is focusable, otherwise the first focusable element inside it.
function focusAnchor(anchor: HTMLElement | null): boolean {
    if (!anchor || !anchor.isConnected) return false
    const target =
        anchor.tabIndex >= 0 && !anchor.hasAttribute('disabled')
            ? anchor
            : (getTabbable(anchor)[0] ?? getFocusable(anchor)[0] ?? null)
    if (!target) return false
    target.focus({preventScroll: true})
    return target.ownerDocument.activeElement === target
}

function focusIsLost(): boolean {
    const active = document.activeElement
    return !active || active === document.body || !active.isConnected
}

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
    role = 'listbox',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    id,
    initialFocus,
    restoreFocus = true,
    closeOnTabOut = false,
}: MPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null)
    // Focus bookkeeping for returning focus to the anchor (APG: focus goes back to the invoker).
    const focusInsideRef = useRef(false)
    const pointerCloseRef = useRef(false)
    const wasOpenRef = useRef(false)
    const initialFocusDoneRef = useRef(false)
    const restoreFocusRef = useRef(restoreFocus)
    useEffect(() => {
        restoreFocusRef.current = restoreFocus
    }, [restoreFocus])
    const popoverIdRef = useRef<number>(null)
    if (popoverIdRef.current === null) popoverIdRef.current = nextPopoverId()
    const popoverId = popoverIdRef.current
    const [position, setPosition] = useState<{
        top: number
        left: number
        width?: number
        maxHeight?: number
    } | null>(null)
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
        // scrollHeight (plus borders) keeps the NATURAL height measurable once a max-height
        // below caps the box, so re-measuring never oscillates between capped and uncapped.
        const element = popoverRef.current
        const popover = {
            width: element.offsetWidth,
            height: Math.max(element.offsetHeight, element.scrollHeight + element.offsetHeight - element.clientHeight),
        }
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
        let maxHeight: number | undefined

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

            // Taller than the viewport: cap it and let it scroll instead of running off-screen.
            if (popover.height > viewport.height - 16) {
                maxHeight = Math.max(viewport.height - 16, 0)
                top = window.scrollY + 8
            }
        } else {
            // Vertical placement: position above or below the anchor
            const spaceBelow = viewport.height - anchor.bottom - offset
            const spaceAbove = anchor.top - offset
            const shouldFlip = isTop
                ? spaceAbove < popover.height && spaceBelow > spaceAbove
                : spaceBelow < popover.height && spaceAbove > spaceBelow

            setFlipped(shouldFlip)

            const showOnTop = isTop ? !shouldFlip : shouldFlip

            // Fits on neither side: the flip above already picked the side with more room,
            // so cap the height to that side and scroll, instead of clamping `top` and
            // covering the anchor (the field the user is typing into).
            const room = showOnTop ? spaceAbove : spaceBelow
            let height = popover.height
            if (popover.height > room) {
                maxHeight = Math.max(room - 8, 0)
                height = maxHeight
            }

            if (showOnTop) {
                top = anchor.top - height - offset + window.scrollY
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
            maxHeight,
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

    // Escape closes only the top layer: a nested popover (or a widget inside that already
    // consumed the key with preventDefault) closes first, its parent on the next press.
    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || e.defaultPrevented) return
            if (!isTopPopover(popoverId)) return
            e.preventDefault()
            onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose, popoverId])

    // Move focus into the layer once it is positioned (a `visibility: hidden` box cannot take focus).
    useEffect(() => {
        if (!open || !position || !initialFocus || initialFocusDoneRef.current) return
        initialFocusDoneRef.current = true
        const container = popoverRef.current
        if (!container) return

        let target: HTMLElement | null = null
        if (initialFocus === 'first') target = getTabbable(container)[0] ?? null
        else if (initialFocus !== 'container') target = initialFocus.current
        if (!target) {
            if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
            target = container
        }
        target.focus({preventScroll: true})
    }, [open, position, initialFocus])

    // Return focus to the anchor when the layer closes while it held focus, unless the
    // user dismissed it by pressing somewhere else (that click owns focus now).
    useEffect(() => {
        if (open) {
            wasOpenRef.current = true
            pointerCloseRef.current = false
            initialFocusDoneRef.current = false
            return
        }
        if (!wasOpenRef.current) return
        wasOpenRef.current = false
        const hadFocus = focusInsideRef.current
        focusInsideRef.current = false
        if (!restoreFocusRef.current || !hadFocus || pointerCloseRef.current || !focusIsLost()) return
        focusAnchor(anchorRef.current)
    }, [open, anchorRef])

    // Same when the whole component unmounts while open.
    useEffect(
        () => () => {
            if (!wasOpenRef.current || !focusInsideRef.current || !restoreFocusRef.current) return
            if (pointerCloseRef.current || !focusIsLost()) return
            focusAnchor(anchorRef.current)
        },
        [anchorRef]
    )

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

            pointerCloseRef.current = true
            onClose()
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open, onClose, anchorRef, popoverId])

    const handleFocus = (e: ReactFocusEvent<HTMLDivElement>) => {
        if (popoverRef.current?.contains(e.target as Node)) focusInsideRef.current = true
    }

    const handleBlur = (e: ReactFocusEvent<HTMLDivElement>) => {
        const next = e.relatedTarget as Node | null
        if (next && !popoverRef.current?.contains(next)) focusInsideRef.current = false
    }

    // Optional Tab-out: leaving the layer with Tab closes it and continues from the anchor.
    const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (!closeOnTabOut || e.key !== 'Tab' || e.defaultPrevented) return
        const container = popoverRef.current
        if (!container || !container.contains(e.target as Node)) return

        const focusable = getTabbable(container)
        const active = document.activeElement
        const leaving =
            focusable.length === 0 ||
            (e.shiftKey ? active === focusable[0] || active === container : active === focusable[focusable.length - 1])
        if (!leaving) return

        focusInsideRef.current = false
        // Forward Tab: focus the anchor and let the browser move on from there.
        // Shift+Tab: land on the anchor itself.
        if (focusAnchor(anchorRef.current) && e.shiftKey) e.preventDefault()
        onClose()
    }

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
                    ...(position?.maxHeight !== undefined
                        ? {maxHeight: position.maxHeight, overflowY: 'auto' as const}
                        : null),
                    zIndex: layerZ ?? undefined,
                    visibility: position ? 'visible' : 'hidden',
                    ...style,
                }}
                id={id}
                role={role ?? undefined}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
            >
                {children}
            </div>
        </MPortal>
    )
}
