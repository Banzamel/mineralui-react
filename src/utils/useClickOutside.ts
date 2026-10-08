import {useEffect, type RefObject} from 'react'

// Trigger a callback when pointer interaction happens outside the referenced element.
// One `pointerdown` (capture phase) covers mouse, touch and pen, so touch devices fire the handler once;
// browsers without Pointer Events fall back to `mousedown` + `touchstart`.
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void): void {
    useEffect(() => {
        const listener = (e: Event) => {
            if (!ref.current || ref.current.contains(e.target as Node)) return
            handler()
        }

        const events =
            typeof window !== 'undefined' && 'PointerEvent' in window ? ['pointerdown'] : ['mousedown', 'touchstart']

        for (const type of events) document.addEventListener(type, listener, true)
        return () => {
            for (const type of events) document.removeEventListener(type, listener, true)
        }
    }, [ref, handler])
}
