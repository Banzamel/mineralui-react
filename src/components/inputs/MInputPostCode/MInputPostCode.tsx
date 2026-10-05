import {forwardRef, useCallback, useMemo, useState} from 'react'
import type * as React from 'react'
import type {MInputPostCodeProps} from './MInputPostCode.types'
import {MInputGroup} from '../MInputGroup'
import {cn} from '../../../utils/cn'
import {formatPostCode, getPostCodeRule, postCodeCountries, validatePostCode} from '../../../utils/postalCodes'
import type {ValidationResult} from '../../../utils/validators'
import './MInputPostCode.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Extend the grouped input with country-aware postal code masking and validation.
export const MInputPostCode = forwardRef<HTMLInputElement, MInputPostCodeProps>(function MInputPostCode(
    {
        country,
        defaultCountry = 'PL',
        selectableCountry = true,
        validateOnBlur = true,
        validateOnChange = false,
        onCountryChange,
        onValidationChange,
        onValueChange,
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
    const texts = useMCommonTexts()
    const [internalCountry, setInternalCountry] = useState(defaultCountry.toUpperCase())
    const [internalValue, setInternalValue] = useState(() =>
        formatPostCode(defaultValue?.toString() ?? '', country ?? defaultCountry)
    )
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const [touched, setTouched] = useState(false)

    const currentCountry = (country ?? internalCountry).toUpperCase()
    const currentRule = useMemo(() => getPostCodeRule(currentCountry), [currentCountry])
    const currentValue = value !== undefined ? formatPostCode(value.toString(), currentCountry) : internalValue

    const runValidation = useCallback(
        (formattedValue: string, nextCountry: string) => {
            const result = validatePostCode(formattedValue, nextCountry)
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [onValidationChange]
    )

    // Keep the visible postal code aligned with the selected country rule.
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const formattedValue = formatPostCode(event.target.value, currentCountry)

            if (value === undefined) {
                setInternalValue(formattedValue)
            }

            onValueChange?.(formattedValue.replace(/\s|-/g, ''), formattedValue, currentCountry)

            if (validateOnChange && touched) {
                runValidation(formattedValue, currentCountry)
            }

            onChange?.(event)
        },
        [currentCountry, onChange, onValueChange, runValidation, touched, validateOnChange, value]
    )

    // Re-run validation after blur so the visible formatting and error state stay in sync.
    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)

            if (validateOnBlur && currentValue) {
                runValidation(currentValue, currentCountry)
            }

            onBlur?.(event)
        },
        [currentCountry, currentValue, onBlur, runValidation, validateOnBlur]
    )

    // Reset validation state alongside the value when the clear button fires.
    const handleClear = useCallback(() => {
        if (value === undefined) setInternalValue('')
        setValidation({valid: true})
        setTouched(false)
        onValidationChange?.({valid: true})
        onValueChange?.('', '', currentCountry)
        onClear?.()
    }, [onClear, onValidationChange, onValueChange, value, currentCountry])

    // Switch the formatter and validation rule whenever the selected country changes.
    const handleCountryChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const nextCountry = event.target.value.toUpperCase()
            const formattedValue = formatPostCode(currentValue, nextCountry)

            if (country === undefined) {
                setInternalCountry(nextCountry)
            }

            if (value === undefined) {
                setInternalValue(formattedValue)
            }

            onCountryChange?.(nextCountry)

            if (touched) {
                runValidation(formattedValue, nextCountry)
            }
        },
        [country, currentValue, onCountryChange, runValidation, touched, value]
    )

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)

    return (
        <MInputGroup
            {...rest}
            ref={ref}
            type="text"
            inputMode={currentRule.inputMode}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onClear={handleClear}
            error={isError}
            errorText={resolvedErrorText}
            helperText={resolvedErrorText ? undefined : (helperText ?? `Format: ${currentRule.example}`)}
            placeholder={selectableCountry ? currentRule.placeholder : (placeholder ?? currentRule.placeholder)}
            maxLength={currentRule.maxLength}
            disabled={disabled}
            prepend={
                selectableCountry ? (
                    <div className="country-select-wrap">
                        <select
                            className="country-select"
                            value={currentCountry}
                            onChange={handleCountryChange}
                            disabled={disabled}
                            aria-label={texts.postalCodeCountry}
                        >
                            {postCodeCountries.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.value}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    {type: 'text', content: currentCountry}
                )
            }
            className={cn('input-post-code', className)}
        />
    )
})
