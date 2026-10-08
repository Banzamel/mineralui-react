import {useState, useCallback, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputUrlProps} from './MInputUrl.types'
import {MInput} from '../MInput'
import {validateUrl} from '../../../utils/validators'
import type {ValidationResult} from '../../../utils/validators'
import {MCheckIcon, MLinkIcon} from '../../../icons'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'

const DEFAULT_PROTOCOLS = ['http', 'https']

// Extend the base input with URL validation, optional protocol whitelisting
// and an optional autoformatter that prepends the first allowed protocol on
// blur (so users can type `example.com` and walk away with `https://example.com`).
export const MInputUrl = forwardRef<HTMLInputElement, MInputUrlProps>(function MInputUrl(
    {
        protocols = DEFAULT_PROTOCOLS,
        requireProtocol = true,
        formatOnBlur = false,
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
        placeholder = 'https://example.com',
        ...rest
    },
    ref
) {
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)

    const currentValue = value !== undefined ? value.toString() : internalValue

    const runValidation = useCallback(
        (val: string) => {
            const result = translateValidation(validateUrl(val, {protocols, requireProtocol}))
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [protocols, requireProtocol, onValidationChange, translateValidation]
    )

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

    // On blur: optionally prepend the first allowed protocol when the value
    // has no scheme yet, then run validation against the (possibly rewritten)
    // value. The rewritten value is surfaced to consumers through a
    // synthesised `onChange` so controlled inputs stay in sync.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)

            let next = e.target.value
            const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(next)
            if (formatOnBlur && next && !hasScheme && protocols.length > 0) {
                next = `${protocols[0]}://${next}`
                if (value === undefined) {
                    setInternalValue(next)
                }
                // Re-use the same native input element so refs, names and
                // ids on the synthetic event still resolve to the real DOM.
                e.target.value = next
                onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>)
            }

            if (validateOnBlur && next) {
                runValidation(next)
            }
            onBlur?.(e)
        },
        [onBlur, validateOnBlur, runValidation, formatOnBlur, protocols, value, onChange]
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
            type="url"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            error={isError}
            errorText={resolvedErrorText}
            success={isSuccess}
            placeholder={placeholder}
            startIcon={<MLinkIcon />}
            endIcon={validIcon}
        />
    )
})
