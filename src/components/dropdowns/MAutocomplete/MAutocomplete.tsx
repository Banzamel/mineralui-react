import {useState, useRef, useCallback, useId, useMemo} from 'react'
import type * as React from 'react'
import type {MAutocompleteProps} from './MAutocomplete.types'
import {MPopover} from '../../primitives'
import {cn} from '../../../utils/cn'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import {useDebouncedCallback} from '../../../utils/useDebounce'
import {MSpinner, MTag} from '../../feedback'
import {MCloseIcon} from '../../../icons'
import './MAutocomplete.css'

// Resolve labels for primitive string options without extra configuration.
function defaultGetLabel<T>(option: T): string {
    if (typeof option === 'string') return option
    return String(option)
}

// Resolve values for primitive string options without extra configuration.
function defaultGetValue<T>(option: T): string {
    if (typeof option === 'string') return option
    return String(option)
}

// Apply a basic case-insensitive filter when the caller does not provide one.
function defaultFilter<T>(options: T[], input: string, getLabel: (o: T) => string): T[] {
    if (!input) return options
    const lower = input.toLowerCase()
    return options.filter((o) => getLabel(o).toLowerCase().includes(lower))
}

// Render a searchable suggestion list with optional multi-tag behavior.
export function MAutocomplete<T = string>({
    options,
    value,
    onChange,
    getOptionLabel = defaultGetLabel,
    getOptionValue = defaultGetValue,
    filterOptions,
    multiple = false,
    debounceMs = 0,
    onInputChange,
    loading = false,
    loadingText = 'Loading...',
    noOptionsText = 'No options',
    placeholder = 'Type to search...',
    disabled = false,
    name,
    id,
    variant = 'outlined',
    size = 'md',
    color,
    fullWidth = false,
    label,
    helperText,
    errorText,
    error = false,
    required = false,
    clearable = false,
    maxHeight = 300,
    renderOption,
    renderTags,
    className,
    style,
}: MAutocompleteProps<T>) {
    const baseId = useId()
    const texts = useMCommonTexts()
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const hasError = error || !!errorText

    // Normalize the public value into an array for tag and selection rendering.
    const selectedValues = useMemo(() => {
        if (value == null) return []
        return Array.isArray(value) ? value.filter((item) => item != null) : [value]
    }, [value])

    // Filter suggestions locally unless the caller owns that logic.
    const filtered = useMemo(() => {
        if (filterOptions) return filterOptions(options, inputValue)
        return defaultFilter(options, inputValue, getOptionLabel)
    }, [options, inputValue, filterOptions, getOptionLabel])

    const debouncedInputChange = useDebouncedCallback((val: string) => onInputChange?.(val), debounceMs)

    // Update the visible query and optionally notify async search logic.
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value)
            debouncedInputChange(e.target.value)
            if (!open) setOpen(true)
        },
        [open, debouncedInputChange]
    )

    // Apply a selected option to single or multiple value modes.
    const handleSelect = useCallback(
        (index: number) => {
            const opt = filtered[index]
            if (!opt) return

            if (multiple) {
                const arr = [...selectedValues]
                const val = getOptionValue(opt)
                const existIdx = arr.findIndex((v) => getOptionValue(v) === val)
                if (existIdx >= 0) {
                    arr.splice(existIdx, 1)
                } else {
                    arr.push(opt)
                }
                onChange?.(arr)
                setInputValue('')
                inputRef.current?.focus()
            } else {
                onChange?.(opt)
                setInputValue(getOptionLabel(opt))
                setOpen(false)
            }
        },
        [filtered, multiple, selectedValues, getOptionValue, getOptionLabel, onChange]
    )

    // Remove a selected tag by index in multiple mode.
    const handleRemoveTag = useCallback(
        (index: number) => {
            const arr = [...selectedValues]
            arr.splice(index, 1)
            onChange?.(multiple ? arr : (arr[0] ?? ('' as unknown as T)))
        },
        [selectedValues, onChange, multiple]
    )

    const {
        activeIndex,
        setActiveIndex,
        resetIndex,
        onKeyDown: navKeyDown,
    } = useKeyboardNav({
        itemCount: filtered.length,
        onSelect: handleSelect,
        onClose: () => setOpen(false),
        isOpen: open,
    })

    // Combine tag removal and list navigation.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Backspace removes last tag in multiple
            if (e.key === 'Backspace' && multiple && !inputValue && selectedValues.length > 0) {
                handleRemoveTag(selectedValues.length - 1)
                return
            }
            navKeyDown(e as unknown as React.KeyboardEvent)
        },
        [inputValue, multiple, selectedValues, navKeyDown, handleRemoveTag]
    )

    // Clear the input query and the selected value(s) together.
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            setInputValue('')
            onChange?.(multiple ? ([] as unknown as T) : ('' as unknown as T))
            inputRef.current?.focus()
        },
        [multiple, onChange]
    )

    // Screen readers follow the highlighted option through aria-activedescendant.
    const listboxId = `${baseId}-listbox`
    const optionId = (index: number) => `${baseId}-option-${index}`
    const activeDescendant =
        open && !loading && activeIndex >= 0 && activeIndex < filtered.length ? optionId(activeIndex) : undefined

    return (
        <div
            className={cn('autocomplete', color && `color-${color}`, fullWidth && 'full-width', className)}
            style={style}
        >
            {label && (
                <label
                    htmlFor={id}
                    className={cn('field-label', open && 'focused', hasError && 'error', required && 'required')}
                >
                    {label}
                </label>
            )}

            <div
                ref={wrapperRef}
                className={cn(
                    'input-wrapper',
                    `field-${variant}`,
                    `field-${size}`,
                    open && 'focused',
                    hasError && 'error',
                    disabled && 'disabled'
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {multiple &&
                    selectedValues.length > 0 &&
                    (renderTags ? (
                        renderTags(selectedValues, handleRemoveTag)
                    ) : (
                        <span className="tags">
                            {selectedValues.map((v, i) => (
                                <MTag
                                    key={getOptionValue(v)}
                                    label={getOptionLabel(v)}
                                    color={color}
                                    size={size}
                                    variant="solid"
                                    closable
                                    onClose={() => handleRemoveTag(i)}
                                />
                            ))}
                        </span>
                    ))}

                <input
                    ref={inputRef}
                    type="text"
                    className="input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setOpen(true)
                        resetIndex()
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedValues.length > 0 ? '' : placeholder}
                    disabled={disabled}
                    id={id}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-controls={open ? listboxId : undefined}
                    aria-activedescendant={activeDescendant}
                    aria-invalid={hasError || undefined}
                    autoComplete="off"
                />

                {loading && <MSpinner size="sm" color={color} />}

                {clearable && (selectedValues.length > 0 || inputValue) && !loading && !disabled && (
                    <button
                        type="button"
                        className="clear-btn clear-btn-base"
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label={texts.clearInput}
                    >
                        <MCloseIcon />
                    </button>
                )}
            </div>

            {name && <input type="hidden" name={name} value={selectedValues.map(getOptionValue).join(',')} />}

            <MPopover
                className={cn('autocomplete-popover', color && `color-${color}`)}
                open={open && (filtered.length > 0 || loading || !!inputValue)}
                anchorRef={wrapperRef}
                onClose={() => setOpen(false)}
                matchWidth
                placement="bottom-start"
            >
                <div style={{maxHeight}} className="dropdown">
                    {loading ? (
                        <div className="loading-msg">{loadingText}</div>
                    ) : filtered.length === 0 ? (
                        <div className="no-options">{noOptionsText}</div>
                    ) : (
                        <div id={listboxId} className="options-list" role="listbox">
                            {filtered.map((opt, i) => {
                                const isActive = i === activeIndex
                                const isSelected = selectedValues.some((v) => getOptionValue(v) === getOptionValue(opt))
                                return (
                                    <div
                                        key={getOptionValue(opt)}
                                        id={optionId(i)}
                                        className={cn('option', isActive && 'active', isSelected && 'selected')}
                                        onClick={() => handleSelect(i)}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        role="option"
                                        aria-selected={isSelected}
                                    >
                                        {renderOption ? renderOption(opt, isActive) : getOptionLabel(opt)}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </MPopover>

            {(errorText || helperText) && (
                <div className="bottom-row">
                    {errorText ? (
                        <span className="field-error" role="alert">
                            {errorText}
                        </span>
                    ) : (
                        <span className="helper-text">{helperText}</span>
                    )}
                </div>
            )}
        </div>
    )
}
