import {forwardRef, useCallback, useRef, useState} from 'react'
import type * as React from 'react'
import type {MInputCreditCardProps} from './MInputCreditCard.types'
import {MInput} from '../MInput'
import {useFormatCaret} from '../MInput/useFormatCaret'
import {cn} from '../../../utils/cn'
import {detectCardBrand, formatCardNumber, stripCardNumber, validateCardNumber} from '../../../utils/creditCards'
import type {ValidationResult} from '../../../utils/validators'
import {MCheckIcon} from '../../../icons'
import './MInputCreditCard.css'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'

function CardBrandBadge({value}: {value: string}) {
    const brand = detectCardBrand(value)

    return <span className={cn('credit-card-brand-badge', 'credit-brand', brand.brand)}>{brand.iconLabel}</span>
}

// Extend the base input with payment card detection, formatting and checksum validation.
export const MInputCreditCard = forwardRef<HTMLInputElement, MInputCreditCardProps>(function MInputCreditCard(
    {
        validateOnBlur = true,
        validateOnChange = false,
        showBrandIcon = true,
        showValidIcon = true,
        onValidationChange,
        onCardBrandChange,
        onValueChange,
        onClear,
        value,
        defaultValue,
        onChange,
        onBlur,
        error,
        errorText,
        success,
        placeholder = '4242 4242 4242 4242',
        className,
        ...rest
    },
    ref
) {
    const [internalValue, setInternalValue] = useState(() => formatCardNumber(defaultValue?.toString() ?? ''))
    const [validation, setValidation] = useState<ValidationResult>({valid: true})
    const translateValidation = useMValidationMessage()
    const [touched, setTouched] = useState(false)

    const currentValue = value !== undefined ? formatCardNumber(value.toString()) : internalValue
    // Last brand reported to the consumer, so `onCardBrandChange` fires only on a change.
    const brandRef = useRef(detectCardBrand(currentValue).brand)
    const captureCaret = useFormatCaret()
    const runValidation = useCallback(
        (formattedValue: string) => {
            const result = translateValidation(validateCardNumber(formattedValue))
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [onValidationChange, translateValidation]
    )

    // Keep the visible card number grouped while exposing raw digits to the caller.
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            captureCaret(event)
            const formattedValue = formatCardNumber(event.target.value)
            const nextBrand = detectCardBrand(formattedValue)

            if (value === undefined) {
                setInternalValue(formattedValue)
            }

            if (nextBrand.brand !== brandRef.current) {
                brandRef.current = nextBrand.brand
                onCardBrandChange?.(nextBrand.brand)
            }
            onValueChange?.(stripCardNumber(formattedValue), formattedValue, nextBrand.brand)

            if (validateOnChange && touched) {
                runValidation(formattedValue)
            }

            onChange?.(event)
        },
        [captureCaret, onCardBrandChange, onChange, onValueChange, runValidation, touched, validateOnChange, value]
    )

    // Validate after the user leaves the field so checksum feedback stays predictable.
    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setTouched(true)

            if (validateOnBlur && currentValue) {
                runValidation(currentValue)
            }

            onBlur?.(event)
        },
        [currentValue, onBlur, runValidation, validateOnBlur]
    )

    // Reset validation state alongside the value when the clear button fires.
    const handleClear = useCallback(() => {
        if (value === undefined) setInternalValue('')
        setValidation({valid: true})
        setTouched(false)
        onValidationChange?.({valid: true})
        onValueChange?.('', '', 'unknown')
        if (brandRef.current !== 'unknown') {
            brandRef.current = 'unknown'
            onCardBrandChange?.('unknown')
        }
        onClear?.()
    }, [onCardBrandChange, onClear, onValidationChange, onValueChange, value])

    const isError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)
    const isSuccess =
        !isError && success !== undefined
            ? success
            : touched && validation.valid && stripCardNumber(currentValue).length > 0

    const validIcon =
        showValidIcon && isSuccess ? (
            <span className="credit valid validation-icon credit-card-valid-icon" aria-hidden="true">
                <MCheckIcon />
            </span>
        ) : undefined

    return (
        <MInput
            {...rest}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onClear={handleClear}
            error={isError}
            errorText={resolvedErrorText}
            success={isSuccess}
            placeholder={placeholder}
            startIcon={showBrandIcon ? <CardBrandBadge value={currentValue} /> : undefined}
            endIcon={validIcon}
            className={cn('credit-card input', className)}
        />
    )
})
