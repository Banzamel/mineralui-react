import {useCallback, useId, useRef} from 'react'
import type * as React from 'react'
import type {MSliderProps} from './MSlider.types'
import {cn} from '../../../utils/cn'
import './MSlider.css'

function countDecimals(value: number): number {
    if (!Number.isFinite(value)) return 0
    const text = String(value)
    const exponent = text.match(/e-(\d+)$/)
    if (exponent) return Number(exponent[1])
    const dot = text.indexOf('.')
    return dot === -1 ? 0 : text.length - dot - 1
}

export function MSlider({
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    marks,
    label,
    color = 'primary',
    disabled = false,
    getAriaValueText,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: MSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const labelId = useId()

    const percent = ((value - min) / (max - min)) * 100

    const clampAndSnap = useCallback(
        (raw: number) => {
            // Snap to the step grid anchored at `min` (not 0) and round away float noise
            // such as 0.1 + 0.2, using the precision of `min` and `step`.
            const decimals = Math.max(countDecimals(step), countDecimals(min))
            const snapped = step > 0 ? min + Math.round((raw - min) / step) * step : raw
            const rounded = Number(snapped.toFixed(decimals))
            return Math.min(max, Math.max(min, rounded))
        },
        [min, max, step]
    )

    const valueFromPointer = useCallback(
        (clientX: number) => {
            const track = trackRef.current
            if (!track) return value
            const rect = track.getBoundingClientRect()
            const ratio = (clientX - rect.left) / rect.width
            return clampAndSnap(min + ratio * (max - min))
        },
        [min, max, value, clampAndSnap]
    )

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (disabled) return
            e.preventDefault()
            // preventDefault() stops the native focus move, so focus the slider thumb explicitly.
            thumbRef.current?.focus({preventScroll: true})
            const target = e.currentTarget as HTMLElement
            target.setPointerCapture(e.pointerId)
            onChange(valueFromPointer(e.clientX))

            const onMove = (ev: PointerEvent) => {
                onChange(valueFromPointer(ev.clientX))
            }
            const onUp = () => {
                target.removeEventListener('pointermove', onMove)
                target.removeEventListener('pointerup', onUp)
            }
            target.addEventListener('pointermove', onMove)
            target.addEventListener('pointerup', onUp)
        },
        [disabled, onChange, valueFromPointer]
    )

    // APG slider keys: arrows step, PageUp / PageDown jump a tenth of the range, Home / End go to the ends.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return
            const range = max - min
            const unit = step > 0 ? step : range / 100
            const bigStep = Math.max(unit, step > 0 ? Math.round(range / 10 / step) * step : range / 10)
            const offset = value - min
            let next: number
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    next = min + (Math.floor(offset / unit + 1e-9) + 1) * unit
                    break
                case 'ArrowLeft':
                case 'ArrowDown':
                    next = min + (Math.ceil(offset / unit - 1e-9) - 1) * unit
                    break
                case 'PageUp':
                    next = value + bigStep
                    break
                case 'PageDown':
                    next = value - bigStep
                    break
                case 'Home':
                    next = min
                    break
                case 'End':
                    next = max
                    break
                default:
                    return
            }
            e.preventDefault()
            const clamped = clampAndSnap(next)
            if (clamped !== value) onChange(clamped)
        },
        [disabled, min, max, step, value, onChange, clampAndSnap]
    )

    const markLabel = marks?.find((mark) => mark.value === value)?.label
    const valueText = getAriaValueText ? getAriaValueText(value) : markLabel

    return (
        <div className={cn('slider', `color-${color}`, disabled && 'disabled', className)} {...rest}>
            {label && (
                <div className="label" id={labelId}>
                    {label}
                </div>
            )}
            <div className="track-wrapper" ref={trackRef} onPointerDown={handlePointerDown}>
                <div className="track">
                    <div className="fill" style={{width: `${percent}%`}} />
                    <div
                        ref={thumbRef}
                        className="thumb"
                        style={{left: `${percent}%`}}
                        role="slider"
                        tabIndex={disabled ? -1 : 0}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={value}
                        aria-valuetext={valueText}
                        aria-orientation="horizontal"
                        aria-disabled={disabled || undefined}
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledBy ?? (label && !ariaLabel ? labelId : undefined)}
                        aria-describedby={ariaDescribedBy}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {marks && marks.length > 0 && (
                    <div className="marks" aria-hidden="true">
                        {marks.map((mark) => {
                            const markPercent = ((mark.value - min) / (max - min)) * 100
                            return (
                                <div key={mark.value} className="mark" style={{left: `${markPercent}%`}}>
                                    <div className="tick" />
                                    {mark.label && <div className="label">{mark.label}</div>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
