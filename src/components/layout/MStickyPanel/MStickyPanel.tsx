import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import type * as React from 'react'
import type {MStickyPanelProps} from './MStickyPanel.types'
import {cn} from '../../../utils/cn'
import './MStickyPanel.css'

const INTERACTIVE_SELECTOR = 'button, a, [role="button"]'

// Sticky side-rail panel: sticks to the viewport at `top`, fills viewport-relative height,
// scrolls internally with an optional hidden scrollbar and click-and-drag scrolling.
export const MStickyPanel = forwardRef<HTMLDivElement, MStickyPanelProps>(function MStickyPanel(
    {children, top = 16, bottomGap = 16, hideScrollbar = true, draggable = true, label, className, style, ...rest},
    forwardedRef
) {
    const panelRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => panelRef.current as HTMLDivElement)
    const dragState = useRef<{startY: number; startScrollTop: number} | null>(null)
    const [dragging, setDragging] = useState(false)

    useEffect(() => {
        if (!draggable) return

        const handleMouseMove = (event: MouseEvent) => {
            const drag = dragState.current
            const panel = panelRef.current
            if (!drag || !panel) return
            panel.scrollTop = drag.startScrollTop - (event.clientY - drag.startY)
        }

        const handleMouseUp = () => {
            if (!dragState.current) return
            dragState.current = null
            setDragging(false)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [draggable])

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!draggable) return
        // Skip drag start when the click originated on an interactive descendant
        // (button, link, role=button) so triggers like MDropdownMenu, MButton or
        // <Link> stay clickable inside the panel.
        const target = event.target as HTMLElement | null
        if (target && target.closest(INTERACTIVE_SELECTOR)) return

        const panel = panelRef.current
        if (!panel) return

        dragState.current = {startY: event.clientY, startScrollTop: panel.scrollTop}
        setDragging(true)
        event.preventDefault()
    }

    const mergedStyle: React.CSSProperties = {
        top,
        height: `calc(100vh - ${top + bottomGap}px)`,
        ...style,
    }

    return (
        <div
            ref={panelRef}
            className={cn(
                'm-sticky-panel',
                draggable && 'draggable',
                dragging && 'is-dragging',
                hideScrollbar && 'hide-scrollbar',
                className
            )}
            style={mergedStyle}
            // A scrollable region must be keyboard-focusable even when it holds no
            // focusable content (axe `scrollable-region-focusable`).
            tabIndex={0}
            role={label ? 'region' : undefined}
            aria-label={label}
            onMouseDown={handleMouseDown}
            {...rest}
        >
            {children}
        </div>
    )
})
