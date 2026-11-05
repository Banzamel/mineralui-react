import type {HTMLAttributes, ReactNode} from 'react'
import type {MColor, MHiddenProps, MSize} from '../../../theme'

/** `'dot'` (2.7.0) — neutral tag with a small dot in `color` before the label (status-style). */
export type MTagVariant = 'solid' | 'outlined' | 'dot'

export interface MTagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'hidden'>, MHiddenProps {
    label: ReactNode
    color?: MColor
    variant?: MTagVariant
    size?: MSize
    rounded?: boolean
    closable?: boolean
    onClose?: () => void
    icon?: ReactNode
}
