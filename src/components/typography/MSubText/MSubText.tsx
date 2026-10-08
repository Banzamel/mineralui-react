import type {MSubTextProps} from './MSubText.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getAppearanceClassNames} from '../../../utils/appearanceProps'
import './MSubText.css'

// Render small, muted secondary text for captions, hints and metadata.
export function MSubText({
    as = 'span',
    size = 'sm',
    tone = 'muted',
    hidden,
    hiddenAbove,
    color,
    className,
    children,
    ...rest
}: MSubTextProps) {
    const Component = as
    return (
        <Component
            className={cn('subtext', !color && tone, size, ...getAppearanceClassNames({color}), className)}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {children}
        </Component>
    )
}
