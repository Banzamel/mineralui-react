import {createContext, useContext} from 'react'

/**
 * Where an element sits relative to the nearest MAppShell:
 * - `none` — not inside an MAppShell,
 * - `docked` — in a sidebar slot (a direct MSidebar child or the `sidebar` / `aside` prop),
 * - `content` — inside `.app-main`, where a sidebar cannot dock.
 */
export type MAppShellPlacement = 'none' | 'docked' | 'content'

export const AppShellPlacementCtx = createContext<MAppShellPlacement>('none')

export function useAppShellPlacement(): MAppShellPlacement {
    return useContext(AppShellPlacementCtx)
}

export function isDevelopment(): boolean {
    return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
}
