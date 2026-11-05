import type {ButtonHTMLAttributes, CSSProperties, ElementType, ReactNode} from 'react'
import type {MColor, MHiddenProps, MSize} from '../../../theme'
import type {MClickEffect} from '../../../utils/useInteractionEffect'

export type MButtonVariant = 'filled' | 'secondary' | 'outlined' | 'ghost' | 'link' | 'icon'
export type MButtonShape = 'default' | 'circle'
/** Where `startIcon` sits: `'start'` (inline, before the label) or `'top'` (stacked above it). */
export type MButtonIconPosition = 'start' | 'top'

export interface MButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'hidden'>, MHiddenProps {
    component?: ElementType
    to?: string
    href?: string
    target?: string
    rel?: string
    variant?: MButtonVariant
    size?: MSize
    color?: MColor
    fullWidth?: boolean
    rounded?: boolean
    shape?: MButtonShape
    iconOnly?: boolean
    loading?: boolean
    active?: boolean
    startIcon?: ReactNode
    endIcon?: ReactNode
    /**
     * `'top'` stacks `startIcon` above the label (adds the `icon-top` class, centred column
     * layout, height grows with the content). Default `'start'` — inline, as before 2.7.0.
     */
    iconPosition?: MButtonIconPosition
    clickEffect?: MClickEffect
    pulsing?: boolean
    badge?: ReactNode | number | boolean
    badgeColor?: MColor
    badgePulsing?: boolean
    rippleColor?: string
    className?: string
    style?: CSSProperties
    children?: ReactNode
}
