import {useEffect, useId, useRef} from 'react'
import type * as React from 'react'
import {cn} from '../../../utils/cn'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'

/** Rows skipped by PageUp / PageDown inside a time column. */
const PAGE_STEP = 5

export interface TimeColumnListboxClassNames {
    column: string
    label: string
    list: string
    item: string
}

export interface TimeColumnListboxProps<T extends number | string> {
    items: T[]
    selected?: T
    onSelect: (value: T) => void
    isDisabled?: (value: T) => boolean
    label: string
    classNames: TimeColumnListboxClassNames
}

const renderValue = (value: number | string) => (typeof value === 'number' ? value.toString().padStart(2, '0') : value)

/**
 * Internal: one scrollable time column (hours, minutes, seconds or AM/PM) exposed as an APG
 * single-select listbox. The column is a single tab stop; ArrowUp / ArrowDown, Home / End and
 * PageUp / PageDown move focus, typing digits jumps to a value, Enter / Space select.
 */
export function TimeColumnListbox<T extends number | string>({
    items,
    selected,
    onSelect,
    isDisabled,
    label,
    classNames,
}: TimeColumnListboxProps<T>) {
    const listRef = useRef<HTMLDivElement>(null)
    const labelId = useId()
    const selectedIndex = selected === undefined ? -1 : items.indexOf(selected)

    const nav = useKeyboardNav({
        itemCount: items.length,
        onSelect: (index) => onSelect(items[index]),
        mode: 'roving',
        isItemDisabled: (index) => isDisabled?.(items[index]) ?? false,
        getItemLabel: (index) => String(renderValue(items[index])),
        selectOnSpace: true,
        loop: false,
        initialIndex: selectedIndex,
    })
    const {setActiveIndex, focusItem} = nav

    // Keep the roving tab stop on the selected value while the user is not inside the column.
    useEffect(() => {
        if (selectedIndex < 0) return
        const list = listRef.current
        if (list && list.contains(list.ownerDocument.activeElement)) return
        setActiveIndex(selectedIndex)
    }, [selectedIndex, setActiveIndex])

    // Keep the selected value centred in the column.
    useEffect(() => {
        if (selected === undefined || !listRef.current) return
        const element = listRef.current.querySelector(`[data-value="${selected}"]`) as HTMLElement | null
        if (element) {
            const list = listRef.current
            list.scrollTop = element.offsetTop - list.clientHeight / 2 + element.offsetHeight / 2
        }
    }, [selected])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'PageUp' || event.key === 'PageDown') {
            event.preventDefault()
            const direction = event.key === 'PageDown' ? 1 : -1
            const start = nav.activeIndex < 0 ? Math.max(selectedIndex, 0) : nav.activeIndex
            let target = Math.min(Math.max(start + direction * PAGE_STEP, 0), items.length - 1)
            // Land on the nearest available value in the direction of travel, then back off.
            while (target >= 0 && target < items.length && isDisabled?.(items[target])) target += direction
            if (target < 0 || target >= items.length) {
                target = Math.min(Math.max(start + direction * PAGE_STEP, 0), items.length - 1)
                while (target !== start && isDisabled?.(items[target])) target -= direction
            }
            focusItem(target)
            return
        }
        nav.onKeyDown(event)
    }

    return (
        <div className={classNames.column}>
            <div id={labelId} className={classNames.label}>
                {label}
            </div>
            <div
                ref={listRef}
                className={classNames.list}
                role="listbox"
                aria-labelledby={labelId}
                onKeyDown={handleKeyDown}
            >
                {items.map((item, index) => {
                    const disabled = isDisabled?.(item) ?? false
                    const isSelected = item === selected
                    const itemProps = nav.getItemProps(index)
                    return (
                        <button
                            key={item}
                            type="button"
                            data-value={item}
                            id={itemProps.id}
                            ref={itemProps.ref}
                            tabIndex={itemProps.tabIndex}
                            onFocus={itemProps.onFocus}
                            role="option"
                            aria-selected={isSelected}
                            className={cn(classNames.item, isSelected && 'selected', disabled && 'disabled')}
                            onClick={() => onSelect(item)}
                            disabled={disabled}
                        >
                            {renderValue(item)}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
