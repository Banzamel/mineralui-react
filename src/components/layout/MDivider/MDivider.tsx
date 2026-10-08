import type {MDividerProps} from './MDivider.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MDivider.css'

// Render a semantic divider line between related content blocks.
export function MDivider({
    orientation = 'horizontal',
    variant = 'solid',
    hidden,
    hiddenAbove,
    spacing,
    padding,
    fsize,
    mt,
    mb,
    ml,
    mr,
    mx,
    my,
    pt,
    pb,
    pl,
    pr,
    px,
    py,
    fullWidth,
    className,
    style,
    ...rest
}: MDividerProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})

    return (
        <div
            role="separator"
            aria-orientation={orientation}
            className={cn(
                'divider',
                orientation,
                variant,
                ...getLayoutUtilityClassNames({
                    spacing,
                    padding,
                    fsize,
                    mt,
                    mb,
                    ml,
                    mr,
                    mx,
                    my,
                    pt,
                    pb,
                    pl,
                    pr,
                    px,
                    py,
                    fullWidth,
                }),
                className
            )}
            style={{...utilityStyle, ...style}}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        />
    )
}
