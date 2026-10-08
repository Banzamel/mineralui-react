import type {MBadgeProps} from './MBadge.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import './MBadge.css'

// Render a compact semantic label for status and metadata.
export function MBadge({
    color = 'primary',
    size = 'md',
    hidden,
    hiddenAbove,
    pulsing = false,
    rounded = false,
    fullWidth = false,
    icon,
    className,
    children,
    ...rest
}: MBadgeProps) {
    return (
        <span
            className={cn(
                'badge',
                `color-${color}`,
                size,
                pulsing && 'pulsing',
                rounded && 'rounded',
                fullWidth && 'full-width',
                className
            )}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {icon && <span className="badge-icon">{icon}</span>}
            {children}
        </span>
    )
}
