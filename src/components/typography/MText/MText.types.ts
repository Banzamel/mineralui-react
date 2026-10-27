import type {HTMLAttributes, ReactNode} from 'react'
import type {MColor, MHiddenProps} from '../../../theme'
import type {LayoutUtilityProps} from '../../../utils/layoutProps'

/** `inherit` takes the parent's colour (e.g. light text on a dark MSurface). */
export type MTextTone = 'default' | 'muted' | 'accent' | 'inherit'
export type MTextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type MTextAlign = 'left' | 'center' | 'right' | 'justify'

export interface MTextProps
    extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'hidden'>, LayoutUtilityProps, MHiddenProps {
    as?: 'p' | 'span' | 'div' | 'strong' | 'em'
    tone?: MTextTone
    size?: MTextSize
    align?: MTextAlign
    color?: MColor
    weight?: 'normal' | 'medium' | 'semibold' | 'bold'
    /** Single-line ellipsis when true, multi-line clamp when a number */
    truncate?: boolean | number
    children?: ReactNode
}
