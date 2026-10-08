import {forwardRef} from 'react'
import type {MIconProps} from './MIcon.types'

const sizeMap = {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '2rem',
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

// Shared icon wrapper keeps stroke and sizing consistent across the set.
export const MIcon = forwardRef<SVGSVGElement, MIconProps>(function MIcon(
    {
        size = '1.1em',
        color = 'inherit',
        title,
        children,
        viewBox = '0 0 24 24',
        fill = 'none',
        stroke = 'currentColor',
        strokeWidth = 1.8,
        strokeLinecap = 'round',
        strokeLinejoin = 'round',
        style,
        shell: _shell,
        ...rest
    },
    ref
) {
    const iconSize = Object.prototype.hasOwnProperty.call(sizeMap, size) ? sizeMap[size as keyof typeof sizeMap] : size
    const iconColor = colorMap[color]
    // A titled / labelled icon is exposed as one image with a name; a decorative one is hidden.
    const labelled = Boolean(title || rest['aria-label'] || rest['aria-labelledby'])

    return (
        <svg
            ref={ref}
            width={iconSize}
            height={iconSize}
            viewBox={viewBox}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap={strokeLinecap}
            strokeLinejoin={strokeLinejoin}
            role={labelled ? 'img' : undefined}
            aria-label={title || undefined}
            aria-hidden={labelled ? undefined : true}
            focusable="false"
            style={{
                display: 'inline-block',
                flexShrink: 0,
                verticalAlign: '-0.150em',
                ...style,
                color: iconColor ?? style?.color,
            }}
            {...rest}
        >
            {title ? <title>{title}</title> : null}
            {children}
        </svg>
    )
})
