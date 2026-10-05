/**
 * Registry of currently-open MPopover instances.
 *
 * Every popover portals its content to `document.body`, so a popover opened
 * from inside another popover is NOT a DOM descendant of its parent. That
 * breaks the naive outside-click test (`parent.contains(target)`): pressing a
 * nested dropdown item looks like an outside click to the parent, the parent
 * closes, React unmounts the nested menu mid-gesture, and the browser never
 * gets to fire `click` because mousedown and mouseup landed on different
 * elements. The action silently does nothing.
 *
 * This registry restores the nesting relation the DOM lost. Nesting is derived
 * from where each popover's ANCHOR lives, not from open order: a popover whose
 * anchor sits inside another popover's element is that popover's child. Open
 * order would misclassify two independent popovers that happen to be open at
 * the same time — clicking the newer one must still close the older one.
 */

export interface PopoverRegistration {
    id: number
    getPopoverEl: () => HTMLElement | null
    getAnchorEl: () => HTMLElement | null
}

const registrations: PopoverRegistration[] = []
let nextId = 1

export function nextPopoverId(): number {
    return nextId++
}

export function registerPopover(registration: PopoverRegistration): () => void {
    registrations.push(registration)
    return () => {
        const index = registrations.indexOf(registration)
        if (index !== -1) registrations.splice(index, 1)
    }
}

/** True while any popover is open — modal layers leave Escape to it. */
export function hasOpenPopovers(): boolean {
    return registrations.length > 0
}

/** The registered popover whose element contains `entry`'s anchor, if any. */
function parentIdOf(entry: PopoverRegistration): number | null {
    const anchor = entry.getAnchorEl()
    if (!anchor) return null

    for (const other of registrations) {
        if (other.id === entry.id) continue
        const element = other.getPopoverEl()
        if (element && element.contains(anchor)) return other.id
    }

    return null
}

/**
 * True when `target` lies inside a popover that is nested (at any depth) within
 * the popover identified by `id`. Callers use it to keep a parent open while
 * the interaction belongs to one of its descendants.
 */
export function isInsideDescendantPopover(id: number, target: Node | null): boolean {
    if (!target) return false

    for (const entry of registrations) {
        if (entry.id === id) continue

        const element = entry.getPopoverEl()
        if (!element || !element.contains(target)) continue

        // Walk the ancestor chain of the popover that was actually hit.
        // `seen` guards against a cycle if a malformed tree ever produces one.
        const seen = new Set<number>()
        let cursor = parentIdOf(entry)

        while (cursor !== null && !seen.has(cursor)) {
            if (cursor === id) return true
            seen.add(cursor)
            const parent = registrations.find((candidate) => candidate.id === cursor)
            cursor = parent ? parentIdOf(parent) : null
        }
    }

    return false
}

/** Test-only helper — the registry is module state that outlives a render. */
export function __resetPopoverStack(): void {
    registrations.length = 0
    nextId = 1
}
