/**
 * Reference-counted body scroll lock shared by blocking overlays (MModal, MDrawer, MSheet).
 *
 * Each overlay used to save `body.style.overflow`, set it to `hidden` and restore the
 * saved value on close. With nested overlays closed in the "wrong" order (the outer one
 * first) the inner one restored `hidden` after the outer one had already unlocked, or the
 * outer one unlocked while the inner one was still open. A shared counter keeps the page
 * locked while ANY overlay holds a lock and restores the original value once the last
 * one releases it.
 */

let lockCount = 0
let savedOverflow = ''

/** Locks body scrolling and returns an idempotent release function. */
export function lockBodyScroll(): () => void {
    if (typeof document === 'undefined') return () => {}

    if (lockCount === 0) {
        savedOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
    }
    lockCount += 1

    let released = false
    return () => {
        if (released) return
        released = true
        lockCount = Math.max(0, lockCount - 1)
        if (lockCount === 0) {
            document.body.style.overflow = savedOverflow
        }
    }
}

/** Test-only helper — the counter is module state that outlives a render. */
export function __resetBodyScrollLock(): void {
    lockCount = 0
    savedOverflow = ''
}
