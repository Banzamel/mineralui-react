import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'
import type {MHiddenProps} from '../../../theme'
import type {LayoutUtilityProps, MUtilityScale} from '../../../utils/layoutProps'

export type MStackAlign = 'stretch' | 'start' | 'center' | 'end'

export interface MStackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'hidden'>, LayoutUtilityProps, MHiddenProps {
    align?: MStackAlign
    /** Gap between children (default `md`). Unlike other components it adds no outer
     *  margin; use `mt`/`mb`/`mx`/`my` for that. */
    spacing?: MUtilityScale
    children?: ReactNode
    className?: string
    style?: CSSProperties
}
