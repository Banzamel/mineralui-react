import {createElement} from 'react'
import type {CSSProperties} from 'react'
import type {MHeadingProps} from './MHeading.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getAppearanceClassNames} from '../../../utils/appearanceProps'
import './MHeading.css'

// Render semantic heading levels with shared MineralUI typography tokens.
export function MHeading({
    level = 2,
    tone = 'default',
    hidden,
    hiddenAbove,
    color,
    truncate,
    className,
    style,
    children,
    ...rest
}: MHeadingProps) {
    const lines = typeof truncate === 'number' ? truncate : undefined

    return createElement(
        `h${level}`,
        {
            className: cn(
                'heading',
                `h${level}`,
                !color && tone,
                truncate === true && 'truncate',
                lines != null && 'line-clamp',
                ...getAppearanceClassNames({color}),
                className
            ),
            style: lines ? ({'--line-clamp': lines, ...style} as CSSProperties) : style,
            ...getHiddenProps(hidden, hiddenAbove),
            ...rest,
        },
        children
    )
}
