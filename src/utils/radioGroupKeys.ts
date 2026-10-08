/**
 * Arrow-key target for an APG radio group (roving tabindex, selection follows focus).
 * ArrowRight / ArrowDown move forward, ArrowLeft / ArrowUp move back, both wrap; Home / End jump
 * to the ends. In right-to-left layouts ArrowLeft / ArrowRight are flipped. Returns `null` for
 * keys the group does not handle. Internal helper, not re-exported.
 */
export function getRadioGroupTarget(key: string, index: number, count: number, rtl = false): number | null {
    if (count <= 0) return null
    let effective = key
    if (rtl && key === 'ArrowRight') effective = 'ArrowLeft'
    else if (rtl && key === 'ArrowLeft') effective = 'ArrowRight'

    switch (effective) {
        case 'ArrowRight':
        case 'ArrowDown':
            return index < 0 ? 0 : (index + 1) % count
        case 'ArrowLeft':
        case 'ArrowUp':
            return index < 0 ? count - 1 : (index - 1 + count) % count
        case 'Home':
            return 0
        case 'End':
            return count - 1
        default:
            return null
    }
}

/** True when the element is laid out right-to-left. */
export function isRtlElement(element: Element | null): boolean {
    if (!element || typeof window === 'undefined') return false
    const dirHost = element.closest('[dir]')
    if (dirHost) return dirHost.getAttribute('dir')?.toLowerCase() === 'rtl'
    try {
        return window.getComputedStyle(element).direction === 'rtl'
    } catch {
        return false
    }
}
