import type {MFooterProps} from './MFooter.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import {MContainer} from '../MContainer'
import './MFooter.css'

// Render a reusable page footer shell with shared spacing utilities.
export function MFooter({
    container = 'wide',
    padded = true,
    bordered = true,
    tone = 'surface',
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
}: MFooterProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})

    return (
        <footer
            className={cn(
                'footer',
                tone,
                bordered && 'bordered',
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
            <MContainer size={container} padded={padded} className="inner" fullWidth>
                {children}
            </MContainer>
        </footer>
    )
}
