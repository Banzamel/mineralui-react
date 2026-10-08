import {useState, useCallback, useEffect, useRef, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputDateProps} from './MInputDate.types'
import {MInput} from '../MInput'
import {stripNonDigits, formatDateInput} from '../../../utils/formatters'
import {validateDate, parseDateString} from '../../../utils/validators'
import type {ValidationResult} from '../../../utils/validators'
import {MCalendarIcon} from '../../../icons'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'

const FORMAT_PLACEHOLDER: Record<string, string> = {
    'DD/MM/YYYY': 'DD{s}MM{s}YYYY',
    'MM/DD/YYYY': 'MM{s}DD{s}YYYY',
    'YYYY/MM/DD': 'YYYY{s}MM{s}DD',
}

// Specialized date input with auto-formatting, parsing and validation.
// Displays in DD/MM/YYYY (or other format) and emits a Date object.
export const MInputDate = forwardRef<HTMLInputElement, MInputDateProps>(function MInputDate(
    {
        format = 'DD/MM/YYYY',
        separator = '/',
        minDate,
        maxDate,
        validateOnBlur = true,
        validateOnChange = false,
        onDateChange,
        onValidationChange,
        value,
        defaultValue,
        onChange,
        onBlur,
        onKeyDown,
        onClear,
        error,
        errorText,
        placeholder,
        className,
        ...rest
    },
    ref
) {
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)
    const internalChangeRef = useRef(false)

    const currentValue = value !== undefined ? value.toString() : internalValue

    useEffect(() => {
        if (internalChangeRef.current) {
            internalChangeRef.current = false
            return
        }

        if (!currentValue) {
            setValidation({valid: true})
            setTouched(false)
            return
        }

        setValidation(translateValidation(validateDate(currentValue, {format, minDate, maxDate})))
    }, [currentValue, format, maxDate, minDate, translateValidation])

    const runValidation = useCallback(
        (val: string) => {
            const result = translateValidation(validateDate(val, {format, minDate, maxDate}))
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [format, minDate, maxDate, onValidationChange, translateValidation]
    )

    const emitDate = useCallback(
        (formatted: string) => {
            const digits = stripNonDigits(formatted)
            if (digits.length === 8) {
                onDateChange?.(parseDateString(formatted, format), formatted)
            } else {
                onDateChange?.(null, formatted)
            }
        },
        [format, onDateChange]
    )

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const digits = stripNonDigits(e.target.value)
            if (digits.length > 8) return

            const formatted = formatDateInput(digits, format, separator)
            internalChangeRef.current = true

            if (value === undefined) {
                setInternalValue(formatted)
            }

            emitDate(formatted)

            if (validateOnChange && touched) {
                runValidation(formatted)
            }

            onChange?.(e)
        },
        [onChange, value, format, separator, validateOnChange, touched, runValidation, emitDate]
    )

    const handleClear = useCallback(() => {
        internalChangeRef.current = true
        if (value === undefined) {
            setInternalValue('')
        }
        setValidation({valid: true})
        setTouched(false)
        onDateChange?.(null, '')
        onClear?.()
    }, [value, onDateChange, onClear])

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)
            if (validateOnBlur && currentValue) {
                runValidation(currentValue)
            }
            onBlur?.(e)
        },
        [onBlur, validateOnBlur, currentValue, runValidation]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                onKeyDown?.(e)
                return
            }
            if (e.ctrlKey || e.metaKey) {
                onKeyDown?.(e)
                return
            }
            // Only printable characters are filtered — Enter, Escape and other
            // named keys keep working (e.g. submitting the surrounding form).
            if (e.key.length === 1 && !/^\d$/.test(e.key)) {
                e.preventDefault()
            }
            onKeyDown?.(e)
        },
        [onKeyDown]
    )

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)

    return (
        <MInput
            {...rest}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClear={handleClear}
            error={isError}
            errorText={resolvedErrorText}
            placeholder={placeholder ?? FORMAT_PLACEHOLDER[format].replace(/\{s\}/g, separator)}
            startIcon={<MCalendarIcon />}
            maxLength={10}
            className={className}
        />
    )
})
