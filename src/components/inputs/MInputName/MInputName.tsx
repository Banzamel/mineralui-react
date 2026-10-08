import {useState, useCallback, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputNameProps} from './MInputName.types'
import {MInput} from '../MInput'
import {capitalizeWords} from '../../../utils/formatters'
import type {ValidationResult} from '../../../utils/validators'
import {MUserIcon} from '../../../icons'

// Extend the base input with name-friendly filtering and optional word-count validation.
export const MInputName = forwardRef<HTMLInputElement, MInputNameProps>(function MInputName(
    {
        autoCapitalize = true,
        allowNumbers = false,
        allowSpecialChars = false,
        minWords,
        validateOnBlur = true,
        onValidationChange,
        value,
        defaultValue,
        onChange,
        onBlur,
        error,
        errorText,
        placeholder = 'Jan Kowalski',
        ...rest
    },
    ref
) {
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const [touched, setTouched] = useState(false)

    const currentValue = value !== undefined ? value.toString() : internalValue

    // Normalize user input according to the configured name rules.
    const filterValue = useCallback(
        (raw: string): string => {
            let filtered = raw
            if (!allowNumbers) {
                filtered = filtered.replace(/\d/g, '')
            }
            if (!allowSpecialChars) {
                // Digits are governed by `allowNumbers` alone, so keep them here when allowed.
                filtered = allowNumbers
                    ? filtered.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]/g, '')
                    : filtered.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s'-]/g, '')
            }
            if (autoCapitalize) {
                filtered = capitalizeWords(filtered)
            }
            return filtered
        },
        [allowNumbers, allowSpecialChars, autoCapitalize]
    )

    // Store the filtered value while still delegating the original change event.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const filtered = filterValue(e.target.value)
            if (value === undefined) {
                setInternalValue(filtered)
            }
            onChange?.(e)
        },
        [onChange, value, filterValue]
    )

    // Validate the minimum word count after the user leaves the field.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)
            if (validateOnBlur && currentValue) {
                const words = currentValue.trim().split(/\s+/).filter(Boolean)
                if (minWords && words.length < minWords) {
                    const result: ValidationResult = {
                        valid: false,
                        error: `Enter at least ${minWords} word${minWords > 1 ? 's' : ''}`,
                    }
                    setValidation(result)
                    onValidationChange?.(result)
                } else {
                    const result: ValidationResult = {valid: true}
                    setValidation(result)
                    onValidationChange?.(result)
                }
            }
            onBlur?.(e)
        },
        [onBlur, validateOnBlur, currentValue, minWords, onValidationChange]
    )

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)

    return (
        <MInput
            {...rest}
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            error={isError}
            errorText={resolvedErrorText}
            placeholder={placeholder}
            startIcon={<MUserIcon />}
        />
    )
})
