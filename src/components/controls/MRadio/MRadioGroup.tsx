import {useState, useCallback, useId, useMemo} from 'react'
import type {MRadioGroupProps} from './MRadio.types'
import {RadioContext} from './RadioContext'
import {cn} from '../../../utils/cn'
import './MRadio.css'

// Coordinate multiple radio items through shared context and optional controlled state.
export function MRadioGroup({
    name,
    value,
    defaultValue,
    onChange,
    direction = 'vertical',
    children,
    disabled = false,
    size = 'md',
    color = 'primary',
    error = false,
    errorText,
    label,
    className,
    style,
}: MRadioGroupProps) {
    const [internalValue, setInternalValue] = useState(defaultValue)
    const errorId = useId()
    const hasError = error || Boolean(errorText)
    const currentValue = value !== undefined ? value : internalValue

    // Mirror controlled and uncontrolled usage with the same group API.
    const handleChange = useCallback(
        (val: string) => {
            if (value === undefined) {
                setInternalValue(val)
            }
            onChange?.(val)
        },
        [onChange, value]
    )

    // Memoize context so nested radios only update when relevant inputs change.
    const ctx = useMemo(
        () => ({name, value: currentValue, disabled, size, color, onChange: handleChange}),
        [name, currentValue, disabled, size, color, handleChange]
    )

    return (
        <RadioContext.Provider value={ctx}>
            <fieldset
                className={cn('radio-group', direction, className)}
                style={style}
                role="radiogroup"
                aria-invalid={hasError || undefined}
                aria-describedby={errorText ? errorId : undefined}
            >
                {label && <legend className={cn('label', error && 'error')}>{label}</legend>}
                {children}
                {errorText && (
                    <span id={errorId} className="field-error" role="alert">
                        {errorText}
                    </span>
                )}
            </fieldset>
        </RadioContext.Provider>
    )
}
