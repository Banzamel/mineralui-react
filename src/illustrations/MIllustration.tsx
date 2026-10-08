import {forwardRef} from 'react'
import type {MIllustrationProps} from './MIllustration.types'
import {cn} from '../utils/cn'
import './MIllustration.css'

const sizeMap = {
    xs: 80,
    sm: 120,
    md: 200,
    lg: 280,
    xl: 400,
} as const

const colorMap = {
    primary: 'var(--mineral-primary)',
    neutral: 'var(--mineral-neutral)',
    success: 'var(--mineral-success)',
    error: 'var(--mineral-error)',
    warning: 'var(--mineral-warning)',
    info: 'var(--mineral-info)',
    light: 'var(--mineral-light)',
    dark: 'var(--mineral-dark-color)',
    news: 'var(--mineral-news)',
    inherit: 'inherit',
} as const

// Shared wrapper for themed SVG illustrations.
// Each illustration receives a resolved size, accent color and optional animation.
export const MIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(function MIllustration(
    {
        size = 'md',
        color = 'primary',
        title,
        animate = true,
        className,
        style,
        children,
        viewBox = '0 0 200 200',
        ...rest
    },
    ref
) {
    const resolvedSize = typeof size === 'number' ? size : sizeMap[size]
    const resolvedColor = colorMap[color] ?? colorMap.primary

    return (
        <svg
            ref={ref}
            width={resolvedSize}
            height={resolvedSize}
            viewBox={viewBox}
            fill="none"
            role={title ? 'img' : undefined}
            aria-hidden={title ? undefined : true}
            aria-label={title || undefined}
            focusable="false"
            className={cn('illustration', animate && 'animate', className)}
            style={
                {
                    '--illustration-accent': resolvedColor,
                    ...style,
                } as React.CSSProperties
            }
            {...rest}
        >
            {title ? <title>{title}</title> : null}
            {children}
        </svg>
    )
})
