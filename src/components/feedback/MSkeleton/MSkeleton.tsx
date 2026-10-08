import type {MSkeletonProps} from './MSkeleton.types'
import {cn} from '../../../utils/cn'
import './MSkeleton.css'

function getTextLineWidth(index: number, lines: number) {
    if (lines <= 1) {
        return '100%'
    }

    if (index === lines - 1) {
        return '68%'
    }

    if (index === lines - 2 && lines > 3) {
        return '88%'
    }

    return '100%'
}

// Animated placeholder shown while content is loading. Hidden from assistive technology:
// it carries no content, the loading state belongs on the region that is loading.
export function MSkeleton({
    variant = 'text',
    width,
    height,
    radius,
    lines = 3,
    gap,
    animate = true,
    className,
    style,
    ...rest
}: MSkeletonProps) {
    const animation = animate === false ? 'none' : animate === true ? 'shimmer' : animate

    if (variant === 'text') {
        return (
            <div
                className={cn('skeleton-group', className)}
                style={{width: width ?? undefined, gap: gap ?? undefined, ...style}}
                aria-hidden="true"
                {...rest}
            >
                {Array.from({length: lines}, (_, i) => (
                    <div
                        key={i}
                        className={cn('skeleton', 'text', animation)}
                        style={{
                            width: getTextLineWidth(i, lines),
                            height: height ?? undefined,
                            borderRadius: radius ?? undefined,
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={cn('skeleton', variant, animation, className)}
            style={{
                width: width ?? undefined,
                height: height ?? undefined,
                borderRadius: radius ?? undefined,
                ...style,
            }}
            aria-hidden="true"
            {...rest}
        />
    )
}
