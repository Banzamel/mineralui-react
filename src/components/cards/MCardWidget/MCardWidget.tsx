import type {PointerEvent} from 'react'
import type {MCardWidgetProps} from './MCardWidget.types'
import {cn} from '../../../utils/cn'
import {MArrowDownIcon, MArrowUpIcon} from '../../../icons'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {resolveMCardAction} from '../shared'
import './MCardWidget.css'
import '../shared/MCardShared.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

function resolveTrendType(trend: MCardWidgetProps['trend'], explicit?: MCardWidgetProps['trendType']) {
    if (explicit) return explicit
    if (typeof trend !== 'number' || trend === 0) return 'neutral'
    return trend > 0 ? 'up' : 'down'
}

function formatTrend(trend: MCardWidgetProps['trend']) {
    if (typeof trend === 'number' && trend > 0) {
        return `+${trend}`
    }

    return trend
}

export function MCardWidget({
    component,
    to,
    href,
    target,
    rel,
    title,
    value,
    trend,
    trendType,
    icon,
    color = 'primary',
    helperText,
    interactive = false,
    clickEffect,
    rippleColor,
    className,
    onPointerDown,
    ...rest
}: MCardWidgetProps) {
    const texts = useMCommonTexts()
    const hasTrend = trend !== undefined && trend !== null
    const resolvedTrendType = resolveTrendType(trend, trendType)
    const formattedTrend = formatTrend(trend)
    const {
        component: Component,
        href: resolvedHref,
        to: resolvedTo,
        isInteractive,
    } = resolveMCardAction({
        component,
        href,
        to,
        interactive,
        hasClickHandler: Boolean(rest.onClick),
        hasPointerHandler: Boolean(onPointerDown),
    })
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect ?? (isInteractive ? 'ripple' : 'none'),
        disabled: !isInteractive,
        color: rippleColor,
    })

    return (
        <Component
            href={Component === 'a' || component ? resolvedHref : undefined}
            to={resolvedTo}
            target={target}
            rel={rel}
            className={cn('card-widget', `color-${color}`, isInteractive && 'interactive', effectClassName, className)}
            onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
                handlePointerDown(event)
                onPointerDown?.(event)
            }}
            {...rest}
        >
            {effectLayer}
            <div className="cw-top">
                <div className="cw-meta">
                    <span className="cw-title">{title}</span>
                    <span className="cw-value">{value}</span>
                </div>
                {icon && <span className="cw-icon">{icon}</span>}
            </div>

            {hasTrend && (
                <div className="cw-bottom">
                    <span className={cn('cw-trend', resolvedTrendType)}>
                        {resolvedTrendType === 'up' && <MArrowUpIcon size={14} />}
                        {resolvedTrendType === 'down' && <MArrowDownIcon size={14} />}
                        {resolvedTrendType !== 'neutral' && (
                            <span className="card-sr-only">
                                {resolvedTrendType === 'up' ? texts.increase : texts.decrease}{' '}
                            </span>
                        )}
                        <span>{formattedTrend}</span>
                    </span>
                </div>
            )}

            {helperText && <div className="cw-helper">{helperText}</div>}
        </Component>
    )
}
