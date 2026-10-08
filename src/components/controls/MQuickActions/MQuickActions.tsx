import type {MQuickActionsProps} from './MQuickActions.types'
import {MButton} from '../MButton'
import {MButtonGroup} from '../MButtonGroup'
import {MSimpleGrid} from '../../layout'
import {cn} from '../../../utils/cn'
import './MQuickActions.css'

export function MQuickActions({
    items,
    layout = 'group',
    orientation = 'horizontal',
    columns = 4,
    size = 'sm',
    color,
    variant = 'ghost',
    fullWidth = true,
    className,
    ...rest
}: MQuickActionsProps) {
    const buttons = items.map((item) => (
        <MButton
            key={item.key ?? item.to ?? item.href ?? item.label?.toString()}
            component={item.component}
            to={item.to}
            href={item.href}
            target={item.target}
            rel={item.rel}
            onClick={item.onClick}
            color={item.color ?? color}
            variant={item.variant ?? variant}
            size={size}
            startIcon={item.icon}
            badge={item.badge}
            badgeColor={item.badgeColor}
            badgePulsing={item.badgePulsing}
            pulsing={item.pulsing}
            disabled={item.disabled}
            fullWidth={layout === 'grid' ? true : fullWidth}
        >
            {item.description ? (
                <span className="quick-actions-text">
                    <span className="quick-actions-label">{item.label}</span>
                    <span className="quick-actions-description">{item.description}</span>
                </span>
            ) : (
                item.label
            )}
        </MButton>
    ))

    if (layout === 'grid') {
        return (
            <MSimpleGrid
                columns={columns}
                className={cn('quick-actions', fullWidth && 'full-width', className)}
                {...rest}
            >
                {buttons}
            </MSimpleGrid>
        )
    }

    return (
        <div className={cn('quick-actions', fullWidth && 'full-width', className)} {...rest}>
            <MButtonGroup orientation={orientation} size={size} variant={variant} color={color} attached={false}>
                {buttons}
            </MButtonGroup>
        </div>
    )
}
