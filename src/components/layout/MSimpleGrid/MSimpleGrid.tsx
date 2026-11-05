import type {CSSProperties} from 'react'
import type {MSimpleGridProps, MSimpleGridResponsiveColumns} from './MSimpleGrid.types'
import {cn} from '../../../utils/cn'
import './MSimpleGrid.css'

const responsiveKeys = ['base', 'sm', 'md', 'lg', 'xl', 'xxl'] as const

// Resolve the mobile-first cascade here and write every breakpoint, so a nested responsive
// grid never inherits a missing step from an outer one through the custom property.
function buildResponsiveStyle(columns: MSimpleGridResponsiveColumns): Record<string, number> {
    const style: Record<string, number> = {}
    let current = 1
    for (const key of responsiveKeys) {
        const value = columns[key]
        if (value !== undefined && value >= 1) current = Math.floor(value)
        style[`--grid-cols-${key}`] = current
    }
    return style
}

// Render a simple equal-column grid with a shared default spacing. With `minItemWidth`
// the grid drops columns (never above `columns`) once items would get narrower than that.
export function MSimpleGrid({columns = 2, minItemWidth, className, style, children, ...rest}: MSimpleGridProps) {
    const responsive = typeof columns === 'object' && columns !== null

    return (
        <div
            className={cn(
                'grid',
                responsive ? 'columns-responsive' : `columns-${columns}`,
                minItemWidth && 'min-item-width',
                className
            )}
            style={
                {
                    ...(responsive ? buildResponsiveStyle(columns) : {}),
                    ...(minItemWidth ? {'--grid-min-item-width': minItemWidth} : {}),
                    ...style,
                } as CSSProperties
            }
            {...rest}
        >
            {children}
        </div>
    )
}
