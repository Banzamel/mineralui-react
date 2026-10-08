import type {MHeaderProps} from './MHeader.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {MContainer} from '../MContainer'
import './MHeader.css'

// Render a reusable page header shell aligned to a shared container.
export function MHeader({
    container = 'wide',
    padded = true,
    bordered = true,
    sticky = false,
    tone = 'surface',
    layout = 'split',
    hidden,
    hiddenAbove,
    className,
    children,
    ...rest
}: MHeaderProps) {
    return (
        <header
            className={cn('header', tone, bordered && 'bordered', sticky && 'sticky', className)}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            <MContainer size={container} padded={padded} className={cn('inner', `layout-${layout}`)}>
                {children}
            </MContainer>
        </header>
    )
}
