import type {HTMLAttributes, ReactNode} from 'react'
import type {MColor, MHiddenProps} from '../../../theme'
import type {MTextAlign, MTextTone} from '../MText'

export type MHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type MHeadingTone = MTextTone

export interface MHeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color' | 'hidden'>, MHiddenProps {
    level?: MHeadingLevel
    tone?: MHeadingTone
    color?: MColor
    /** Text alignment; unset follows the container. */
    align?: MTextAlign
    /** Single-line ellipsis when true, multi-line clamp when a number */
    truncate?: boolean | number
    children?: ReactNode
}
