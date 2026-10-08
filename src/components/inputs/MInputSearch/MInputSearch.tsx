import {useState, useCallback, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputSearchProps} from './MInputSearch.types'
import {MInput} from '../MInput'
import {useDebouncedCallback} from '../../../utils/useDebounce'
import {MSearchIcon} from '../../../icons'
import {useMInputTexts} from '../../../i18n/frameworkTexts'

// Extend the base input with debounced search callbacks and an inline clear action.
export const MInputSearch = forwardRef<HTMLInputElement, MInputSearchProps>(function MInputSearch(
    {
        debounceMs = 300,
        onSearch,
        value,
        defaultValue,
        onChange,
        onKeyDown,
        onClear,
        clearable = true,
        placeholder,
        ...rest
    },
    ref
) {
    const texts = useMInputTexts()
    const [internalValue, setInternalValue] = useState(defaultValue?.toString() ?? '')
    const currentValue = value !== undefined ? value.toString() : internalValue

    const debouncedSearch = useDebouncedCallback((val: string) => onSearch?.(val), debounceMs)

    // Update local state and debounce search notifications while typing.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === undefined) {
                setInternalValue(e.target.value)
            }
            debouncedSearch(e.target.value)
            onChange?.(e)
        },
        [onChange, value, debouncedSearch]
    )

    // Run search immediately when the user confirms with Enter.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                onSearch?.(currentValue)
            }
            onKeyDown?.(e)
        },
        [currentValue, onSearch, onKeyDown]
    )

    // Clear both the visible field and the emitted search query.
    const handleClear = useCallback(() => {
        if (value === undefined) {
            setInternalValue('')
        }
        onSearch?.('')
        onClear?.()
    }, [value, onSearch, onClear])

    return (
        <MInput
            {...rest}
            ref={ref}
            type="text"
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClear={handleClear}
            clearable={clearable}
            placeholder={placeholder ?? texts.searchPlaceholder}
            startIcon={<MSearchIcon />}
        />
    )
})
