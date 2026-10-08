import type {MAlertProps} from './MAlert.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getStatusIcon} from '../statusIcons'
import './MAlert.css'

// Render inline status messaging with optional heading content.
export function MAlert({
    color = 'info',
    icon = true,
    title,
    hidden,
    hiddenAbove,
    className,
    children,
    ...rest
}: MAlertProps) {
    const iconView = icon === false ? null : icon === true ? getStatusIcon(color) : icon

    return (
        <div
            className={cn('alert', `color-${color}`, className)}
            role="status"
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {iconView && <span className="icon">{iconView}</span>}
            <div className="main">
                {title && <div className="title">{title}</div>}
                {children && <div className="content">{children}</div>}
            </div>
        </div>
    )
}
