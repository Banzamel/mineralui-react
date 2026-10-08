import type {MSurfaceProps} from './MSurface.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MSurface.css'

// Render a reusable surface primitive for cards, panels and preview blocks.
export function MSurface({
    component,
    to,
    href,
    target,
    rel,
    tone = 'default',
    outlined = true,
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
}: MSurfaceProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})
    const Component = component ?? 'div'

    return (
        <Component
            href={Component === 'a' || component ? href : undefined}
            to={component ? to : undefined}
            target={Component === 'a' || component ? target : undefined}
            rel={Component === 'a' || component ? rel : undefined}
            className={cn(
                'surface',
                tone,
                outlined && 'outlined',
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
        </Component>
    )
}
