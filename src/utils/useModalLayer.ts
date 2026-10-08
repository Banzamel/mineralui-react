import {useEffect, useRef} from 'react'
import type {RefObject} from 'react'
import {hasOpenPopovers} from '../components/primitives/MPopover/popoverStack'

/**
 * Shared behaviour of blocking overlays (MModal, MDrawer, MSheet, MMediaLightbox).
 *
 * Open layers form a stack, so with a drawer opened from a modal only the top one
 * reacts to Escape and owns the Tab cycle. Focus moves into the dialog on open,
 * stays inside it while it is the top layer and returns to the opener on close.
 */

const layers: object[] = []

const FOCUSABLE = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Focusable, visible descendants of `container` in DOM order (shared with MPopover). */
export function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) =>
            !element.closest('[inert]') &&
            (typeof element.checkVisibility === 'function' ? element.checkVisibility() : true)
    )
}

/** Like `getFocusable`, minus elements taken out of the Tab order (`tabindex="-1"`, e.g. roving items). */
export function getTabbable(container: HTMLElement): HTMLElement[] {
    return getFocusable(container).filter((element) => element.tabIndex >= 0)
}

export interface UseModalLayerOptions {
    /** True while the overlay is mounted and open (not while it animates out). */
    active: boolean
    /** Element wrapping the whole overlay; the dialog is the `[role="dialog"]` inside it. */
    containerRef: RefObject<HTMLElement | null>
    /** Called on Escape when this is the top layer. Omit to ignore Escape. */
    onEscape?: () => void
}

export function useModalLayer({active, containerRef, onEscape}: UseModalLayerOptions): void {
    const onEscapeRef = useRef(onEscape)
    useEffect(() => {
        onEscapeRef.current = onEscape
    }, [onEscape])

    useEffect(() => {
        if (!active || typeof document === 'undefined') return

        const token = {}
        layers.push(token)
        const isTop = () => layers[layers.length - 1] === token

        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
        const container = containerRef.current
        const dialog = container?.querySelector<HTMLElement>('[role="dialog"]') ?? container

        if (dialog && !dialog.contains(document.activeElement)) {
            if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1')
            const preferred = dialog.querySelector<HTMLElement>('[autofocus], [data-autofocus]')
            ;(preferred ?? dialog).focus({preventScroll: true})
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isTop() || event.defaultPrevented) return

            if (event.key === 'Escape') {
                // An open select/menu inside the dialog closes first.
                if (hasOpenPopovers() || !onEscapeRef.current) return
                onEscapeRef.current()
                return
            }

            if (event.key !== 'Tab' || !dialog) return

            const activeElement = document.activeElement as HTMLElement | null
            // Popovers portal outside the dialog; leave their own Tab handling alone.
            if (activeElement && !dialog.contains(activeElement) && activeElement.closest('.popover')) return

            const focusable = getFocusable(dialog)
            if (focusable.length === 0) {
                event.preventDefault()
                dialog.focus({preventScroll: true})
                return
            }

            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const outside = !activeElement || !dialog.contains(activeElement) || activeElement === dialog

            if (event.shiftKey && (outside || activeElement === first)) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && (outside || activeElement === last)) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            const index = layers.indexOf(token)
            if (index !== -1) layers.splice(index, 1)
            if (opener && opener.isConnected) opener.focus({preventScroll: true})
        }
    }, [active, containerRef])
}
