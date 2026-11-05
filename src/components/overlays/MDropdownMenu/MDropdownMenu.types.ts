import type {ReactNode, ElementType, CSSProperties} from 'react'
import type {MPopoverPlacement} from '../../primitives'
import type {MColor} from '../../../theme'

export interface MDropdownMenuProps {
    trigger: ReactNode
    placement?: MPopoverPlacement
    closeOnSelect?: boolean
    openOn?: 'click' | 'hover'
    onOpenChange?: (open: boolean) => void
    /** Stop click and keydown propagation on the trigger so nesting inside a
     *  clickable parent (Link, MCard with component={Link}, MDataTable row,
     *  etc.) does not trigger the parent's navigation/click handler. */
    isolateClick?: boolean
    /** Class on the outer `.dropdown.menu.anchor` wrapper. */
    className?: string
    /** Style on the outer `.dropdown.menu.anchor` wrapper. */
    style?: CSSProperties
    /** Class on the inner `.dropdown.menu.trigger` wrapper around `trigger` (since 2.7.0). */
    triggerClassName?: string
    /** Style on the inner `.dropdown.menu.trigger` wrapper around `trigger` (since 2.7.0). */
    triggerStyle?: CSSProperties
    popoverClassName?: string
    popoverStyle?: CSSProperties
    children: ReactNode
}

export type MDropdownItemRole = 'menuitem' | 'menuitemradio' | 'menuitemcheckbox'

export interface MDropdownItemProps {
    icon?: ReactNode
    label: ReactNode
    /** Second, muted line under the label. */
    description?: ReactNode
    /** ARIA role of the item. `menuitemradio` / `menuitemcheckbox` expose `checked` as `aria-checked`. */
    role?: MDropdownItemRole
    /** Checked state for `menuitemradio` / `menuitemcheckbox` items. */
    checked?: boolean
    href?: string
    to?: string
    onClick?: () => void
    color?: MColor
    disabled?: boolean
    active?: boolean
    component?: ElementType
    className?: string
}

export interface MDropdownGroupProps {
    /** Visible group heading; it also names the `role="group"` for assistive technology. */
    label: ReactNode
    className?: string
    children: ReactNode
}

export interface MDropdownDividerProps {
    className?: string
}
