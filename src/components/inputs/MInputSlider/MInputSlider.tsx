import {useState, useCallback, useId, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputSliderProps} from './MInputSlider.types'
import {MSlider} from '../../controls'
import {cn} from '../../../utils/cn'
import './MInputSlider.css'
import {useMInputTexts} from '../../../i18n/frameworkTexts'

function clampValue(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val))
}

function roundToPrecision(val: number, precision: number): number {
    const factor = Math.pow(10, precision)
    return Math.round(val * factor) / factor
}

export const MInputSlider = forwardRef<HTMLDivElement, MInputSliderProps>(function MInputSlider(
    {
        min = 0,
        max = 100,
        step = 1,
        value,
        onChange,
        precision = 0,
        marks,
        showInput = true,
        color = 'primary',
        size = 'md',
        disabled = false,
        label,
        className,
        ...rest
    },
    ref
) {
    const texts = useMInputTexts()
    const labelId = useId()
    const [internalValue, setInternalValue] = useState(min)
    const currentValue = value !== undefined ? value : internalValue
    // Text the user is typing into the field; null while not editing. Clamping waits
    // for blur/Enter so intermediate states like `1.` or `5` (on the way to `50`) survive.
    const [draft, setDraft] = useState<string | null>(null)

    const update = useCallback(
        (newVal: number) => {
            const clamped = roundToPrecision(clampValue(newVal, min, max), precision)
            if (value === undefined) setInternalValue(clamped)
            onChange?.(clamped)
        },
        [min, max, precision, value, onChange]
    )

    const handleSliderChange = useCallback((val: number) => update(val), [update])

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value
            setDraft(raw)
            const num = Number(raw.replace(',', '.'))
            // Live-follow the slider only with values already inside the range.
            if (raw.trim() !== '' && !isNaN(num) && num >= min && num <= max) update(num)
        },
        [min, max, update]
    )

    const commitDraft = useCallback(() => {
        if (draft === null) return
        const num = parseFloat(draft.replace(',', '.'))
        update(isNaN(num) ? currentValue : num)
        setDraft(null)
    }, [draft, currentValue, update])

    const handleBlur = useCallback(() => {
        if (draft === null) {
            update(currentValue)
            return
        }
        commitDraft()
    }, [draft, currentValue, update, commitDraft])

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') commitDraft()
        },
        [commitDraft]
    )

    return (
        <div ref={ref} className={cn('slider input', size, disabled && 'disabled', className)} {...rest}>
            {label && (
                <div className="slider label" id={labelId}>
                    {label}
                </div>
            )}
            <div className="slider row">
                <MSlider
                    min={min}
                    max={max}
                    step={step}
                    value={currentValue}
                    onChange={handleSliderChange}
                    marks={marks}
                    color={color}
                    disabled={disabled}
                    aria-labelledby={label ? labelId : undefined}
                    aria-label={label ? undefined : texts.sliderValue}
                />
                {showInput && (
                    <input
                        type="text"
                        inputMode="decimal"
                        className={cn('slider field', `color-${color}`)}
                        value={draft ?? String(currentValue)}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleInputKeyDown}
                        disabled={disabled}
                        aria-label={label || texts.sliderValue}
                    />
                )}
            </div>
        </div>
    )
})
