import {forwardRef, useCallback, useId, useRef, useState} from 'react'
import type * as React from 'react'
import type {MInputProps} from './MInput.types'
import {cn} from '../../../utils/cn'
import {useControllableString} from '../../../utils/useControllableString'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {useGhostText} from '../../../utils/useGhostText'
import {MSpinner} from '../../feedback'
import {MCloseIcon} from '../../../icons'
import './MInput.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Render the base text input used by all specialized input wrappers.
export const MInput = forwardRef<HTMLInputElement, MInputProps>(function MInput(
    {
        type = 'text',
        value,
        defaultValue,
        name,
        id: idProp,
        placeholder,
        disabled = false,
        readOnly = false,
        required = false,
        autoFocus = false,
        autoComplete,
        inputMode,
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
        success = false,
        maxLength,
        showCharCount = false,
        onChange,
        onFocus,
        onBlur,
        onKeyDown,
        onClear,
        ghostOptions,
        ghostMinChars = 2,
        onGhostAccept,
        loading = false,
        clickEffect = 'ripple',
        rippleColor,
        className,
        style,
        inputClassName,
        labelClassName,
        inputProps,
    },
    ref
) {
    const texts = useMCommonTexts()
    // Fall back to a generated id so `label[for]` and `aria-describedby` always resolve.
    const generatedId = useId()
    const id = idProp ?? generatedId
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect,
        disabled: disabled || readOnly,
        color: rippleColor,
    })

    const {isControlled, currentValue, setCurrentValue} = useControllableString(value, defaultValue)
    const ghost = useGhostText({
        options: ghostOptions ?? [],
        value: currentValue,
        minChars: ghostMinChars,
    })
    const hasError = error || !!errorText
    const hasContent = currentValue.length > 0
    const resolvedColorClass = hasError ? 'color-error' : color ? `color-${color}` : undefined

    // Mirror focus state so the wrapper can style the input consistently.
    const handleFocus = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setFocused(true)
            onFocus?.(event)
        },
        [onFocus]
    )

    // Clear focus styles before delegating to the caller.
    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setFocused(false)
            onBlur?.(event)
        },
        [onBlur]
    )

    // Keep uncontrolled usage working without blocking controlled integrations.
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentValue(event.target.value)
            onChange?.(event)
            ghost.reset()
        },
        [onChange, setCurrentValue, ghost.reset]
    )

    // Intercept keyboard events for ghost text acceptance before delegating.
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (ghostOptions && ghost.hint) {
                const accepted = ghost.onKeyDown(event)
                if (accepted) {
                    const result = ghost.accept()
                    setCurrentValue(result.value)
                    onGhostAccept?.(result.value)
                    // Fire synthetic change so controlled parents stay in sync.
                    const input = (ref as React.RefObject<HTMLInputElement>)?.current ?? inputRef.current
                    if (input) {
                        const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
                        nativeSet?.call(input, result.value)
                        input.dispatchEvent(new Event('input', {bubbles: true}))
                    }
                    return
                }
            }
            onKeyDown?.(event)
        },
        [ghostOptions, ghost, setCurrentValue, onGhostAccept, onKeyDown, ref]
    )

    // Reset the visible value while preserving focus for quick repeated input.
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

    const containerClasses = cn(
        'container',
        `field-${variant}`,
        `field-${size}`,
        focused && 'focused',
        hasError && 'input-error',
        success && !hasError && 'input-success',
        resolvedColorClass,
        disabled && 'disabled',
        rounded && 'rounded',
        effectClassName
    )

    return (
        <div className={cn('input', resolvedColorClass, fullWidth && 'full-width', className)} style={style}>
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        'field-label',
                        focused && 'focused',
                        hasError && 'error',
                        success && !hasError && 'success',
                        required && 'required',
                        labelClassName
                    )}
                >
                    {label}
                </label>
            )}

            <div className={containerClasses} onPointerDown={handlePointerDown}>
                {effectLayer}
                {startIcon && <span className="start-icon">{startIcon}</span>}

                {ghostOptions ? (
                    <div className="ghost-text-field">
                        <input
                            {...inputProps}
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
                            autoComplete={autoComplete ?? 'off'}
                            inputMode={inputMode}
                            maxLength={maxLength}
                            className={cn('field', inputClassName)}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            aria-invalid={hasError || undefined}
                            aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                        />
                        {focused && ghost.hint && (
                            <span className="ghost-text-overlay" aria-hidden="true">
                                <span className="ghost-text-typed">{currentValue}</span>
                                <span className="ghost-text-hint">{ghost.hint}</span>
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        {...inputProps}
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
                )}

                {loading && <MSpinner size="sm" color={color} />}

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

                {endIcon && !loading && <span className="end-icon">{endIcon}</span>}
            </div>

            {(errorText || helperText || showCharCount) && (
                <div className="bottom-row">
                    <span>
                        {errorText && (
                            <span id={id ? `${id}-error` : undefined} className="field-error" role="alert">
                                {errorText}
                            </span>
                        )}
                        {!errorText && helperText && (
                            <span id={id ? `${id}-helper` : undefined} className="field-helper">
                                {helperText}
                            </span>
                        )}
                    </span>
                    {showCharCount && maxLength && (
                        <span className={cn('char-count', currentValue.length > maxLength && 'over')}>
                            {currentValue.length}/{maxLength}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
})
