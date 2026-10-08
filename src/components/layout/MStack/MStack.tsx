import type {MStackProps} from './MStack.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MStack.css'

// MStack children vertically with shared layout utility props.
export function MStack({
    align = 'stretch',
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
}: MStackProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})

    return (
        <div
            className={cn(
                'stack',
                align !== 'stretch' && align,
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
