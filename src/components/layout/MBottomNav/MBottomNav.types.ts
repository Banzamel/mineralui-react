import type {ElementType, HTMLAttributes, ReactNode} from 'react'
import type {MColor, MHiddenProps} from '../../../theme'

export interface MBottomNavItem {
    value: string
    label: ReactNode
    icon: ReactNode
    /** Overlay on the icon: a count or short text, or `true` for a dot. */
    badge?: ReactNode | number | boolean
    /** Default `'error'`. */
    badgeColor?: MColor
    /** Renders an `<a>`. Without `href` or `component` the item is a `<button>`. */
    href?: string
    /** Passed to `component`, e.g. a router link. */
    to?: string
    component?: ElementType
    disabled?: boolean
}

export interface MBottomNavProps
    extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'hidden' | 'onChange'>, MHiddenProps {
    items: MBottomNavItem[]
    /** Active item (`aria-current="page"`). Leave both this and `defaultValue` unset to mark none. */
    value?: string
    defaultValue?: string
    /** Fires when a different item is picked, whether or not `value` is controlled. */
    onChange?: (value: string) => void
}
