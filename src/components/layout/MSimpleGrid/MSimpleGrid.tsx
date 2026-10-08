import type {MSimpleGridProps} from './MSimpleGrid.types'
import {cn} from '../../../utils/cn'
import './MSimpleGrid.css'

// Render a simple equal-column grid with a shared default spacing. With `minItemWidth`
// the grid drops columns (never above `columns`) once items would get narrower than that.
export function MSimpleGrid({columns = 2, minItemWidth, className, style, children, ...rest}: MSimpleGridProps) {
    return (
        <div
            className={cn('grid', `columns-${columns}`, minItemWidth && 'min-item-width', className)}
            style={{
                ...(minItemWidth ? {'--grid-min-item-width': minItemWidth} : {}),
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}
