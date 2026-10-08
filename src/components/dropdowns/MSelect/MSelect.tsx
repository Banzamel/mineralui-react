import {useState, useRef, useCallback, useId, useMemo} from 'react'
import type * as React from 'react'
import type {MSelectProps, MSelectOption} from './MSelect.types'
import {MPopover} from '../../primitives'
import {cn} from '../../../utils/cn'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import {MSpinner, MTag} from '../../feedback'
import {MCheckIcon, MChevronDownIcon, MCloseIcon} from '../../../icons'
import './MSelect.css'
import {useMCommonTexts, useMSelectTexts} from '../../../i18n/frameworkTexts'

// Render a selectable list with optional search, grouping and multi-select tags.
export function MSelect({
    options,
    value,
    defaultValue,
    onChange,
    multiple = false,
    searchable = false,
    placeholder: placeholderProp,
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
    loading = false,
    clearable = false,
    maxHeight = 300,
    noOptionsText: noOptionsTextProp,
    renderOption,
    searchPlaceholder: searchPlaceholderProp,
    renderValue,
    className,
    style,
}: MSelectProps) {
    const texts = useMCommonTexts()
    const selectTexts = useMSelectTexts()
    const placeholder = placeholderProp ?? selectTexts.placeholder
    const noOptionsText = noOptionsTextProp ?? selectTexts.noOptions
    const searchPlaceholder = searchPlaceholderProp ?? selectTexts.searchPlaceholder
    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ''))
    const [search, setSearch] = useState('')
    const triggerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const currentValue = value !== undefined ? value : internalValue
    const hasError = error || !!errorText

    // Normalize the public value into a string array for rendering and selection logic.
    const selectedValues = useMemo(() => {
        if (Array.isArray(currentValue)) return currentValue
        return currentValue ? [currentValue] : []
    }, [currentValue])

    const selectedOptions = useMemo(
        () => options.filter((o) => selectedValues.includes(o.value)),
        [options, selectedValues]
    )

    // Filter options locally when the searchable mode is active.
    const filteredOptions = useMemo(() => {
        if (!searchable || !search) return options
        const lower = search.toLowerCase()
        return options.filter((o) => o.label.toLowerCase().includes(lower))
    }, [options, searchable, search])

    // Group options
    // Preserve group headers without changing the flat keyboard navigation index map.
    const groupedOptions = useMemo(() => {
        const groups = new Map<string, MSelectOption[]>()
        for (const opt of filteredOptions) {
            const key = opt.group ?? ''
            if (!groups.has(key)) groups.set(key, [])
            groups.get(key)!.push(opt)
        }
        return groups
    }, [filteredOptions])

    // Keyboard order must match the rendered (grouped) order. With interleaved groups
    // (A1, B1, A2) the DOM shows A1, A2, B1, so indexing the raw filtered list made the
    // arrows jump between groups.
    const flatFiltered = useMemo(() => [...groupedOptions.values()].flat(), [groupedOptions])

    // MToggle or replace the current selection depending on the mode.
    const handleSelect = useCallback(
        (index: number) => {
            const opt = flatFiltered[index]
            if (!opt || opt.disabled) return

            if (multiple) {
                const arr = Array.isArray(currentValue) ? currentValue : []
                const newVal = arr.includes(opt.value) ? arr.filter((v) => v !== opt.value) : [...arr, opt.value]
                if (value === undefined) setInternalValue(newVal)
                onChange?.(newVal)
            } else {
                if (value === undefined) setInternalValue(opt.value)
                onChange?.(opt.value)
                setOpen(false)
                setSearch('')
            }
        },
        [flatFiltered, multiple, currentValue, value, onChange]
    )

    const {activeIndex, setActiveIndex, resetIndex, onKeyDown} = useKeyboardNav({
        itemCount: flatFiltered.length,
        onSelect: handleSelect,
        onClose: () => {
            setOpen(false)
            setSearch('')
        },
        isOpen: open,
    })

    // APG select-only combobox: Enter, Space, ArrowDown / ArrowUp and Alt+ArrowDown open the list
    // from the closed trigger; once open the shared keyboard navigation takes over.
    const handleTriggerKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) return
            if (e.target !== e.currentTarget) return
            if (!open) {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    setOpen(true)
                    if (searchable || e.altKey) {
                        resetIndex()
                        return
                    }
                    const selectedIndex = flatFiltered.findIndex((o) => selectedValues.includes(o.value))
                    if (selectedIndex >= 0) setActiveIndex(selectedIndex)
                    else if (e.key === 'ArrowUp') setActiveIndex(flatFiltered.length - 1)
                    else setActiveIndex(flatFiltered.findIndex((o) => !o.disabled))
                }
                return
            }
            if (e.key === 'Tab') {
                setOpen(false)
                setSearch('')
                return
            }
            onKeyDown(e)
        },
        [disabled, open, searchable, flatFiltered, selectedValues, setActiveIndex, resetIndex, onKeyDown]
    )

    // The search field is an editable combobox: Home / End move the caret, everything else
    // (arrows, Enter, Escape) drives the listbox through aria-activedescendant.
    const handleSearchKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Home' || e.key === 'End') return
            onKeyDown(e)
        },
        [onKeyDown]
    )

    // Screen readers follow the highlighted option through aria-activedescendant.
    const baseId = useId()
    const labelId = `${baseId}-label`
    const listboxId = `${baseId}-listbox`
    const optionId = (index: number) => `${baseId}-option-${index}`
    const searchId = `${baseId}-search`
    const activeDescendant =
        open && activeIndex >= 0 && activeIndex < flatFiltered.length ? optionId(activeIndex) : undefined
    const hasListbox = flatFiltered.length > 0

    // Open the popover and reset keyboard navigation when the trigger is used.
    const handleTriggerClick = useCallback(() => {
        if (disabled) return
        setOpen((v) => !v)
        resetIndex()
    }, [disabled, resetIndex])

    // Reset the current selection without closing the outer field wrapper.
    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            const empty = multiple ? [] : ''
            if (value === undefined) setInternalValue(empty)
            onChange?.(empty)
        },
        [multiple, value, onChange]
    )

    // Render tags, labels or the placeholder based on the current selection state.
    const displayValue = useMemo(() => {
        if (renderValue && selectedOptions.length > 0) {
            return renderValue(multiple ? selectedOptions : selectedOptions[0])
        }
        if (multiple && selectedOptions.length > 0) {
            return (
                <span className="tags">
                    {selectedOptions.map((o) => (
                        <MTag key={o.value} label={o.label} color={color} size={size} variant="solid" />
                    ))}
                </span>
            )
        }
        if (!multiple && selectedOptions.length > 0) {
            return selectedOptions[0].label
        }
        return <span className="placeholder">{placeholder}</span>
    }, [selectedOptions, multiple, renderValue, placeholder, color, size])

    return (
        <div className={cn('select', color && `color-${color}`, fullWidth && 'full-width', className)} style={style}>
            {label && (
                <label
                    id={labelId}
                    htmlFor={id}
                    className={cn('field-label', open && 'focused', hasError && 'error', required && 'required')}
                >
                    {label}
                </label>
            )}

            <div
                ref={triggerRef}
                className={cn(
                    'trigger',
                    `field-${variant}`,
                    `field-${size}`,
                    open && 'focused',
                    hasError && 'error',
                    disabled && 'disabled'
                )}
                onClick={handleTriggerClick}
                onKeyDown={handleTriggerKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-controls={open && hasListbox ? listboxId : undefined}
                aria-activedescendant={searchable ? undefined : activeDescendant}
                aria-disabled={disabled || undefined}
                aria-labelledby={label ? labelId : undefined}
                aria-invalid={hasError || undefined}
                id={id}
            >
                <span className="value">{displayValue}</span>

                {loading && <MSpinner size="sm" color={color} />}

                {clearable && selectedValues.length > 0 && !loading && !disabled && (
                    <button
                        type="button"
                        className="clear-btn clear-btn-base"
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label={texts.clearSelection}
                    >
                        <MCloseIcon />
                    </button>
                )}

                <span className={cn('arrow', open && 'open')} aria-hidden="true">
                    <MChevronDownIcon />
                </span>
            </div>

            {/* Hidden input for form submission */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={Array.isArray(currentValue) ? currentValue.join(',') : currentValue}
                />
            )}

            <MPopover
                className={'select-popover'}
                open={open}
                anchorRef={triggerRef}
                onClose={() => {
                    setOpen(false)
                    setSearch('')
                }}
                matchWidth
                placement="bottom-start"
                role={null}
                initialFocus={searchable ? searchRef : undefined}
                closeOnTabOut={searchable}
            >
                <div style={{maxHeight}} className="dropdown">
                    {searchable && (
                        <div className="search-box">
                            <input
                                ref={searchRef}
                                id={searchId}
                                type="text"
                                className="search-input"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setActiveIndex(0)
                                }}
                                onKeyDown={handleSearchKeyDown}
                                role="combobox"
                                aria-expanded={hasListbox}
                                aria-controls={hasListbox ? listboxId : undefined}
                                aria-activedescendant={activeDescendant}
                                aria-autocomplete="list"
                                aria-labelledby={label ? labelId : undefined}
                                aria-label={label ? undefined : selectTexts.searchLabel}
                                autoComplete="off"
                                spellCheck={false}
                                autoFocus
                            />
                        </div>
                    )}

                    {flatFiltered.length === 0 ? (
                        <div className="no-options">{noOptionsText}</div>
                    ) : (
                        <div
                            id={listboxId}
                            className="options-list"
                            role="listbox"
                            aria-multiselectable={multiple || undefined}
                            aria-labelledby={label ? labelId : undefined}
                        >
                            {[...groupedOptions.entries()].map(([group, opts]) => (
                                <div key={group}>
                                    {group && <div className="group-header">{group}</div>}
                                    {opts.map((opt) => {
                                        const flatIndex = flatFiltered.indexOf(opt)
                                        const isActive = flatIndex === activeIndex
                                        const isSelected = selectedValues.includes(opt.value)
                                        return (
                                            <div
                                                key={opt.value}
                                                id={optionId(flatIndex)}
                                                className={cn(
                                                    'option',
                                                    isActive && 'active',
                                                    isSelected && 'selected',
                                                    opt.disabled && 'disabled'
                                                )}
                                                onClick={() => !opt.disabled && handleSelect(flatIndex)}
                                                onMouseEnter={() => setActiveIndex(flatIndex)}
                                                role="option"
                                                aria-selected={isSelected}
                                                aria-disabled={opt.disabled}
                                            >
                                                {/* Visual-only check: a real checkbox inside role="option"
                                                    would be a nested interactive control. */}
                                                {multiple && (
                                                    <span
                                                        className={cn(
                                                            'select-check',
                                                            color && `color-${color}`,
                                                            isSelected && 'checked'
                                                        )}
                                                        aria-hidden="true"
                                                    >
                                                        {isSelected && <MCheckIcon />}
                                                    </span>
                                                )}
                                                {renderOption ? renderOption(opt, isActive, isSelected) : opt.label}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
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
