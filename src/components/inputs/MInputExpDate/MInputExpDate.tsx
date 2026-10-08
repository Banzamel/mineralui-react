import {forwardRef, useCallback, useId, useMemo, useRef, useState} from 'react'
import type * as React from 'react'
import type {MInputExpDateProps} from './MInputExpDate.types'
import {cn} from '../../../utils/cn'
import {useControllableString} from '../../../utils/useControllableString'
import type {ValidationResult} from '../../../utils/validators'
import {MCloseIcon, MChevronDownIcon} from '../../../icons'
import {MPopover} from '../../primitives'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import '../MInput/MInput.css'
import '../../overlays/MDropdownMenu/MDropdownMenu.css'
import './MInputExpDate.css'
import {useMCommonTexts, useMInputTexts} from '../../../i18n/frameworkTexts'

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
    // `MM/YYYY`, `/YYYY` (year only) or `MM/` — the slash tells the segments apart,
    // so a year picked alone is not read back as month `20` + year `27`.
    const slash = value.indexOf('/')
    if (slash >= 0) {
        return {
            month: stripDigits(value.slice(0, slash)).slice(0, 2),
            year: stripDigits(value.slice(slash + 1)).slice(0, 4),
        }
    }

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

const MONTH_OPTIONS = Array.from({length: 12}, (_, index) => String(index + 1).padStart(2, '0'))

interface ExpDateSegmentProps {
    options: string[]
    value: string
    placeholder: string
    /** Accessible name of the picker ("Month" / "Year"). */
    name: string
    onSelect: (value: string) => void
    triggerRef: React.RefObject<HTMLDivElement | null>
    listRef: React.RefObject<HTMLDivElement | null>
}

/**
 * One segment (month or year) of the expiry date: a button that opens an APG single-select
 * listbox. The markup keeps the original `dropdown menu *` classes so the look does not change.
 */
