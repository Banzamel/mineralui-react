import {useState, useCallback, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputPhoneProps} from './MInputPhone.types'
import {MInput} from '../MInput'
import {useFormatCaret} from '../MInput/useFormatCaret'
import {cn} from '../../../utils/cn'
import {validatePhone} from '../../../utils/validators'
import {formatPhone, stripNonDigits} from '../../../utils/formatters'
import type {ValidationResult} from '../../../utils/validators'
import {MPhoneIcon} from '../../../icons'
import './MInputPhone.css'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'

const COUNTRY_PREFIXES: Record<string, string> = {
    PL: '+48',
    DE: '+49',
    US: '+1',
    GB: '+44',
    FR: '+33',
    CZ: '+420',
    SK: '+421',
}

// Sort longest prefix first so '+421' is matched before '+4'.
const PREFIX_ENTRIES = Object.entries(COUNTRY_PREFIXES).sort(([, a], [, b]) => b.length - a.length)

// Match a leading +XX prefix back to its country code so the user can type the country in.
function detectCountryFromValue(value: string): {country: string; rest: string} | null {
    const trimmed = value.trim().replace(/^00/, '+')

    if (!trimmed.startsWith('+')) {
        return null
    }

    const digitsAfterPlus = '+' + stripNonDigits(trimmed)

    for (const [country, prefix] of PREFIX_ENTRIES) {
        if (digitsAfterPlus.startsWith(prefix)) {
            return {country, rest: digitsAfterPlus.slice(prefix.length)}
        }
    }

    return null
}

// Detect a partial prefix the user is in the middle of typing (e.g. "+4" before they finish "+49").
function looksLikePartialPrefix(value: string): boolean {
    const trimmed = value.trim()
    if (!trimmed.startsWith('+') && !trimmed.startsWith('00')) return false
    const normalized = trimmed.startsWith('00') ? '+' + trimmed.slice(2) : trimmed
    const digits = stripNonDigits(normalized)
    // Longest prefix in COUNTRY_PREFIXES is 3 digits ("+421"), so accept up to 3 digits as "still typing".
    return digits.length <= 3
}

// Normalize a partial prefix to canonical "+digits" form, so 00420 → +420 while typing.
function normalizePartialPrefix(value: string): string {
    const trimmed = value.trim()
    const body = trimmed.startsWith('00') ? trimmed.slice(2) : trimmed.slice(1)
    return '+' + stripNonDigits(body).slice(0, 3)
}

// Extend the base input with country-aware phone formatting and validation.
export const MInputPhone = forwardRef<HTMLInputElement, MInputPhoneProps>(function MInputPhone(
    {
        countryCode,
        defaultCountryCode = 'PL',
        showCountryCode = true,
        formatOnChange = true,
        validateOnBlur = true,
        onValidationChange,
        onValueChange,
        onCountryChange,
        onClear,
        value,
        defaultValue,
        onChange,
        onBlur,
        error,
        errorText,
        placeholder = '123 456 789',
        className,
        ...rest
    },
    ref
) {
    const [internalCountry, setInternalCountry] = useState((countryCode ?? defaultCountryCode).toUpperCase())
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)

    const currentCountry = (countryCode ?? internalCountry).toUpperCase()
    const captureCaret = useFormatCaret()
    const currentValue = value !== undefined ? value.toString() : internalValue

    // Keep the emitted raw digits and the displayed formatted value aligned.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value

            // Empty input — short-circuit so clear/backspace doesn't loop through the formatter.
            if (raw === '') {
                if (value === undefined) setInternalValue('')
                onValueChange?.('', '')
                onChange?.(e)
                return
            }

            const detected = detectCountryFromValue(raw)

            if (detected) {
                const nextCountry = detected.country
                if (countryCode === undefined && nextCountry !== currentCountry) {
                    setInternalCountry(nextCountry)
                    onCountryChange?.(nextCountry)
                }
                const digits = stripNonDigits(detected.rest)
                const formatted = formatOnChange ? formatPhone(digits, {countryCode: nextCountry}) : digits
                if (value === undefined) setInternalValue(formatted)
                onValueChange?.(digits, formatted)
                onChange?.(e)
                return
            }

            // User is mid-prefix (e.g. "+", "+4", "+42") — preserve so they can finish typing.
            if (looksLikePartialPrefix(raw)) {
                const preserved = normalizePartialPrefix(raw)
                if (value === undefined) setInternalValue(preserved)
                // A half-typed country prefix is not a phone number yet — the raw value stays empty.
                onValueChange?.('', preserved)
                onChange?.(e)
                return
            }

            captureCaret(e)
            const digits = stripNonDigits(raw)
            const formatted = formatOnChange ? formatPhone(digits, {countryCode: currentCountry}) : digits

            if (value === undefined) {
                setInternalValue(formatted)
            }
            onValueChange?.(digits, formatted)
            onChange?.(e)
        },
        [captureCaret, onChange, value, formatOnChange, currentCountry, countryCode, onValueChange, onCountryChange]
    )

    // Validate the raw number on blur using country-specific length rules.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)
            if (validateOnBlur && currentValue) {
                const result = translateValidation(validatePhone(stripNonDigits(currentValue), currentCountry))
                setValidation(result)
                onValidationChange?.(result)
            }
            onBlur?.(e)
        },
        [onBlur, validateOnBlur, currentValue, currentCountry, onValidationChange, translateValidation]
    )

    // Reset validation state alongside the value when the clear button fires.
    const handleClear = useCallback(() => {
        if (value === undefined) setInternalValue('')
        setValidation({valid: true})
        setTouched(false)
        onValidationChange?.({valid: true})
        onValueChange?.('', '')
        onClear?.()
    }, [onClear, onValueChange, onValidationChange, value])

    // Hide the static prefix while the user is typing a partial +XX so the field doesn't show two prefixes at once.
    const isTypingPrefix = currentValue.startsWith('+')
    const prefix =
        showCountryCode && !isTypingPrefix ? (
            <span className="phone prefix">{COUNTRY_PREFIXES[currentCountry] ?? `+${currentCountry}`}</span>
        ) : undefined

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)

    return (
        <MInput
            {...rest}
            ref={ref}
            type="tel"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onClear={handleClear}
            error={isError}
            errorText={resolvedErrorText}
            placeholder={placeholder}
            startIcon={showCountryCode ? prefix : <MPhoneIcon />}
            className={cn('phone input', className)}
        />
    )
})
