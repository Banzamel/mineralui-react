import {createContext, useContext} from 'react'

/**
 * Where an element sits relative to the nearest MAppShell:
 * - `none` — not inside an MAppShell,
 * - `docked` — in a sidebar or bottom bar slot (a direct child or the `sidebar` / `aside` / `bottomNav` prop),
 * - `content` — inside `.app-main`, where neither can dock.
 */
export type MAppShellPlacement = 'none' | 'docked' | 'content'

export const AppShellPlacementCtx = createContext<MAppShellPlacement>('none')

export function useAppShellPlacement(): MAppShellPlacement {
    return useContext(AppShellPlacementCtx)
}

export function isDevelopment(): boolean {
    return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
}
