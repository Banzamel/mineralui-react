import type {ReactNode, ElementType, CSSProperties} from 'react'
import type {MColor} from '../../../theme'
import type {MButtonProps} from '../../controls'

export type MSidebarMode = 'expanded' | 'collapsed'

export interface MSidebarProps {
    mode?: 'expanded' | 'collapsed' | 'auto'
    defaultMode?: MSidebarMode
    onModeChange?: (mode: MSidebarMode) => void
    persist?: boolean
    side?: 'left' | 'right'
    tone?: 'default' | 'subtle' | 'surface' | 'inverse'
    bordered?: boolean
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
