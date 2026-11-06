import type {CSSProperties, ElementType, HTMLAttributes, ReactNode} from 'react'
import type {MHiddenProps} from '../../../theme'
import type {LayoutUtilityProps} from '../../../utils/layoutProps'

export type MSurfaceTone = 'default' | 'subtle' | 'raised' | 'inverse' | 'brand'

export interface MSurfaceProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'hidden'>, LayoutUtilityProps, MHiddenProps {
    component?: ElementType
    to?: string
    href?: string
    target?: string
    rel?: string
    tone?: MSurfaceTone
    outlined?: boolean
    padded?: boolean
    children?: ReactNode
    className?: string
    style?: CSSProperties
}
