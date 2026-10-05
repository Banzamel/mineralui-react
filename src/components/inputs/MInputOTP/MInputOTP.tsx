import {useState, useCallback, useRef, useEffect, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputOTPProps} from './MInputOTP.types'
import {cn} from '../../../utils/cn'
import {MCloseIcon} from '../../../icons'
import './MInputOTP.css'
import {useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'

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
    const [internalValue, setInternalValue] = useState('')
    const currentValue = value !== undefined ? value : internalValue
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])
    const resolvedColorClass = error ? 'color-error' : `color-${color}`

    const updateValue = useCallback(
        (newVal: string) => {
            if (value === undefined) setInternalValue(newVal)
            onChange?.(newVal)
        },
        [value, onChange]
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
            const chars = currentValue.split('')
            while (chars.length <= index) chars.push('')
            chars[index] = char
            updateValue(chars.join(''))
            if (index < length - 1) focusSlot(index + 1)
        },
        [currentValue, length, updateValue, focusSlot]
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace') {
                e.preventDefault()
                const chars = currentValue.split('')
                if (chars[index]) {
                    chars[index] = ''
                    updateValue(chars.join(''))
                } else if (index > 0) {
                    chars[index - 1] = ''
                    updateValue(chars.join(''))
                    focusSlot(index - 1)
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                if (index > 0) focusSlot(index - 1)
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                if (index < length - 1) focusSlot(index + 1)
            }
        },
        [currentValue, length, updateValue, focusSlot]
    )

    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (pasted) {
                updateValue(pasted)
                focusSlot(Math.min(pasted.length, length - 1))
            }
        },
        [length, updateValue, focusSlot]
    )

    const handleClear = useCallback(() => {
        updateValue('')
        onClear?.()
        focusSlot(0)
    }, [focusSlot, onClear, updateValue])

    return (
        <div
            ref={ref}
            className={cn('otp input', resolvedColorClass, size, disabled && 'disabled', className)}
            {...rest}
        >
            {label && <div className="otp label">{label}</div>}
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
                            value={currentValue[i] || ''}
                            disabled={disabled}
                            className={cn('otp slot', currentValue[i] && 'filled')}
                            aria-label={formatMText(texts.digitNumber, {index: i + 1})}
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
