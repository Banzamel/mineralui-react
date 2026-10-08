import {useRef, useState} from 'react'
import type * as React from 'react'
import type {MRatingProps} from './MRating.types'
import {MStarFillIcon, MStarIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import {getRadioGroupTarget, isRtlElement} from '../../../utils/radioGroupKeys'
import './MRating.css'
import {formatMText, useMRatingTexts} from '../../../i18n/frameworkTexts'

// Render an interactive star-based rating control.
// Interactive: APG radio group — one Tab stop (roving tabindex), arrows move and select.
// Read-only: a single image named "4.5 of 5 stars".
export function MRating({
    value = 0,
    max = 5,
    color = 'warning',
    size = 'md',
    readOnly = false,
    onChange,
    className,
    ...rest
}: MRatingProps) {
    const texts = useMRatingTexts()
    const [hovered, setHovered] = useState<number | null>(null)
    const starRefs = useRef<(HTMLButtonElement | null)[]>([])
    const displayValue = hovered ?? value

    const rootClassName = cn('rating', `color-${color}`, size, readOnly && 'read-only', className)

    const renderIcon = (starIndex: number) => (
        <span className="star-icon" aria-hidden="true">
            {displayValue >= starIndex ? <MStarFillIcon /> : <MStarIcon />}
        </span>
    )

    if (readOnly) {
        const shown = Math.round(value * 100) / 100
        return (
            <div
                className={rootClassName}
                role="img"
                aria-label={formatMText(texts.readOnlyValue, {value: shown, max})}
                {...rest}
            >
                {Array.from({length: max}, (_, i) => (
                    <span key={i} className="rating-star" aria-hidden="true">
                        {renderIcon(i + 1)}
                    </span>
                ))}
            </div>
        )
    }

    const checkedIndex = Math.round(value) >= 1 ? Math.min(Math.round(value), max) - 1 : -1
    const tabbableIndex = checkedIndex >= 0 ? checkedIndex : 0

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        rest.onKeyDown?.(e)
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
        const current = starRefs.current.findIndex((star) => star === e.target)
        if (current < 0) return
        const target = getRadioGroupTarget(e.key, current, max, isRtlElement(e.currentTarget))
        if (target === null) return
        e.preventDefault()
        starRefs.current[target]?.focus()
        onChange?.(target + 1)
    }

    return (
        <div
            className={rootClassName}
            role="radiogroup"
            aria-label={texts.label}
            onMouseLeave={() => setHovered(null)}
            {...rest}
            onKeyDown={handleKeyDown}
        >
            {Array.from({length: max}, (_, i) => {
                const starIndex = i + 1
                return (
                    <button
                        key={i}
                        ref={(el) => {
                            starRefs.current[i] = el
                        }}
                        type="button"
                        className="rating-star"
                        role="radio"
                        aria-checked={i === checkedIndex}
                        onClick={() => onChange?.(starIndex)}
                        onMouseEnter={() => setHovered(starIndex)}
                        aria-label={formatMText(starIndex > 1 ? texts.stars : texts.star, {count: starIndex})}
                        tabIndex={i === tabbableIndex ? 0 : -1}
                    >
                        {renderIcon(starIndex)}
                    </button>
                )
            })}
        </div>
    )
}
