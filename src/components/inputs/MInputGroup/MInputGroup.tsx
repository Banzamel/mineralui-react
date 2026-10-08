import {useState, useRef, useCallback, forwardRef, isValidElement} from 'react'
import type * as React from 'react'
import type {MInputGroupProps, MInputGroupAddon, MInputGroupSlot} from './MInputGroup.types'
import {cn} from '../../../utils/cn'
import {useControllableString} from '../../../utils/useControllableString'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {MButton, MCheckbox} from '../../controls'
import {MSpinner} from '../../feedback'
import {MCloseIcon} from '../../../icons'
import './MInputGroup.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Detect structured addon configs while leaving raw React nodes untouched.
function isAddonObject(slot: MInputGroupSlot): slot is MInputGroupAddon {
    return typeof slot === 'object' && slot !== null && !isValidElement(slot) && 'type' in slot
}

// Render one prepend or append slot based on its declared addon type.
function renderSlot(slot: MInputGroupSlot, position: 'prepend' | 'append', index: number, color: string) {
    if (!isAddonObject(slot)) {
        return (
            <div key={`${position}-${index}`} className={cn('addon', 'custom', position)}>
                {slot}
            </div>
        )
    }

    const addon = slot

    if (addon.type === 'button') {
        return (
            <MButton
                key={`${position}-${index}`}
                variant="ghost"
                color={color as any}
                size="sm"
                className={cn('addon', position, 'addon-button')}
                onClick={addon.onClick}
                clickEffect="none"
            >
                {addon.content}
            </MButton>
        )
    }

    if (addon.type === 'checkbox') {
        return (
            <div key={`${position}-${index}`} className={cn('addon', position, 'checkbox')}>
                <MCheckbox
                    size="sm"
                    clickEffect="none"
                    checked={addon.checked}
                    onChange={(e) => addon.onCheckedChange?.(e.target.checked)}
                    className="addon-checkbox"
                />
            </div>
        )
    }

    // text or icon
    return (
        <span key={`${position}-${index}`} className={cn('addon', position)}>
            {addon.content}
        </span>
    )
}

// Normalize the public slot API to a flat array for predictable rendering.
function normalizeSlots(slots?: MInputGroupSlot | MInputGroupSlot[]): MInputGroupSlot[] {
    if (slots === undefined || slots === null) return []
    if (Array.isArray(slots)) return slots
    return [slots]
}

// Render a grouped input with prepend and append content around a shared field.
export const MInputGroup = forwardRef<HTMLInputElement, MInputGroupProps>(function MInputGroup(
    {
        prepend,
        append,
        type = 'text',
        value,
        defaultValue,
        name,
        id,
        placeholder,
        disabled = false,
        readOnly = false,
        required = false,
        autoFocus = false,
        autoComplete,
        inputMode,
        variant = 'outlined',
        size = 'md',
        fullWidth = false,
        label,
        helperText,
        errorText,
        color = 'primary',
        error = false,
        maxLength,
        clearable = false,
        onChange,
        onFocus,
        onBlur,
        onKeyDown,
        onClear,
        loading = false,
        clickEffect = 'ripple',
        rippleColor,
        className,
        style,
        inputClassName,
        labelClassName,
    },
    ref
) {
    const texts = useMCommonTexts()
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect,
        disabled: disabled || readOnly,
        color: rippleColor,
    })

    const hasError = error || !!errorText
    const resolvedColorClass = hasError ? 'color-error' : `color-${color}`
    const {currentValue, setCurrentValue} = useControllableString(value, defaultValue)
    const hasContent = currentValue.length > 0

    // Mirror focus state so the wrapper can style the group consistently.
    const handleFocus = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(true)
            onFocus?.(e)
        },
        [onFocus]
    )

    // Clear wrapper focus styling before delegating blur handling.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(false)
            onBlur?.(e)
        },
        [onBlur]
    )

    // Keep uncontrolled usage working without blocking controlled integrations.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentValue(e.target.value)
            onChange?.(e)
        },
        [onChange, setCurrentValue]
    )

    // Reset the field value while preserving focus and controlled integrations.
    const handleClear = useCallback(() => {
        setCurrentValue('')

        const input = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
        if (input) {
            const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
            nativeSet?.call(input, '')
            input.dispatchEvent(new Event('input', {bubbles: true}))
        }

        onClear?.()
        input?.focus()
    }, [onClear, ref, setCurrentValue])

    const prependSlots = normalizeSlots(prepend)
    const appendSlots = normalizeSlots(append)

    return (
        <div className={cn('input-group', resolvedColorClass, fullWidth && 'full-width', className)} style={style}>
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        'field-label',
                        focused && 'focused',
                        hasError && 'error',
                        required && 'required',
                        labelClassName
                    )}
                >
                    {label}
                </label>
            )}

            <div
                className={cn(
                    'container',
                    `field-${variant}`,
                    `field-${size}`,
                    focused && 'focused',
                    hasError && 'has-error',
                    disabled && 'disabled',
                    effectClassName
                )}
                onPointerDown={handlePointerDown}
            >
                {effectLayer}
                {prependSlots.map((slot, i) => renderSlot(slot, 'prepend', i, color))}

                <input
                    ref={ref ?? inputRef}
                    type={type}
                    value={currentValue}
                    name={name}
                    id={id}
                    placeholder={placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    maxLength={maxLength}
                    className={cn('field', inputClassName)}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={onKeyDown}
                    aria-invalid={hasError || undefined}
                    aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                />

                {loading && (
                    <span className={'spinner-addon'}>
                        <MSpinner size="sm" color={color} />
                    </span>
                )}

                {clearable && hasContent && !loading && !disabled && !readOnly && (
                    <button
                        type="button"
                        className="clear-btn clear-btn-base"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label={texts.clearInput}
                    >
                        <MCloseIcon />
                    </button>
                )}

                {appendSlots.map((slot, i) => renderSlot(slot, 'append', i, color))}
            </div>

            {(errorText || helperText) && (
                <div className={'bottom'}>
                    {errorText && (
                        <span id={id ? `${id}-error` : undefined} className={'field-error'} role="alert">
                            {errorText}
                        </span>
                    )}
                    {!errorText && helperText && (
                        <span id={id ? `${id}-helper` : undefined} className={'field-helper'}>
                            {helperText}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
})
