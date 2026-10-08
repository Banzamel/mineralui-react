import {forwardRef, useCallback, useMemo, useState} from 'react'
import type * as React from 'react'
import type {MInputIBANProps} from './MInputIBAN.types'
import {MInputGroup} from '../MInputGroup'
import {useFormatCaret} from '../MInput/useFormatCaret'
import {cn} from '../../../utils/cn'
import {ibanCountries, getIbanCountryLength, validateIBAN} from '../../../utils/validators'
import {formatIBAN, unformatIBAN} from '../../../utils/formatters'
import type {ValidationResult} from '../../../utils/validators'
import './MInputIBAN.css'
import {formatMText, useMInputTexts, useMValidationMessage} from '../../../i18n/frameworkTexts'

function normalizeCountryCode(countryCode?: string): string {
    return (
        countryCode
            ?.replace(/[^a-zA-Z]/g, '')
            .toUpperCase()
            .slice(0, 2) || ''
    )
}

function getAccountDigitsCap(countryCode: string): number {
    const length = getIbanCountryLength(countryCode) ?? 28
    return Math.max(length - 2, 0)
}

function buildIbanPlaceholder(countryCode: string): string {
    const accountChars = getAccountDigitsCap(countryCode)
    const groups: string[] = []
    let remaining = accountChars

    while (remaining > 0) {
        const take = Math.min(4, remaining)
        groups.push('0'.repeat(take))
        remaining -= take
    }

    return groups.join(' ')
}

// Browser-level cap: account digits plus the spaces that formatIBAN inserts between 4-char groups.
function getFormattedMaxLength(countryCode: string): number {
    const accountChars = getAccountDigitsCap(countryCode)
    if (accountChars === 0) return 0
    const spaces = Math.max(0, Math.ceil(accountChars / 4) - 1)
    return accountChars + spaces
}

// Extend the grouped input with country-aware IBAN formatting and checksum validation.
export const MInputIBAN = forwardRef<HTMLInputElement, MInputIBANProps>(function MInputIBAN(
    {
        countryCode,
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
        helperText,
        placeholder,
        className,
        disabled = false,
        ...rest
    },
    ref
) {
    const texts = useMInputTexts()
    const captureCaret = useFormatCaret()
    const [internalCountry, setInternalCountry] = useState(normalizeCountryCode(countryCode) || 'PL')
    const currentCountry = normalizeCountryCode(countryCode) || internalCountry

    const buildDisplayValue = useCallback(
        (raw: string, country: string): string => {
            // Letters stay — BBAN parts of e.g. GB, NL or IE IBANs carry a bank code.
            const cleaned = unformatIBAN(raw)
                .replace(/[^0-9A-Z]/g, '')
                .slice(0, getAccountDigitsCap(country))
            if (!cleaned) return ''
            return formatOnChange ? formatIBAN(cleaned) : cleaned
        },
        [formatOnChange]
    )

    const [internalValue, setInternalValue] = useState(() =>
        buildDisplayValue(defaultValue?.toString() ?? '', normalizeCountryCode(countryCode) || 'PL')
    )
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)

    const currentValue = value !== undefined ? buildDisplayValue(value.toString(), currentCountry) : internalValue

    const resetValidation = useCallback(() => {
        setValidation({valid: true})
        setTouched(false)
        onValidationChange?.({valid: true})
    }, [onValidationChange])

    // Keep raw and formatted IBAN values aligned for consumers and display.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            captureCaret(e)
            const formatted = buildDisplayValue(e.target.value, currentCountry)

            if (value === undefined) {
                setInternalValue(formatted)
            }

            if (!formatted && (touched || !validation.valid)) {
                resetValidation()
            }

            onValueChange?.(unformatIBAN(formatted), formatted)
            onChange?.(e)
        },
        [
            buildDisplayValue,
            captureCaret,
            currentCountry,
            onChange,
            onValueChange,
            resetValidation,
            touched,
            validation.valid,
            value,
        ]
    )

    // Validate the normalized IBAN once the user leaves the field.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)

            if (validateOnBlur && currentValue) {
                const fullIban = `${currentCountry}${unformatIBAN(currentValue)}`
                const result = translateValidation(validateIBAN(fullIban))
                setValidation(result)
                onValidationChange?.(result)
            }

            onBlur?.(e)
        },
        [currentCountry, currentValue, onBlur, onValidationChange, validateOnBlur, translateValidation]
    )

    // Reset both the displayed value and any error state when the clear button fires.
    const handleClear = useCallback(() => {
        if (value === undefined) setInternalValue('')
        resetValidation()
        onValueChange?.('', '')
        onClear?.()
    }, [onClear, onValueChange, resetValidation, value])

    // Switch the country code via the inline select.
    const handleCountrySelect = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const next = normalizeCountryCode(e.target.value)
            if (!next) return

            if (countryCode === undefined) {
                setInternalCountry(next)
            }

            const reformatted = buildDisplayValue(currentValue, next)
            if (value === undefined) {
                setInternalValue(reformatted)
            }
            onValueChange?.(unformatIBAN(reformatted), reformatted)

            onCountryChange?.(next)

            if (touched && reformatted) {
                const fullIban = `${next}${unformatIBAN(reformatted)}`
                const result = translateValidation(validateIBAN(fullIban))
                setValidation(result)
                onValidationChange?.(result)
            }
        },
        [
            buildDisplayValue,
            countryCode,
            currentValue,
            onCountryChange,
            onValidationChange,
            onValueChange,
            touched,
            value,
            translateValidation,
        ]
    )

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)

    const countryOptions = useMemo(() => ibanCountries, [])
    const resolvedHelperText = resolvedErrorText
        ? undefined
        : (helperText ??
          formatMText(texts.formatHint, {example: `${currentCountry} ${buildIbanPlaceholder(currentCountry)}`}))

    return (
        <MInputGroup
            {...rest}
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onClear={handleClear}
            error={isError}
            errorText={resolvedErrorText}
            placeholder={placeholder ?? buildIbanPlaceholder(currentCountry)}
            helperText={resolvedHelperText}
            disabled={disabled}
            maxLength={getFormattedMaxLength(currentCountry)}
            prepend={
                <div className="country-select-wrap">
                    <select
                        className="country-select"
                        value={currentCountry}
                        onChange={handleCountrySelect}
                        disabled={disabled}
                        aria-label={texts.ibanCountry}
                    >
                        {countryOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            }
            className={cn('input-iban', className)}
        />
    )
})
