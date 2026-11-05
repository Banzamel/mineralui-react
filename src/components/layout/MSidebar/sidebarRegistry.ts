import {useSyncExternalStore} from 'react'

/**
 * Tiny store of the mounted MSidebar instances, so an `MSidebarToggle` placed anywhere
 * (MNavbar, a page header) can open the mobile drawer of a sidebar it is not nested in.
 */
export interface SidebarRegistryEntry {
    side: 'left' | 'right'
    /** True while the sidebar renders as an off-canvas drawer. */
    mobile: boolean
    /** True while the mobile drawer is open. */
    open: boolean
    setOpen: (open: boolean) => void
}

const entries = new Map<object, SidebarRegistryEntry>()
const listeners = new Set<() => void>()
const EMPTY: SidebarRegistryEntry[] = []
let snapshot: SidebarRegistryEntry[] = EMPTY

function emit() {
    snapshot = Array.from(entries.values())
    listeners.forEach((listener) => listener())
}

/** Add or refresh the entry stored under `token`. */
export function upsertSidebar(token: object, entry: SidebarRegistryEntry) {
    entries.set(token, entry)
    emit()
}

export function removeSidebar(token: object) {
    if (entries.delete(token)) emit()
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/** The registered sidebar on `side`; without `side`, the first left one, else the first one. */
export function useRegisteredSidebar(side?: 'left' | 'right'): SidebarRegistryEntry | undefined {
    const list = useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => EMPTY
    )

    if (side) return list.find((entry) => entry.side === side)

    return list.find((entry) => entry.side === 'left') ?? list[0]
}
