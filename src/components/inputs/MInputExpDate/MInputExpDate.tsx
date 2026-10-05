import {forwardRef, useCallback, useMemo, useRef, useState} from 'react'
import type * as React from 'react'
import type {MInputExpDateProps} from './MInputExpDate.types'
import {cn} from '../../../utils/cn'
import {useControllableString} from '../../../utils/useControllableString'
import type {ValidationResult} from '../../../utils/validators'
import {MCloseIcon, MChevronDownIcon} from '../../../icons'
import {MDropdownItem, MDropdownMenu} from '../../overlays'
import '../MInput/MInput.css'
import './MInputExpDate.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

const OK: ValidationResult = {valid: true}

function stripDigits(value: string) {
    return value.replace(/\D/g, '')
}

function padMonth(value?: string) {
    if (!value) {
        return ''
    }

    return value.padStart(2, '0').slice(0, 2)
}

function formatValue(month?: string, year?: string) {
    const resolvedMonth = padMonth(month)
    const resolvedYear = year?.slice(0, 4) ?? ''

    if (!resolvedMonth && !resolvedYear) {
        return ''
    }

    if (!resolvedYear) {
        return resolvedMonth
    }

    return `${resolvedMonth}/${resolvedYear}`
}

function parseValue(value: string) {
    const digits = stripDigits(value).slice(0, 6)

    return {
        month: digits.slice(0, 2),
        year: digits.slice(2, 6),
    }
}

function resolveYearBounds(minYear?: number, maxYear?: number) {
    const currentYear = new Date().getFullYear()
    const resolvedMinYear = Math.max(minYear ?? currentYear, currentYear)
    const resolvedMaxYear = Math.max(maxYear ?? currentYear + 20, resolvedMinYear)

    return {
        resolvedMinYear,
        resolvedMaxYear,
    }
}

function validateExpDate(
    value: string,
    {minYear, maxYear}: Pick<MInputExpDateProps, 'minYear' | 'maxYear'>
): ValidationResult {
    if (!value) {
        return OK
    }

    const {month: monthValue, year: yearValue} = parseValue(value)

    if (monthValue.length !== 2 || yearValue.length !== 4) {
        return {valid: false, error: 'Expiration date is incomplete'}
    }

    const month = parseInt(monthValue, 10)
    const year = parseInt(yearValue, 10)
    const {resolvedMinYear, resolvedMaxYear} = resolveYearBounds(minYear, maxYear)

    if (Number.isNaN(month) || month < 1 || month > 12) {
        return {valid: false, error: 'Use a valid month'}
    }

    if (Number.isNaN(year)) {
        return {valid: false, error: 'Use a valid year'}
    }

    if (year < resolvedMinYear) {
        return {valid: false, error: `Year must be ${resolvedMinYear} or later`}
    }

    if (year > resolvedMaxYear) {
        return {valid: false, error: `Year must be ${resolvedMaxYear} or earlier`}
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return {valid: false, error: 'Card has expired'}
    }

    return OK
}

