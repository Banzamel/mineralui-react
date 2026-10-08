import type {HTMLAttributes, ReactNode} from 'react'
import type {MHiddenProps} from '../../../theme'
import type {MContainerSize} from '../MContainer'

export type MNavbarTone = 'default' | 'surface' | 'subtle'
export type MNavbarJustify = 'start' | 'center' | 'between' | 'end'
export type MNavbarMobileMenu = 'dropdown' | 'drawer'

export interface MNavbarProps extends Omit<HTMLAttributes<HTMLElement>, 'hidden'>, MHiddenProps {
    container?: MContainerSize
    padded?: boolean
    bordered?: boolean
    sticky?: boolean
    tone?: MNavbarTone
    justify?: MNavbarJustify
    wrap?: boolean
    mobileMenu?: MNavbarMobileMenu
    mobileMenuContent?: ReactNode
    /**
     * Extra row rendered as the very last block of the mobile menu, sized as a
     * single horizontal line. Use it for secondary actions (theme/language/search)
     * that should be reachable from the burger but not crowd the bar.
     * Combine with `collapseActions` if you want the same actions to disappear
     * from the bar automatically — set this only when you also want a manual override.
     */
    mobileMenuFooter?: ReactNode
    /**
     * When `true` (and the bar is below `mobileBreakpoint`), the **last** `MInline`
     * child of the navbar is removed from the main row and rendered as the mobile
     * menu footer in a single inline line. The burger toggle then attaches to the
     * preceding `MInline` (typically primary actions like Inbox / UserMenu) or
     * sits on its own when no other inline exists. Earlier inline groups are
     * left untouched, so split your actions into two `MInline`s — primary first
     * (kept on the bar) and secondary last (collapsed). Default: `false` for
     * backward compatibility.
     */
    collapseActions?: boolean
    /** Accessible name of the burger toggle. Defaults to the `mineralui.navbar.menu`
     *  i18n key ('Open navigation'). */
    mobileMenuLabel?: string
    mobileBreakpoint?: number
    children?: ReactNode
}