function ExpDateSegment({options, value, placeholder, name, onSelect, triggerRef, listRef}: ExpDateSegmentProps) {
    const [open, setOpen] = useState(false)
    const baseId = useId()
    const listId = `${baseId}-listbox`
    const nameId = `${baseId}-name`
    const valueId = `${baseId}-value`
    const selectedIndex = options.indexOf(value)

    const choose = (option: string) => {
        onSelect(option)
        triggerRef.current?.focus()
        setOpen(false)
    }

    const nav = useKeyboardNav({
        itemCount: options.length,
        onSelect: (index) => choose(options[index]),
        onClose: () => setOpen(false),
        isOpen: open,
        mode: 'roving',
        selectOnSpace: true,
        loop: false,
        getItemLabel: (index) => options[index],
    })

    const openList = (index: number) => {
        nav.setActiveIndex(index)
        setOpen(true)
    }

    const handleTriggerClick = () => {
        if (open) {
            setOpen(false)
            return
        }
        openList(selectedIndex >= 0 ? selectedIndex : 0)
    }

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (open) return
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openList(selectedIndex >= 0 ? selectedIndex : 0)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            openList(selectedIndex >= 0 ? selectedIndex : options.length - 1)
        }
    }

    return (
        <div className="dropdown menu anchor">
            <div
                ref={triggerRef}
                className="dropdown menu trigger"
                role="button"
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-labelledby={`${nameId} ${valueId}`}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
                onKeyUp={(event) => {
                    // Firefox activates on Space keyup even when keydown was prevented.
                    if (event.key === ' ') event.preventDefault()
                }}
            >
                <span className={cn('input-exp-date-trigger', open && 'open', !value && 'placeholder')}>
                    <span id={nameId} className="input-exp-date-sr-only">
                        {name}
                    </span>
                    <span id={valueId}>{value || placeholder}</span>
                    <MChevronDownIcon size={16} aria-hidden="true" />
                </span>
            </div>
            <MPopover
                open={open}
                anchorRef={triggerRef}
                onClose={() => setOpen(false)}
                placement="bottom-start"
                className="dropdown menu popover input-exp-date-popover"
                role={null}
                initialFocus="first"
                closeOnTabOut
            >
                <div
                    ref={listRef}
                    id={listId}
                    className="dropdown menu list"
                    role="listbox"
                    aria-labelledby={nameId}
                    tabIndex={-1}
                    onKeyDown={nav.onKeyDown}
                >
                    {options.map((option, index) => {
                        const itemProps = nav.getItemProps(index)
                        const selected = option === value
                        return (
                            <button
                                key={option}
                                type="button"
                                id={itemProps.id}
                                ref={itemProps.ref}
                                tabIndex={itemProps.tabIndex}
                                onFocus={itemProps.onFocus}
                                role="option"
                                aria-selected={selected}
                                className={cn(
                                    'dropdown menu item',
                                    index === nav.activeIndex && 'active',
                                    selected && 'selected'
                                )}
                                onMouseEnter={() => {
                                    // Follow the pointer with real focus only while focus is already in the list.
                                    if (listRef.current?.contains(document.activeElement)) nav.focusItem(index)
                                    else nav.setActiveIndex(index)
                                }}
                                onClick={() => choose(option)}
                            >
                                <span className="dropdown menu label">{option}</span>
                            </button>
                        )
                    })}
                </div>
            </MPopover>
        </div>
    )
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
    const inputTexts = useMInputTexts()
    const inputRef = useRef<HTMLInputElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)
    const {currentValue, setCurrentValue} = useControllableString(value, defaultValue)
    const [validation, setValidation] = useState<ValidationResult>(OK)
    const [touched, setTouched] = useState(false)
    const [focused, setFocused] = useState(false)
    const monthTriggerRef = useRef<HTMLDivElement>(null)
    const yearTriggerRef = useRef<HTMLDivElement>(null)
    const monthListRef = useRef<HTMLDivElement>(null)
    const yearListRef = useRef<HTMLDivElement>(null)
    const labelId = `${useId()}-label`

    const {month, year} = parseValue(currentValue)
    const hasContent = Boolean(month || year)
    const segmentDisabled = disabled || readOnly
    const {resolvedMinYear, resolvedMaxYear} = resolveYearBounds(minYear, maxYear)
    const yearOptions = useMemo(
        () =>
            Array.from({length: resolvedMaxYear - resolvedMinYear + 1}, (_, index) => String(resolvedMinYear + index)),
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

    // Keyboard focus lands on the month picker; the native input is aria-hidden and only a form carrier.
    const focusField = useCallback(() => {
        const target =
            monthTriggerRef.current ?? (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
        target?.focus()
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

            // The listboxes render in a portal, so moving into them is still "inside" the field.
            if (
                nextTarget &&
                (rootRef.current?.contains(nextTarget) ||
                    monthListRef.current?.contains(nextTarget) ||
                    yearListRef.current?.contains(nextTarget))
            ) {
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
            updateValue(nextMonth, year)
        },
        [updateValue, year]
    )

    const handleSelectYear = useCallback(
        (nextYear: string) => {
            updateValue(month, nextYear)
        },
        [month, updateValue]
    )

    // A click on the empty part of the field focuses it; clicks on the pickers (including their
    // portalled listboxes, whose React events bubble here) are handled by the pickers themselves.
    const handleContainerClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as Node
            if (!event.currentTarget.contains(target)) return
            if (target instanceof Element && target.closest('.dropdown.menu.anchor')) return
            focusField()
        },
        [focusField]
    )

    const handleClear = useCallback(() => {
        syncValue('')
        setTouched(false)
        setValidation(OK)
        onValidationChange?.(OK)
        onClear?.()
        focusField()
    }, [focusField, onClear, onValidationChange, syncValue])

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

    const monthLabel = month || inputTexts.expMonthPlaceholder
    const yearLabel = year || inputTexts.expYearPlaceholder

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
                    id={labelId}
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

            <div className={containerClasses} onClick={handleContainerClick}>
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

                <div
                    className="input-exp-date-segments"
                    role="group"
                    aria-label={label ? undefined : texts.expirationDate}
                    aria-labelledby={label ? labelId : undefined}
                >
                    {segmentDisabled ? (
                        <span className={cn('input-exp-date-trigger', !month && 'placeholder', 'static')}>
                            <span>{monthLabel}</span>
                        </span>
                    ) : (
                        <ExpDateSegment
                            options={MONTH_OPTIONS}
                            value={month}
                            placeholder={inputTexts.expMonthPlaceholder}
                            name={inputTexts.expMonth}
                            onSelect={handleSelectMonth}
                            triggerRef={monthTriggerRef}
                            listRef={monthListRef}
                        />
                    )}

                    <span className="input-exp-date-separator" aria-hidden="true">
                        /
                    </span>

                    {segmentDisabled ? (
                        <span className={cn('input-exp-date-trigger', !year && 'placeholder', 'static')}>
                            <span>{yearLabel}</span>
                        </span>
                    ) : (
                        <ExpDateSegment
                            options={yearOptions}
                            value={year}
                            placeholder={inputTexts.expYearPlaceholder}
                            name={inputTexts.expYear}
                            onSelect={handleSelectYear}
                            triggerRef={yearTriggerRef}
                            listRef={yearListRef}
                        />
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
