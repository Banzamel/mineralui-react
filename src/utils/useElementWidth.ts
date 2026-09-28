import {useLayoutEffect, useState} from 'react'
import type {RefObject} from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => undefined

/**
 * Tracks the rendered width of an element (ResizeObserver). SSR-safe: returns `initialWidth`
 * until the element is measured, then corrects it before paint. Zero-width reads (hidden or
 * detached nodes) are ignored so a collapsed tab does not flip a component to its narrow layout.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>, initialWidth = 0): number {
    const [width, setWidth] = useState(initialWidth)

    useIsomorphicLayoutEffect(() => {
        const node = ref.current
        if (!node) {
            return
        }
        const measure = () => {
            const rect = node.getBoundingClientRect()
            if (rect.width > 0) {
                setWidth(rect.width)
            }
        }
        measure()
        let rafId: number | null = null
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            rafId = window.requestAnimationFrame(measure)
        }
        let observer: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver((entries) => {
                const entry = entries[0]
                if (entry && entry.contentRect.width > 0) {
                    setWidth(entry.contentRect.width)
                }
            })
            observer.observe(node)
        }
        return () => {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId)
            }
            observer?.disconnect()
        }
    }, [ref])

    return width
}

export type MContainerSize = 'sm' | 'md' | 'lg'

/** `sm` < 640 <= `md` < 1024 <= `lg` (MBreakpoints.sm / MBreakpoints.lg). Unknown width = `lg`. */
export function getContainerSize(width: number): MContainerSize {
    if (!width) {
        return 'lg'
    }
    if (width < 640) {
        return 'sm'
    }
    if (width < 1024) {
        return 'md'
    }
    return 'lg'
}
