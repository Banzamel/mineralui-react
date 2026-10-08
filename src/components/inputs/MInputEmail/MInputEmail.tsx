import {useState, useCallback, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputEmailProps} from './MInputEmail.types'
import {MInput} from '../MInput'
import {validateEmail} from '../../../utils/validators'
import type {ValidationResult} from '../../../utils/validators'
import {MCheckIcon, MMailIcon} from '../../../icons'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'

// Extend the base input with email validation and optional success feedback.
export const MInputEmail = forwardRef<HTMLInputElement, MInputEmailProps>(function MInputEmail(
    {
        validateOnBlur = true,
        validateOnChange = false,
        showValidIcon = true,
        onValidationChange,
        value,
        defaultValue,
        onChange,
        onBlur,
        error,
        errorText,
        success,
        placeholder = 'email@example.com',
        ...rest
    },
    ref
) {
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)

    const currentValue = value !== undefined ? value.toString() : internalValue

    // Reuse the shared email validator and surface the latest result upstream.
    const runValidation = useCallback(
        (val: string) => {
            const result = translateValidation(validateEmail(val))
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [onValidationChange, translateValidation]
    )

    // Validate while typing only when the component is configured to do so.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === undefined) {
                setInternalValue(e.target.value)
            }
            if (validateOnChange && touched) {
                runValidation(e.target.value)
            }
            onChange?.(e)
        },
        [onChange, value, validateOnChange, touched, runValidation]
    )

    // Validate optional email input on blur once the user has interacted with it.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)
            if (validateOnBlur && e.target.value) {
                runValidation(e.target.value)
            }
            onBlur?.(e)
        },
        [onBlur, validateOnBlur, runValidation]
    )

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)
    const isSuccess =
        !isError && success !== undefined ? success : touched && validation.valid && currentValue.length > 0

    const validIcon =
        showValidIcon && isSuccess ? (
            <span className="validation-icon">
                <MCheckIcon />
            </span>
        ) : undefined

    return (
        <MInput
            {...rest}
            ref={ref}
            type="email"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            error={isError}
            errorText={resolvedErrorText}
            success={isSuccess}
            placeholder={placeholder}
            startIcon={<MMailIcon />}
            endIcon={validIcon}
        />
    )
})
