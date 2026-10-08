import type {MInlineProps} from './MInline.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MInline.css'

// Arrange children horizontally with shared alignment and wrapping helpers.
// `spacing` is not accepted — the flex gap built into `.inline` already spaces children;
// outer margin should go through `mx/my` or `padding` to avoid overflowing the parent when paired with `fullWidth`.
export function MInline({
    align = 'center',
    justify = 'start',
    wrap = 'wrap',
    hidden,
    hiddenAbove,
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
}: MInlineProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})

    return (
        <div
            className={cn(
                'inline',
                align,
                `justify-${justify}`,
                wrap,
                ...getLayoutUtilityClassNames({
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
