import {useState, useRef, useCallback, useMemo} from 'react'
import type * as React from 'react'
import type {MSelectProps, MSelectOption} from './MSelect.types'
import {MPopover} from '../../primitives'
import {cn} from '../../../utils/cn'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import {MCheckbox} from '../../controls'
import {MSpinner, MTag} from '../../feedback'
import {MChevronDownIcon, MCloseIcon} from '../../../icons'
import './MSelect.css'

// Render a selectable list with optional search, grouping and multi-select tags.
export function MSelect({
    options,
    value,
    defaultValue,
    onChange,
    multiple = false,
    searchable = false,
    placeholder = 'Select...',
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
    noOptionsText = 'No options',
    renderOption,
    searchPlaceholder = 'Search...',
    renderValue,
    className,
    style,
}: MSelectProps) {
    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ''))
    const [search, setSearch] = useState('')
    const triggerRef = useRef<HTMLDivElement>(null)

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

    const flatFiltered = filteredOptions

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
                onKeyDown={onKeyDown as unknown as React.KeyboardEventHandler}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
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
                        aria-label="Clear selection"
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
            >
                <div style={{maxHeight}} className="dropdown">
                    {searchable && (
                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setActiveIndex(0)
                                }}
                                onKeyDown={onKeyDown as unknown as React.KeyboardEventHandler}
                                autoFocus
                            />
                        </div>
                    )}

                    {flatFiltered.length === 0 ? (
                        <div className="no-options">{noOptionsText}</div>
                    ) : (
                        <div className="options-list" role="listbox">
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
                                                {multiple && (
                                                    <MCheckbox
                                                        checked={isSelected}
                                                        size="sm"
                                                        color={color}
                                                        clickEffect="none"
                                                        className="select-check"
                                                    />
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
