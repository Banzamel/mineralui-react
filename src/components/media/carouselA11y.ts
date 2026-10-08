import {useEffect, useState} from 'react'
import type {KeyboardEvent} from 'react'
import {isRtlElement} from '../../utils/radioGroupKeys'

/**
 * Shared carousel helpers (MCarousel, MShowcaseCarousel). Internal, not re-exported.
 */

const EDITABLE_SELECTOR =
    'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="spinbutton"], [role="textbox"], [role="combobox"], [role="listbox"], [role="grid"], [role="tablist"], [role="menu"]'

/**
 * Slide step for an arrow key pressed inside a carousel: -1 (previous), 1 (next) or `null`
 * when the key is not a carousel key or belongs to a widget that uses arrows itself.
 * Left / Right are flipped in right-to-left layouts.
 */
export function getCarouselKeyStep(event: KeyboardEvent<HTMLElement>): -1 | 1 | null {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return null
    const target = event.target as Element | null
    if (target instanceof Element && target.closest(EDITABLE_SELECTOR)) return null
    const forward = event.key === 'ArrowRight'
    const rtl = isRtlElement(event.currentTarget)
    return forward !== rtl ? 1 : -1
}

function readReducedMotion() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
        return false
    }
}

/** Live `prefers-reduced-motion: reduce` flag (false on the server). */
export function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
        let query: MediaQueryList
        try {
            query = window.matchMedia('(prefers-reduced-motion: reduce)')
        } catch {
            return
        }
        setReduced(readReducedMotion())
        const update = () => setReduced(query.matches)
        query.addEventListener?.('change', update)
        return () => query.removeEventListener?.('change', update)
    }, [])

    return reduced
}
