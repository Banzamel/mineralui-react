import type {HTMLAttributes, ReactNode} from 'react'

export interface MAppShellProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Sidebar slot docked before the main column. Use it when the sidebar is wrapped in
     * your own component (e.g. `<AppSidebar />`), which the direct-child detection of
     * `MSidebar` cannot see. An `<MSidebar side="right">` passed here docks on the right.
     */
    sidebar?: ReactNode
    /** Sidebar slot docked after the main column (right side in LTR). */
    aside?: ReactNode
    /**
     * Slot for an `MBottomNav` wrapped in your own component. Like a direct `MBottomNav` child, it renders
     * outside the main column, where a transformed ancestor (e.g. a running `MReveal`) cannot capture it.
     */
    bottomNav?: ReactNode
    children?: ReactNode
}

export interface MBodyProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
}
