import type {MContainerProps} from './MContainer.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MContainer.css'

// Constrain page content widths and apply shared spacing utilities.
export function MContainer({
    size = 'content',
    padded = true,
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
    children,
    ...rest
}: MContainerProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})

    return (
        <div
            className={cn(
                'container',
                size,
                padded && 'padded',
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
        >
            {children}
        </div>
    )
}
