import {useState, useCallback, useRef, useEffect, useId, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputOTPProps} from './MInputOTP.types'
import {cn} from '../../../utils/cn'
import {MCloseIcon} from '../../../icons'
import './MInputOTP.css'
import {useMCommonTexts, useMInputTexts, formatMText} from '../../../i18n/frameworkTexts'

// Spread a code string over `length` slots; missing characters become empty slots.
function toSlots(source: string, length: number): string[] {
    return Array.from({length}, (_, i) => source[i] ?? '')
}

export const MInputOTP = forwardRef<HTMLDivElement, MInputOTPProps>(function MInputOTP(
    {
        length = 6,
        value,
        onChange,
        autoFocus = false,
        disabled = false,
        color = 'primary',
        size = 'md',
        error = false,
        errorText,
        clearable = false,
        label,
        onClear,
        className,
        ...rest
    },
    ref
) {
    const texts = useMCommonTexts()
    const inputTexts = useMInputTexts()
    const labelId = useId()
    // Slots are kept per position, so clearing a middle digit leaves a hole instead of
    // shifting the digits after it. The emitted value is the digits joined without holes.
    const [slotState, setSlotState] = useState<string[]>(() => toSlots(value ?? '', length))
    const ownSlots = slotState.length === length ? slotState : toSlots(slotState.join(''), length)
    const slots = value !== undefined && value !== ownSlots.join('') ? toSlots(value, length) : ownSlots
    const currentValue = slots.join('')
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])
    const resolvedColorClass = error ? 'color-error' : `color-${color}`

    const updateSlots = useCallback(
        (next: string[]) => {
            setSlotState(next)
            onChange?.(next.join(''))
        },
        [onChange]
    )

    const focusSlot = useCallback(
        (index: number) => {
            const clamped = Math.max(0, Math.min(index, length - 1))
            inputsRef.current[clamped]?.focus()
        },
        [length]
    )

    useEffect(() => {
        if (autoFocus) focusSlot(0)
    }, [autoFocus, focusSlot])

    const handleInput = useCallback(
        (index: number, char: string) => {
            if (!/^\d$/.test(char)) return
            const next = [...slots]
            next[index] = char
            updateSlots(next)
            if (index < length - 1) focusSlot(index + 1)
        },
        [slots, length, updateSlots, focusSlot]
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
                e.preventDefault()
                const next = [...slots]
                if (next[index]) {
                    next[index] = ''
                    updateSlots(next)
                } else if (index > 0) {
                    next[index - 1] = ''
                    updateSlots(next)
                    focusSlot(index - 1)
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                if (index > 0) focusSlot(index - 1)
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                if (index < length - 1) focusSlot(index + 1)
            } else if (e.key === 'Home') {
                e.preventDefault()
                focusSlot(0)
            } else if (e.key === 'End') {
                e.preventDefault()
                focusSlot(length - 1)
            }
        },
        [slots, length, updateSlots, focusSlot]
    )

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) {
                updateSlots(toSlots(pasted, length))
                focusSlot(Math.min(pasted.length, length - 1))
            }
        },
        [length, updateSlots, focusSlot]
    )

    const handleClear = useCallback(() => {
        updateSlots(toSlots('', length))
        onClear?.()
        focusSlot(0)
    }, [focusSlot, length, onClear, updateSlots])

    return (
        <div
            ref={ref}
            className={cn('otp input', resolvedColorClass, size, disabled && 'disabled', className)}
            role="group"
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : inputTexts.otpGroup}
            {...rest}
        >
            {label && (
                <div id={labelId} className="otp label">
                    {label}
                </div>
            )}
            <div className="otp control">
                <div className="otp slots" onPaste={handlePaste}>
                    {Array.from({length}, (_, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                inputsRef.current[i] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={slots[i]}
                            disabled={disabled}
                            autoComplete={i === 0 ? 'one-time-code' : 'off'}
                            className={cn('otp slot', slots[i] && 'filled')}
                            aria-label={formatMText(inputTexts.otpDigit, {index: i + 1, count: length})}
                            onChange={(e) => {
                                const char = e.target.value.slice(-1)
                                handleInput(i, char)
                            }}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onFocus={(e) => e.target.select()}
                        />
                    ))}
                </div>
                {clearable && currentValue.length > 0 && !disabled && (
                    <button
                        type="button"
                        className="otp clear clear-btn-base"
                        onClick={handleClear}
                        aria-label={texts.clearCode}
                    >
                        <MCloseIcon />
                    </button>
                )}
            </div>
            {error && errorText && <div className="otp error">{errorText}</div>}
        </div>
    )
})
