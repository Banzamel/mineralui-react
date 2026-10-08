import {useState, useRef, useCallback, useEffect, forwardRef} from 'react'
import type * as React from 'react'
import type {MTextareaProps} from './MTextarea.types'
import {cn} from '../../../utils/cn'
import {useControllableString} from '../../../utils/useControllableString'
import {useGhostText} from '../../../utils/useGhostText'
import {MSpinner} from '../../feedback'
import './MTextarea.css'

// Render the multiline text input with optional auto-resize behavior.
export const MTextarea = forwardRef<HTMLTextAreaElement, MTextareaProps>(function MTextarea(
    {
        value,
        defaultValue,
        name,
        id,
        placeholder,
        disabled = false,
        readOnly = false,
        required = false,
        autoFocus = false,
        rows = 3,
        autoResize = false,
        minRows,
        maxRows,
        variant = 'outlined',
        size = 'md',
        color,
        fullWidth = false,
        label,
        helperText,
        errorText,
        error = false,
        success = false,
        maxLength,
        showCharCount = false,
        ghostOptions,
        ghostMinChars = 2,
        onGhostAccept,
        loading = false,
        onChange,
        onFocus,
        onBlur,
        className,
        style,
        textareaClassName,
        labelClassName,
    },
    ref
) {
    const [focused, setFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const {currentValue, setCurrentValue} = useControllableString(value, defaultValue)
    const ghost = useGhostText({
        options: ghostOptions ?? [],
        value: currentValue,
        minChars: ghostMinChars,
    })
    const hasError = error || !!errorText
    const resolvedColorClass = hasError ? 'color-error' : color ? `color-${color}` : undefined
    const resolvedRef = ref ?? textareaRef

    // Resize the textarea to fit content while respecting min and max row limits.
    const adjustHeight = useCallback(() => {
        const el = typeof resolvedRef === 'function' ? null : resolvedRef?.current
        if (!el || !autoResize) return

        el.style.height = 'auto'
        const computed = getComputedStyle(el)
        const lineHeight = parseFloat(computed.lineHeight) || 20
        // Row limits apply to the text area only — padding (and border for
        // border-box) sit on top so `maxRows` really shows that many lines.
        const padding = (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0)
        const border =
            computed.boxSizing === 'border-box'
                ? (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0)
                : 0
        const contentHeight = Math.max(el.scrollHeight - padding, 0)
        const minContent = minRows ? minRows * lineHeight : 0
        const maxContent = maxRows ? maxRows * lineHeight : Infinity
        const nextContent = Math.min(Math.max(contentHeight, minContent), maxContent)
        const extra = computed.boxSizing === 'border-box' ? padding + border : 0
        el.style.height = `${nextContent + extra}px`
        el.style.overflowY = contentHeight - nextContent > 1 ? 'auto' : 'hidden'
    }, [autoResize, minRows, maxRows, resolvedRef])

    useEffect(() => {
        adjustHeight()
    }, [currentValue, adjustHeight])

    // Mirror focus state so wrapper styling stays consistent with MInput.
    const handleFocus = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setFocused(true)
            onFocus?.(e)
        },
        [onFocus]
    )

    // Clear focus styling before delegating blur handling.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setFocused(false)
            onBlur?.(e)
        },
        [onBlur]
    )

    // Keep uncontrolled usage working without blocking controlled integrations.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCurrentValue(e.target.value)
            onChange?.(e)
            ghost.reset()
        },
        [onChange, setCurrentValue, ghost.reset]
    )

    // Intercept keyboard events for ghost text acceptance.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (ghostOptions && ghost.hint) {
                const accepted = ghost.onKeyDown(e)
                if (accepted) {
                    const result = ghost.accept()
                    setCurrentValue(result.value)
                    onGhostAccept?.(result.value)
                    const el = typeof resolvedRef === 'function' ? null : resolvedRef?.current
                    if (el) {
                        const nativeSet = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
                        nativeSet?.call(el, result.value)
                        el.dispatchEvent(new Event('input', {bubbles: true}))
                    }
                    return
                }
            }
        },
        [ghostOptions, ghost, setCurrentValue, onGhostAccept, resolvedRef]
    )

    const containerClasses = cn(
        'container',
        `field-${variant}`,
        `field-${size}`,
        focused && 'focused',
        hasError && 'error',
        success && !hasError && 'success',
        disabled && 'disabled'
    )

    return (
        <div className={cn('textarea', resolvedColorClass, fullWidth && 'full-width', className)} style={style}>
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

            <div className={containerClasses}>
                {ghostOptions ? (
                    <div className="ghost-text-field ghost-text-field-multi">
                        <textarea
                            ref={resolvedRef as React.Ref<HTMLTextAreaElement>}
                            name={name}
                            id={id}
                            placeholder={placeholder}
                            disabled={disabled}
                            readOnly={readOnly}
                            required={required}
                            autoFocus={autoFocus}
                            rows={autoResize ? (minRows ?? rows) : rows}
                            maxLength={maxLength}
                            value={currentValue}
                            className={cn('field', textareaClassName)}
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
                    <textarea
                        ref={resolvedRef as React.Ref<HTMLTextAreaElement>}
                        name={name}
                        id={id}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        required={required}
                        autoFocus={autoFocus}
                        rows={autoResize ? (minRows ?? rows) : rows}
                        maxLength={maxLength}
                        value={currentValue}
                        className={cn('field', textareaClassName)}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        aria-invalid={hasError || undefined}
                        aria-describedby={errorText ? `${id}-error` : helperText ? `${id}-helper` : undefined}
                    />
                )}
                {loading && <MSpinner size="sm" color={color} className="textarea-spinner" />}
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