export const MInputExpDate = forwardRef<HTMLInputElement, MInputExpDateProps>(function MInputExpDate(
    {
        validateOnBlur = true,
        validateOnChange = false,
        minYear,
        maxYear,
        onValidationChange,
        onValueChange,
        value,
        defaultValue,
        name,
        id,
        disabled = false,
        readOnly = false,
        required = false,
        autoFocus = false,
        variant = 'outlined',
        size = 'md',
        color,
        fullWidth = false,
        rounded = false,
        label,
        helperText,
        errorText,
        startIcon,
        endIcon,
        clearable = false,
        error = false,
        success,
        onChange,
        onFocus,
        onBlur,
        onClear,
        className,
        style,
        labelClassName,
    },
    ref
) {
    const texts = useMCommonTexts()
    const inputRef = useRef<HTMLInputElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const {currentValue, setCurrentValue} = useControllableString(value, defaultValue)
    const [validation, setValidation] = useState<ValidationResult>(OK)
    const [touched, setTouched] = useState(false)
    const [focused, setFocused] = useState(false)
    const [monthMenuOpen, setMonthMenuOpen] = useState(false)
    const [yearMenuOpen, setYearMenuOpen] = useState(false)

    const {month, year} = parseValue(currentValue)
    const hasContent = Boolean(month || year)
    const segmentDisabled = disabled || readOnly
    const {resolvedMinYear, resolvedMaxYear} = resolveYearBounds(minYear, maxYear)
    const yearOptions = useMemo(
        () => Array.from({length: resolvedMaxYear - resolvedMinYear + 1}, (_, index) => resolvedMinYear + index),
        [resolvedMaxYear, resolvedMinYear]
    )

    const runValidation = useCallback(
        (formattedValue: string) => {
            const result = validateExpDate(formattedValue, {minYear, maxYear})
            setValidation(result)
            onValidationChange?.(result)
            return result
        },
        [maxYear, minYear, onValidationChange]
    )

    const syncValue = useCallback(
        (formattedValue: string) => {
            setCurrentValue(formattedValue)
            onValueChange?.(stripDigits(formattedValue), formattedValue)

            const input = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
            if (input) {
                const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
                nativeSet?.call(input, formattedValue)
                input.dispatchEvent(new Event('input', {bubbles: true}))
            }
        },
        [onValueChange, ref, setCurrentValue]
    )

    const updateValue = useCallback(
        (nextMonth?: string, nextYear?: string) => {
            const formattedValue = formatValue(nextMonth, nextYear)
            syncValue(formattedValue)

            if (validateOnChange && touched) {
                runValidation(formattedValue)
            }
        },
        [runValidation, syncValue, touched, validateOnChange]
    )

    const focusHiddenInput = useCallback(() => {
        const input = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
        input?.focus()
    }, [ref])

    const handleRootFocus = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            if (focused) {
                return
            }

            setFocused(true)
            const input = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
            if (input && event.target !== input) {
                onFocus?.(event as unknown as React.FocusEvent<HTMLInputElement>)
            }
        },
        [focused, onFocus, ref]
    )

    const handleRootBlur = useCallback(
        (event: React.FocusEvent<HTMLDivElement>) => {
            const nextTarget = event.relatedTarget as Node | null

            if (nextTarget && rootRef.current?.contains(nextTarget)) {
                return
            }

            setFocused(false)
            setTouched(true)

            if (validateOnBlur && currentValue) {
                runValidation(currentValue)
            }

            onBlur?.(event as unknown as React.FocusEvent<HTMLInputElement>)
        },
        [currentValue, onBlur, runValidation, validateOnBlur]
    )

    const handleSelectMonth = useCallback(
        (nextMonth: string) => {
            focusHiddenInput()
            updateValue(nextMonth, year)
        },
        [focusHiddenInput, updateValue, year]
    )

    const handleSelectYear = useCallback(
        (nextYear: string) => {
            focusHiddenInput()
            updateValue(month, nextYear)
        },
        [focusHiddenInput, month, updateValue]
    )

    const handleClear = useCallback(() => {
        syncValue('')
        setTouched(false)
        setValidation(OK)
        onValidationChange?.(OK)
        onClear?.()
        focusHiddenInput()
    }, [focusHiddenInput, onClear, onValidationChange, syncValue])

    const hasError = error || (touched && !validation.valid)
    const resolvedErrorText = errorText || (touched && !validation.valid ? validation.error : undefined)
    const isSuccess =
        !hasError && (success !== undefined ? success : touched && validation.valid && Boolean(month && year))
    const resolvedColorClass = hasError ? 'color-error' : color ? `color-${color}` : undefined

    const containerClasses = cn(
        'container',
        `field-${variant}`,
        `field-${size}`,
        focused && 'focused',
        hasError && 'input-error',
        isSuccess && !hasError && 'input-success',
        resolvedColorClass,
        disabled && 'disabled',
        rounded && 'rounded'
    )

    const monthLabel = month || 'MM'
    const yearLabel = year || 'YYYY'

    return (
        <div
            ref={rootRef}
            className={cn('input', 'input-exp-date', resolvedColorClass, fullWidth && 'full-width', className)}
            style={style}
            onFocusCapture={handleRootFocus}
            onBlurCapture={handleRootBlur}
        >
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        'field-label',
                        focused && 'focused',
                        hasError && 'error',
                        isSuccess && !hasError && 'success',
                        required && 'required',
                        labelClassName
                    )}
                >
                    {label}
                </label>
            )}

            <div className={containerClasses} onClick={focusHiddenInput}>
                {startIcon && <span className="start-icon">{startIcon}</span>}

                <input
                    ref={ref ?? inputRef}
                    type="text"
                    value={currentValue}
                    name={name}
                    id={id}
                    readOnly
                    required={required}
                    autoFocus={autoFocus}
                    className="input-exp-date-native"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />

                <div className="input-exp-date-segments" aria-label={texts.expirationDate}>
                    {segmentDisabled ? (
                        <span className={cn('input-exp-date-trigger', !month && 'placeholder', 'static')}>
                            <span>{monthLabel}</span>
                        </span>
                    ) : (
                        <MDropdownMenu
                            trigger={
                                <span
                                    className={cn(
                                        'input-exp-date-trigger',
                                        monthMenuOpen && 'open',
                                        !month && 'placeholder'
                                    )}
                                    onMouseDown={focusHiddenInput}
                                >
                                    <span>{monthLabel}</span>
                                    <MChevronDownIcon size={16} />
                                </span>
                            }
                            openOn="click"
                            closeOnSelect
                            onOpenChange={setMonthMenuOpen}
                            popoverClassName="input-exp-date-popover"
                        >
                            {Array.from({length: 12}, (_, index) => {
                                const option = String(index + 1).padStart(2, '0')

                                return (
                                    <MDropdownItem
                                        key={option}
                                        label={option}
                                        active={month === option}
                                        onClick={() => handleSelectMonth(option)}
                                    />
                                )
                            })}
                        </MDropdownMenu>
                    )}

                    <span className="input-exp-date-separator">/</span>

                    {segmentDisabled ? (
                        <span className={cn('input-exp-date-trigger', !year && 'placeholder', 'static')}>
                            <span>{yearLabel}</span>
                        </span>
                    ) : (
                        <MDropdownMenu
                            trigger={
                                <span
                                    className={cn(
                                        'input-exp-date-trigger',
                                        yearMenuOpen && 'open',
                                        !year && 'placeholder'
                                    )}
                                    onMouseDown={focusHiddenInput}
                                >
                                    <span>{yearLabel}</span>
                                    <MChevronDownIcon size={16} />
                                </span>
                            }
                            openOn="click"
                            closeOnSelect
                            onOpenChange={setYearMenuOpen}
                            popoverClassName="input-exp-date-popover"
                        >
                            {yearOptions.map((option) => (
                                <MDropdownItem
                                    key={option}
                                    label={String(option)}
                                    active={year === String(option)}
                                    onClick={() => handleSelectYear(String(option))}
                                />
                            ))}
                        </MDropdownMenu>
                    )}
                </div>

                {clearable && hasContent && !segmentDisabled && (
                    <button
                        type="button"
                        className="clear-btn clear-btn-base"
                        onClick={(event) => {
                            event.stopPropagation()
                            handleClear()
                        }}
                        tabIndex={-1}
                        aria-label={texts.clearInput}
                    >
                        <MCloseIcon />
                    </button>
                )}

                {endIcon && <span className="end-icon">{endIcon}</span>}
            </div>

            {(resolvedErrorText || helperText) && (
                <div className="bottom-row">
                    <span>
                        {resolvedErrorText && (
                            <span id={id ? `${id}-error` : undefined} className="field-error" role="alert">
                                {resolvedErrorText}
                            </span>
                        )}
                        {!resolvedErrorText && helperText && (
                            <span id={id ? `${id}-helper` : undefined} className="field-helper">
                                {helperText}
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    )
})
