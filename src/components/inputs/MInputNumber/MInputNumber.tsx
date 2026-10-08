import {useState, useCallback, useRef, useEffect, useId, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputNumberProps} from './MInputNumber.types'
import {MInput} from '../MInput'
import {cn} from '../../../utils/cn'
import {MChevronDownIcon, MChevronUpIcon} from '../../../icons'
import './MInputNumber.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Keep numeric values inside optional min and max bounds.
function clampValue(val: number, min?: number, max?: number): number {
    if (min !== undefined && val < min) return min
    if (max !== undefined && val > max) return max
    return val
}

// Prevent floating-point drift when step values use decimal precision.
function roundToPrecision(val: number, precision: number): number {
    const factor = Math.pow(10, precision)
    return Math.round(val * factor) / factor
}

// Parse user input, accepting a comma as the decimal separator (`1,5` → 1.5).
function parseNumber(val: string): number {
    return parseFloat(val.replace(',', '.'))
}

// Extend the base input with stepping, clamping and keyboard increment support.
export const MInputNumber = forwardRef<HTMLInputElement, MInputNumberProps>(function MInputNumber(
    {
        min,
        max,
        step = 1,
        showStepper = true,
        precision = 0,
        allowNegative = true,
        onValueChange,
        value,
        defaultValue,
        onChange,
        onKeyDown,
        onBlur,
        disabled = false,
        className,
        id: idProp,
        inputProps,
        ...rest
    },
    ref
) {
    const texts = useMCommonTexts()
    // The steppers point at the input through `aria-controls`, so the id must always exist.
    const generatedId = useId()
    const inputId = idProp ?? generatedId
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const currentValue = value !== undefined ? value.toString() : internalValue
    const intervalRef = useRef<ReturnType<typeof setInterval>>(null)
    const currentValueRef = useRef(currentValue)

    useEffect(() => {
        currentValueRef.current = currentValue
    }, [currentValue])

    // Keep the displayed string and numeric callback in sync.
    const updateValue = useCallback(
        (newVal: string) => {
            if (value === undefined) {
                setInternalValue(newVal)
            }
            const num = parseNumber(newVal)
            onValueChange?.(isNaN(num) ? null : num)
        },
        [value, onValueChange]
    )

    // Commit an already computed numeric value (clamped and rounded).
    const commitNumber = useCallback(
        (next: number) => {
            const newVal = roundToPrecision(clampValue(next, min, max), precision)
            currentValueRef.current = newVal.toString()
            updateValue(newVal.toString())
        },
        [min, max, precision, updateValue]
    )

    // Move the current value by `multiplier` steps in the requested direction.
    const increment = useCallback(
        (direction: 1 | -1, multiplier = 1) => {
            const current = parseNumber(currentValueRef.current) || 0
            commitNumber(current + step * multiplier * direction)
        },
        [step, commitNumber]
    )

    // Repeat stepping while the pointer is held on a stepper button.
    const startHold = useCallback(
        (direction: 1 | -1) => {
            increment(direction)
            intervalRef.current = setInterval(() => increment(direction), 150)
        },
        [increment]
    )

    // Clear the hold timer when the pointer is released.
    const stopHold = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    useEffect(() => stopHold, [stopHold])

    // Filter user input down to numeric characters before storing it.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value
            const filtered = raw.replace(allowNegative ? /[^\d.,-]/g : /[^\d.,]/g, '')
            currentValueRef.current = filtered
            updateValue(filtered)
            onChange?.(e)
        },
        [onChange, allowNegative, updateValue]
    )

    // Snap the entered value back into range when the field loses focus.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const num = parseNumber(currentValueRef.current)
            if (!isNaN(num)) {
                const clamped = roundToPrecision(clampValue(num, min, max), precision)
                currentValueRef.current = clamped.toString()
                updateValue(clamped.toString())
            }
            onBlur?.(e)
        },
        [min, max, precision, updateValue, onBlur]
    )

    // WAI-ARIA spinbutton keys: arrows step, PageUp / PageDown step by ten, Home / End jump to the
    // bounds (only when they exist, otherwise the keys keep moving the caret).
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                increment(1)
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                increment(-1)
            } else if (e.key === 'PageUp') {
                e.preventDefault()
                increment(1, 10)
            } else if (e.key === 'PageDown') {
                e.preventDefault()
                increment(-1, 10)
            } else if (e.key === 'Home' && min !== undefined) {
                e.preventDefault()
                commitNumber(min)
            } else if (e.key === 'End' && max !== undefined) {
                e.preventDefault()
                commitNumber(max)
            }
            onKeyDown?.(e)
        },
        [increment, commitNumber, min, max, onKeyDown]
    )

    // Screen readers and keyboard activation fire a click without a preceding pointerdown
    // (`detail === 0`); pointer clicks were already handled by the hold-to-repeat logic.
    const handleStepClick = (direction: 1 | -1) => (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.detail === 0) increment(direction)
    }

    const numericValue = parseNumber(currentValue)

    const stepper =
        showStepper && !disabled ? (
            <div className="number stepper">
                <button
                    type="button"
                    className="number step button"
                    onPointerDown={(event) => {
                        event.preventDefault()
                        startHold(1)
                    }}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                    onPointerCancel={stopHold}
                    onClick={handleStepClick(1)}
                    tabIndex={-1}
                    aria-label={texts.increment}
                    aria-controls={inputId}
                >
                    <MChevronUpIcon />
                </button>
                <button
                    type="button"
                    className="number step button"
                    onPointerDown={(event) => {
                        event.preventDefault()
                        startHold(-1)
                    }}
                    onPointerUp={stopHold}
                    onPointerLeave={stopHold}
                    onPointerCancel={stopHold}
                    onClick={handleStepClick(-1)}
                    tabIndex={-1}
                    aria-label={texts.decrement}
                    aria-controls={inputId}
                >
                    <MChevronDownIcon />
                </button>
            </div>
        ) : undefined

    return (
        <MInput
            {...rest}
            ref={ref}
            id={inputId}
            inputProps={{
                role: 'spinbutton',
                'aria-valuenow': isNaN(numericValue) ? undefined : numericValue,
                'aria-valuemin': min,
                'aria-valuemax': max,
                ...inputProps,
            }}
            type="text"
            inputMode="decimal"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            endIcon={stepper}
            disabled={disabled}
            className={cn('number input', className)}
        />
    )
})
