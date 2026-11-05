import type {ReactNode, ElementType, CSSProperties} from 'react'
import type {MColor} from '../../../theme'
import type {MButtonProps} from '../../controls'

export type MSidebarMode = 'expanded' | 'collapsed'
/** How the active row is marked: `'background'` (tinted row, default) or `'bar'` (2.8.0). */
export type MSidebarIndicator = 'background' | 'bar'

export interface MSidebarProps {
    mode?: 'expanded' | 'collapsed' | 'auto'
    defaultMode?: MSidebarMode
    onModeChange?: (mode: MSidebarMode) => void
    persist?: boolean
    side?: 'left' | 'right'
    tone?: 'default' | 'subtle' | 'surface' | 'inverse'
    bordered?: boolean
    /**
     * Active-row marker. `'background'` (default) keeps the tinted row. `'bar'` (2.8.0) adds a
     * 4px accent bar on the row edge that faces the screen edge (left for `side="left"`, right
     * for `side="right"`) — the launcher / icon-rail look. Row size and icon size can be tuned
     * with `--mineral-sidebar-item-size` / `--mineral-sidebar-icon-size` (unset = today's sizes).
     */
    indicator?: MSidebarIndicator
    /**
     * Mobile drawer trigger. `'floating'` (default) renders the fixed hamburger tab at the
     * screen edge (top: `--mineral-sidebar-hamburger-top`). `'none'` renders no trigger —
     * place an `MSidebarToggle` in your MNavbar / header instead.
     */
    hamburger?: 'floating' | 'none'
    mobileBreakpoint?: number
    compactBreakpoint?: number
    className?: string
    style?: CSSProperties
    children: ReactNode
}

export interface MSidebarToggleProps extends Omit<MButtonProps, 'iconOnly'> {
    /**
     * Which sidebar to open. Defaults to the first mounted left sidebar, otherwise the first
     * mounted one.
     */
    side?: 'left' | 'right'
    /** Custom icon; defaults to the menu (hamburger) icon. */
    children?: ReactNode
}

export interface MSidebarHeaderProps {
    bordered?: boolean
    className?: string
    children: ReactNode
}

export interface MSidebarBodyProps {
    className?: string
    children: ReactNode
}

export interface MSidebarNavProps {
    className?: string
    children: ReactNode
}

export interface MSidebarItemProps {
    icon?: ReactNode
    label: ReactNode
    /**
     * Optional helper text. When set, it replaces the label inside the row's
     * tooltip — `MSidebarItem` always shows ONE tooltip (description if
     * present, label otherwise). This stops descriptions and labels from
     * stacking when the row is wrapped in another tooltip from outside.
     */
    description?: ReactNode
    href?: string
    to?: string
    onClick?: () => void
    active?: boolean
    disabled?: boolean
    badge?: ReactNode
    color?: MColor
    component?: ElementType
    className?: string
}

export interface MSidebarGroupProps {
    label: string
    icon?: ReactNode
    active?: boolean
    defaultOpen?: boolean
    collapsible?: boolean
    children: ReactNode
    className?: string
}

export interface MSidebarFooterProps {
    bordered?: boolean
    className?: string
    children: ReactNode
}

export interface MSidebarDividerProps {
    className?: string
    spacing?: 'sm' | 'md' | 'lg'
}
