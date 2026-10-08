import {forwardRef, useCallback, useEffect, useId, useRef} from 'react'
import type * as React from 'react'
import type {MCheckboxProps} from './MCheckbox.types'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import './MCheckbox.css'

// Render a styled checkbox while keeping the native input for accessibility.
export const MCheckbox = forwardRef<HTMLInputElement, MCheckboxProps>(function MCheckbox(
    {
        checked,
        defaultChecked,
        indeterminate = false,
        name,
        id,
        value,
        disabled = false,
        size = 'md',
        color = 'primary',
        label,
        labelPosition = 'right',
        error = false,
        errorText,
        onChange,
        onIndeterminateChange,
        clickEffect = 'ripple',
        rippleColor,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledBy,
        className,
        style,
    },
    ref
) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const errorId = useId()
    // Keep a local handle for the indeterminate sync and still forward object or callback refs.
    const setInputRef = useCallback(
        (node: HTMLInputElement | null) => {
            inputRef.current = node
            if (typeof ref === 'function') {
                ref(node)
            } else if (ref) {
                ref.current = node
            }
        },
        [ref]
    )
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLSpanElement>({
        effect: clickEffect,
        disabled,
        centered: true,
        color: rippleColor,
    })

    // Keep the browser indeterminate flag in sync with the prop on every render: a click
    // clears the DOM flag, so re-applying only on prop changes let the two drift apart.
    useEffect(() => {
        if (inputRef.current && inputRef.current.indeterminate !== indeterminate) {
            inputRef.current.indeterminate = indeterminate
        }
    })

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        onChange?.(event)
        // The click already cleared the native flag; tell a controlled parent to drop it too.
        if (indeterminate) {
            onIndeterminateChange?.(false)
        }
    }

    const hasError = error || !!errorText

    return (
        <div className={cn('checkbox', className)} style={style}>
            <label className={cn('label', size, labelPosition === 'left' && 'label-left', disabled && 'disabled')}>
                <span
                    className={cn('box', `color-${color}`, hasError && 'error', effectClassName)}
                    onPointerDown={handlePointerDown}
                >
                    {effectLayer}
                    <input
                        ref={setInputRef}
                        type="checkbox"
                        checked={checked}
                        defaultChecked={defaultChecked}
                        name={name}
                        id={id}
                        value={value}
                        disabled={disabled}
                        onChange={handleChange}
                        onKeyDown={(event) => {
                            if (event.key === ' ' || event.key === 'Enter') {
                                triggerEffect(event.currentTarget.parentElement as HTMLSpanElement | null)
                            }
                        }}
                        className="input"
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledBy}
                        aria-invalid={hasError || undefined}
                        aria-describedby={errorText ? errorId : undefined}
                    />
                    <span className="check-mark" aria-hidden="true" />
                    <span className="indeterminate-mark" />
                </span>
                {label && <span className={cn('label-text', hasError && 'error')}>{label}</span>}
            </label>
            {errorText && (
                <span id={errorId} className="field-error" role="alert">
                    {errorText}
                </span>
            )}
        </div>
    )
})
