import {useState, useCallback, useEffect, useId, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputPasswordProps, MPasswordStrength} from './MInputPassword.types'
import {MInput} from '../MInput'
import {MEyeIcon, MEyeOffIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import './MInputPassword.css'
import {formatMText, useMInputTexts} from '../../../i18n/frameworkTexts'

// Approximate password strength with simple UI-focused heuristics.
function calcStrength(value: string): MPasswordStrength {
    let score = 0
    if (value.length >= 8) score++
    if (value.length >= 12) score++
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
    if (/\d/.test(value)) score++
    if (/[^a-zA-Z0-9]/.test(value)) score++

    if (score <= 1) return 'weak'
    if (score <= 2) return 'fair'
    if (score <= 3) return 'good'
    return 'strong'
}

// Extend the base input with password visibility and optional strength feedback.
export const MInputPassword = forwardRef<HTMLInputElement, MInputPasswordProps>(function MInputPassword(
    {showToggle = true, showStrength = false, onStrengthChange, value, defaultValue, onChange, className, id, ...rest},
    ref
) {
    const texts = useMInputTexts()
    const generatedId = useId()
    const inputId = id ?? generatedId
    const [visible, setVisible] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const currentValue = value !== undefined ? value.toString() : internalValue
    const strength = calcStrength(currentValue)

    useEffect(() => {
        onStrengthChange?.(strength)
    }, [strength, onStrengthChange])

    // Keep uncontrolled usage working while reporting changes to the caller.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === undefined) {
                setInternalValue(e.target.value)
            }
            onChange?.(e)
        },
        [onChange, value]
    )

    // APG toggle button: reachable with Tab, constant name, state carried by `aria-pressed`.
    const toggleIcon = showToggle ? (
        <button
            type="button"
            className="password toggle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setVisible((v) => !v)}
            aria-label={texts.showPassword}
            aria-pressed={visible}
            aria-controls={inputId}
            disabled={rest.disabled}
        >
            {visible ? <MEyeOffIcon /> : <MEyeIcon />}
        </button>
    ) : undefined

    return (
        <div className={cn('password input', className)}>
            <MInput
                {...rest}
                ref={ref}
                id={inputId}
                type={visible ? 'text' : 'password'}
                value={currentValue}
                onChange={handleChange}
                endIcon={toggleIcon}
            />
            {showStrength && currentValue.length > 0 && (
                <div className="password strength row">
                    <div className="password strength bar" aria-hidden="true">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    'password strength segment',
                                    i < ['weak', 'fair', 'good', 'strong'].indexOf(strength) + 1 &&
                                        `strength-${strength}`
                                )}
                            />
                        ))}
                    </div>
                    <span className={cn('password strength label', `strength-${strength}`)} aria-hidden="true">
                        {texts.strength[strength]}
                    </span>
                </div>
            )}
            {showStrength && (
                // Kept mounted so screen readers pick up every change of the live region.
                <span className="password strength announcement" role="status" aria-live="polite">
                    {currentValue.length > 0
                        ? formatMText(texts.passwordStrength, {strength: texts.strength[strength]})
                        : ''}
                </span>
            )}
        </div>
    )
})
