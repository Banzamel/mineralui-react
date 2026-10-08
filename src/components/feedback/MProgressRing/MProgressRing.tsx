import type {CSSProperties} from 'react'
import type {MProgressRingProps} from './MProgressRing.types'
import {cn} from '../../../utils/cn'
import './MProgressRing.css'
import {formatMText, useMProgressRingTexts} from '../../../i18n/frameworkTexts'

const SIZE_PX: Record<string, number> = {xs: 24, sm: 36, md: 56, lg: 88, xl: 128}
const DEFAULT_THICKNESS: Record<string, number> = {xs: 2, sm: 3, md: 4, lg: 6, xl: 8}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

function resolveDiameter(size: MProgressRingProps['size']): number {
    if (typeof size === 'number') return size
    return SIZE_PX[size ?? 'md'] ?? SIZE_PX.md
}

function resolveThickness(thickness: number | undefined, size: MProgressRingProps['size']): number {
    if (typeof thickness === 'number') return thickness
    if (typeof size === 'number') return Math.max(2, Math.round(size / 14))
    return DEFAULT_THICKNESS[size ?? 'md'] ?? DEFAULT_THICKNESS.md
}

/**
 * Determinate ring progress — 0–100 with optional centered percent label.
 * Visually consistent with `MLoader`/`MSpinner`: same MColor palette, same
 * size tokens (xs/sm/md/lg/xl). Use a number for a custom diameter when the
 * design needs an off-token size.
 */
export function MProgressRing({
    value,
    size = 'md',
    color = 'primary',
    thickness,
    showPercent = true,
    label,
    ariaLabel,
    className,
    style,
    ...rest
}: MProgressRingProps) {
    const texts = useMProgressRingTexts()
    const clampedValue = clamp(Math.round(value), 0, 100)
    const diameter = resolveDiameter(size)
    const stroke = resolveThickness(thickness, size)
    const radius = (diameter - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - clampedValue / 100)

    const inlineStyle: CSSProperties = {
        width: `${diameter}px`,
        height: `${diameter}px`,
        ...style,
    }

    const sizeClass = typeof size === 'string' ? size : 'custom'
    const accessibleLabel = ariaLabel ?? formatMText(texts.label, {value: clampedValue})
    const showLabel = label !== undefined ? label !== null : showPercent

    return (
        <div
            className={cn('progress-ring', sizeClass, color && `color-${color}`, className)}
            style={inlineStyle}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={accessibleLabel}
            {...rest}
        >
            <svg
                className="progress-ring-svg"
                width={diameter}
                height={diameter}
                viewBox={`0 0 ${diameter} ${diameter}`}
                aria-hidden="true"
            >
                <circle
                    className="progress-ring-track"
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                />
                <circle
                    className="progress-ring-indicator"
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
                />
            </svg>
            {showLabel ? (
                <span className="progress-ring-label" aria-hidden="true">
                    {label !== undefined ? label : `${clampedValue}%`}
                </span>
            ) : null}
        </div>
    )
}
