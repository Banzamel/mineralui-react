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
    className?: string
    style?: CSSProperties
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
    label: string
    children: ReactNode
}

export interface MDropdownDividerProps {
    className?: string
}
