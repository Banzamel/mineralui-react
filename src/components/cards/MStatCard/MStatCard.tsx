import type {MCardStatProps} from './MStatCard.types'
import {MCard} from '../MCard'
import {MText} from '../../typography'
import {MInline, MStack} from '../../layout'
import {MArrowDownIcon, MArrowUpIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import './MStatCard.css'

function resolveTrendType(trend: MCardStatProps['trend'], explicit?: MCardStatProps['trendType']) {
    if (explicit) {
        return explicit
    }

    if (typeof trend !== 'number' || trend === 0) {
        return 'neutral'
    }

    return trend > 0 ? 'up' : 'down'
}

function formatTrend(trend: MCardStatProps['trend']) {
    if (typeof trend === 'number' && trend > 0) {
        return `+${trend}`
    }

    return trend
}

export function MCardStat({
    label,
    value,
    icon,
    badge,
    helperText,
    trend,
    trendType,
    color = 'primary',
    // MCard is unpadded by default; a stat card always needs inner spacing from the border.
    padded = true,
    className,
    ...rest
}: MCardStatProps) {
    const hasTrend = trend !== undefined && trend !== null
    const resolvedTrendType = resolveTrendType(trend, trendType)

    return (
        <MCard className={cn('stat-card', `color-${color}`, className)} padded={padded} {...rest}>
            <MStack spacing={'md'}>
                <MInline justify={'between'} align={'start'}>
                    <MStack spacing={'xs'}>
                        <span className="stat-card-label">{label}</span>
                        <span className="stat-card-value">{value}</span>
                    </MStack>
                    <MInline align={'center'}>
                        {badge}
                        {icon && <span className="stat-card-icon">{icon}</span>}
                    </MInline>
                </MInline>

                {(hasTrend || helperText) && (
                    <MInline justify={'between'} align={'center'}>
                        {hasTrend ? (
                            <span className={cn('stat-card-trend', resolvedTrendType)}>
                                {resolvedTrendType === 'up' && <MArrowUpIcon size={14} />}
                                {resolvedTrendType === 'down' && <MArrowDownIcon size={14} />}
                                <span>{formatTrend(trend)}</span>
                            </span>
                        ) : (
                            <span />
                        )}
                        {helperText && (
                            <MText size={'sm'} tone={'muted'}>
                                {helperText}
                            </MText>
                        )}
                    </MInline>
                )}
            </MStack>
        </MCard>
    )
}
