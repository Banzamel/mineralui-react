import {useCallback, useId, useMemo, useRef, useState} from 'react'
import type * as React from 'react'
import type {MDataTableProps, MDataTableSort} from './MDataTable.types'
import {MButton, MCheckbox} from '../../controls'
import {MInputSearch} from '../../inputs'
import {MPagination} from '../../layout'
import {MPopover} from '../../primitives'
import {MLoader} from '../../feedback'
import {MArrowDownIcon, MArrowUpDownIcon, MArrowUpIcon, MFilterIcon, MSortIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import {formatMText, useMCommonTexts, useMDataTableTexts, useMDataViewTexts} from '../../../i18n/frameworkTexts'
import './MDataTable.css'

function getRowKey<T>(row: T, index: number, rowKey?: string | ((row: T, index: number) => string)): string {
    if (typeof rowKey === 'function') return rowKey(row, index)
    if (typeof rowKey === 'string') return String((row as any)[rowKey])
    return String((row as any).id ?? index)
}

function getNestedValue(obj: unknown, key: string): unknown {
    const parts = key.split('.')
    let val: unknown = obj

    for (const p of parts) {
        if (val == null || typeof val !== 'object') return undefined
        val = (val as Record<string, unknown>)[p]
    }

    return val
}

export function MDataTable<T = any>({
    columns,
    data,
    rowKey,
    sortable = false,
    filterable = false,
    selectable = false,
    pagination = false,
    pageSize = 10,
    striped = false,
    compact = false,
    stickyHeader = false,
    loading = false,
    loadingLabel,
    scrollOffset,
    sort: controlledSort,
    onSortChange,
    search: controlledSearch,
    onSearchChange,
    searchKeys,
    filterKeys = [],
    filters: controlledFilters,
    onFiltersChange,
    sortKeys = [],
    page: controlledPage,
    onPageChange,
    total,
    manualSearch = false,
    manualFilters = false,
    manualSort = false,
    manualPagination = false,
    selectedKeys: controlledSelected,
    onSelectionChange,
    emptyText,
    filterPlaceholder,
    className,
    style,
    ...rest
}: MDataTableProps<T>) {
    const commonTexts = useMCommonTexts()
    const viewTexts = useMDataViewTexts()
    const tableTexts = useMDataTableTexts()
    const [internalSort, setInternalSort] = useState<MDataTableSort | null>(null)
    const [internalSelected, setInternalSelected] = useState<string[]>([])
    const [internalSearch, setInternalSearch] = useState('')
    const [internalFilters, setInternalFilters] = useState<Record<string, string[]>>({})
    const [internalPage, setInternalPage] = useState(1)
    const [filterOpen, setFilterOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)
    const filterBtnRef = useRef<HTMLElement>(null)
    const sortBtnRef = useRef<HTMLElement>(null)
    const toolbarId = useId()
    const filterPopoverId = `${toolbarId}-filter`
    const sortPopoverId = `${toolbarId}-sort`

    const activeSort = controlledSort !== undefined ? controlledSort : internalSort
    const search = controlledSearch !== undefined ? controlledSearch : internalSearch
    const filters = controlledFilters !== undefined ? controlledFilters : internalFilters
    const page = controlledPage !== undefined ? controlledPage : internalPage
    const selected = controlledSelected ?? internalSelected
    const setSelected = onSelectionChange ?? setInternalSelected

    const setSearch = useCallback(
        (next: string) => {
            if (controlledSearch === undefined) setInternalSearch(next)
            if (!manualPagination && controlledPage === undefined) setInternalPage(1)
            onSearchChange?.(next)
        },
        [controlledSearch, controlledPage, manualPagination, onSearchChange]
    )

    const setFilters = useCallback(
        (next: Record<string, string[]>) => {
            if (controlledFilters === undefined) setInternalFilters(next)
            if (!manualPagination && controlledPage === undefined) setInternalPage(1)
            onFiltersChange?.(next)
        },
        [controlledFilters, controlledPage, manualPagination, onFiltersChange]
    )

    const setSort = useCallback(
        (next: MDataTableSort | null) => {
            if (controlledSort === undefined) setInternalSort(next)
            if (!manualPagination && controlledPage === undefined) setInternalPage(1)
            onSortChange?.(next)
        },
        [controlledSort, controlledPage, manualPagination, onSortChange]
    )

    const rootRef = useRef<HTMLDivElement>(null)

    const setPage = useCallback(
        (next: number) => {
            if (controlledPage === undefined) setInternalPage(next)
            onPageChange?.(next)
            // After page change, bring the top of the table back into view so
            // the user does not stay scrolled deep into the previous page's rows.
            rootRef.current?.scrollIntoView({block: 'start', behavior: 'smooth'})
        },
        [controlledPage, onPageChange]
    )

    function handleSort(key: string) {
        let next: MDataTableSort | null

        if (activeSort?.key === key) {
            next = activeSort.dir === 'asc' ? {key, dir: 'desc'} : null
        } else {
            next = {key, dir: 'asc'}
        }

        setSort(next)
    }

    function toggleFilterValue(key: string, value: string) {
        const current = filters[key] ?? []
        const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
        setFilters({...filters, [key]: next})
    }

    const filterOptions = useMemo(() => {
        const map: Record<string, string[]> = {}

        for (const filterKey of filterKeys) {
            if (filterKey.options) {
                map[filterKey.key] = filterKey.options
                continue
            }

            const values = new Set<string>()

            for (const row of data) {
                const value = getNestedValue(row, filterKey.key)
                if (value != null) values.add(String(value))
            }

            map[filterKey.key] = Array.from(values).sort()
        }

        return map
    }, [data, filterKeys])

    const filtered = useMemo(() => {
        let result: T[] = data

        if (!manualSearch && filterable && search.trim()) {
            const query = search.toLowerCase()

            if (searchKeys && searchKeys.length > 0) {
                result = result.filter((row) =>
                    searchKeys.some((key) => {
                        const value = getNestedValue(row, key)
                        return value != null && String(value).toLowerCase().includes(query)
                    })
                )
            } else {
                result = result.filter((row) =>
                    columns.some((col) => {
                        if (col.filterable === false) return false
                        const value = (row as any)[col.key]
                        return value != null && String(value).toLowerCase().includes(query)
                    })
                )
            }
        }

        if (!manualFilters) {
            for (const [key, selectedValues] of Object.entries(filters)) {
                if (!selectedValues || selectedValues.length === 0) continue

                result = result.filter((row) => {
                    const value = getNestedValue(row, key)
                    return value != null && selectedValues.includes(String(value))
                })
            }
        }

        return result
    }, [data, manualSearch, manualFilters, filterable, search, searchKeys, columns, filters])

    const sorted = useMemo(() => {
        if (manualSort || !activeSort) return filtered

        const col = columns.find((item) => item.key === activeSort.key)
        const sortKeyAllowed = sortKeys.some((item) => item.key === activeSort.key)
        if (!col?.sortable && !sortable && !sortKeyAllowed) return filtered

        const dir = activeSort.dir === 'asc' ? 1 : -1

        return [...filtered].sort((a, b) => {
            const va = (a as any)[activeSort.key]
            const vb = (b as any)[activeSort.key]

            if (va == null && vb == null) return 0
            if (va == null) return 1
            if (vb == null) return -1
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir

            return String(va).localeCompare(String(vb)) * dir
        })
    }, [filtered, activeSort, columns, sortable, sortKeys, manualSort])

    const totalItems = manualPagination ? (total ?? sorted.length) : sorted.length
    const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1
    const pageData = useMemo(() => {
        if (!pagination || manualPagination) return sorted
        const start = (page - 1) * pageSize
        return sorted.slice(start, start + pageSize)
    }, [sorted, pagination, manualPagination, page, pageSize])

    const allKeys = pageData.map((row, index) => getRowKey(row, (page - 1) * pageSize + index, rowKey))
    const allSelected = allKeys.length > 0 && allKeys.every((key) => selected.includes(key))

    function toggleAll() {
        if (allSelected) {
            setSelected(selected.filter((key) => !allKeys.includes(key)))
        } else {
            setSelected([...new Set([...selected, ...allKeys])])
        }
    }

    function toggleRow(key: string) {
        setSelected(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key])
    }

    function handleRowClick(key: string, event: React.MouseEvent) {
        const target = event.target as HTMLElement
        if (target.closest('button, a, [data-no-row-select]')) return
        toggleRow(key)
    }

    const openFilter = useCallback(() => {
        setFilterOpen((v) => !v)
        setSortOpen(false)
    }, [])

    const openSort = useCallback(() => {
        setSortOpen((v) => !v)
        setFilterOpen(false)
    }, [])

    const activeSortMenuItem = sortKeys.find((item) => item.key === activeSort?.key)
    const showToolbar = filterable || filterKeys.length > 0 || sortKeys.length > 0

    return (
        <div
            ref={rootRef}
            className={cn('data-table', className)}
            style={scrollOffset !== undefined ? {scrollMarginTop: scrollOffset, ...style} : style}
            {...rest}
        >
            {showToolbar && (
                <div className="toolbar">
                    {filterable && (
                        <MInputSearch
                            className="filter-search"
                            size="sm"
                            fullWidth
                            placeholder={filterPlaceholder ?? viewTexts.searchPlaceholder}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onClear={() => setSearch('')}
                        />
                    )}

                    {(filterKeys.length > 0 || sortKeys.length > 0) && (
                        <div className="toolbar-actions">
                            {filterKeys.length > 0 && (
                                <>
                                    <MButton
                                        ref={filterBtnRef}
                                        variant="outlined"
                                        size="sm"
                                        startIcon={<MFilterIcon />}
                                        aria-haspopup="dialog"
                                        aria-expanded={filterOpen}
                                        aria-controls={filterOpen ? filterPopoverId : undefined}
                                        onClick={openFilter}
                                    >
                                        {viewTexts.filter}
                                    </MButton>
                                    <MPopover
                                        open={filterOpen}
                                        anchorRef={filterBtnRef}
                                        onClose={() => setFilterOpen(false)}
                                        placement="bottom-end"
                                        role="dialog"
                                        id={filterPopoverId}
                                        aria-label={viewTexts.filter}
                                        initialFocus="first"
                                        closeOnTabOut
                                        className="data-table-dropdown"
                                    >
                                        {filterKeys.map((filterKey, groupIndex) => (
                                            <div
                                                key={filterKey.key}
                                                className="data-table-filter-group"
                                                role="group"
                                                aria-labelledby={`${filterPopoverId}-group-${groupIndex}`}
                                            >
                                                <span
                                                    id={`${filterPopoverId}-group-${groupIndex}`}
                                                    className="data-table-filter-label"
                                                >
                                                    {filterKey.label}
                                                </span>
                                                {(filterOptions[filterKey.key] ?? []).map((option) => (
                                                    <div key={option} className="data-table-filter-option">
                                                        <MCheckbox
                                                            size="sm"
                                                            clickEffect="none"
                                                            checked={filters[filterKey.key]?.includes(option) ?? false}
                                                            onChange={() => toggleFilterValue(filterKey.key, option)}
                                                            label={option}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </MPopover>
                                </>
                            )}

                            {sortKeys.length > 0 && (
                                <>
                                    <MButton
                                        ref={sortBtnRef}
                                        variant="outlined"
                                        size="sm"
                                        startIcon={
                                            activeSort ? (
                                                activeSort.dir === 'asc' ? (
                                                    <MArrowUpIcon />
                                                ) : (
                                                    <MArrowDownIcon />
                                                )
                                            ) : (
                                                <MSortIcon />
                                            )
                                        }
                                        aria-haspopup="dialog"
                                        aria-expanded={sortOpen}
                                        aria-controls={sortOpen ? sortPopoverId : undefined}
                                        onClick={openSort}
                                    >
                                        {activeSortMenuItem
                                            ? formatMText(viewTexts.sortBy, {label: activeSortMenuItem.label})
                                            : viewTexts.sort}
                                        {activeSortMenuItem && activeSort && (
                                            <span className="data-table-sr-only">
                                                {', '}
                                                {activeSort.dir === 'asc'
                                                    ? viewTexts.sortAscending
                                                    : viewTexts.sortDescending}
                                            </span>
                                        )}
                                    </MButton>
                                    <MPopover
                                        open={sortOpen}
                                        anchorRef={sortBtnRef}
                                        onClose={() => setSortOpen(false)}
                                        placement="bottom-end"
                                        role="dialog"
                                        id={sortPopoverId}
                                        aria-label={viewTexts.sort}
                                        initialFocus="first"
                                        closeOnTabOut
                                        className="data-table-dropdown"
                                    >
                                        {sortKeys.map((sortItem) => (
                                            <button
                                                key={sortItem.key}
                                                type="button"
                                                className={cn(
                                                    'data-table-sort-item',
                                                    activeSort?.key === sortItem.key && 'active'
                                                )}
                                                aria-pressed={activeSort?.key === sortItem.key}
                                                onClick={() => {
                                                    if (activeSort?.key === sortItem.key) {
                                                        setSort({
                                                            key: sortItem.key,
                                                            dir: activeSort.dir === 'asc' ? 'desc' : 'asc',
                                                        })
                                                    } else {
                                                        setSort({key: sortItem.key, dir: 'asc'})
                                                    }
                                                }}
                                            >
                                                {sortItem.label}
                                                {activeSort?.key === sortItem.key && (
                                                    <span className="data-table-sort-dir">
                                                        {activeSort.dir === 'asc' ? (
                                                            <MArrowUpIcon className="data-table-sort-icon" />
                                                        ) : (
                                                            <MArrowDownIcon className="data-table-sort-icon" />
                                                        )}
                                                        <span className="data-table-sr-only">
                                                            {', '}
                                                            {activeSort.dir === 'asc'
                                                                ? viewTexts.sortAscending
                                                                : viewTexts.sortDescending}
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </MPopover>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
            <div className={cn('data-table-body', loading && 'loading')}>
                <div className="scroll" aria-busy={loading || undefined}>
                    <table className={cn('root', striped && 'striped', compact && 'compact')}>
                        <thead className={cn('head', stickyHeader && 'sticky')}>
                            <tr>
                                {selectable && (
                                    <th className="th check-col" scope="col">
                                        <MCheckbox
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            size="sm"
                                            clickEffect="none"
                                            label={
                                                <span className="data-table-sr-only">{tableTexts.selectAllRows}</span>
                                            }
                                        />
                                    </th>
                                )}
                                {columns.map((col) => {
                                    const isSortable = col.sortable ?? sortable
                                    const isSorted = activeSort?.key === col.key

                                    return (
                                        <th
                                            key={col.key}
                                            scope="col"
                                            aria-sort={
                                                isSorted
                                                    ? activeSort!.dir === 'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : undefined
                                            }
                                            className={cn(
                                                'th',
                                                isSortable && 'sortable',
                                                isSorted && `sorted-${activeSort!.dir}`
                                            )}
                                            style={{
                                                width: col.width,
                                                textAlign: col.align,
                                            }}
                                            onClick={isSortable ? () => handleSort(col.key) : undefined}
                                        >
                                            {isSortable ? (
                                                // The header cell owns the click (so its padding sorts too);
                                                // the button makes the header reachable and operable by keyboard.
                                                <button type="button" className="th-sort-button">
                                                    <span className="th-content">
                                                        {col.label}
                                                        <span className="sort-icon">
                                                            {isSorted ? (
                                                                activeSort!.dir === 'asc' ? (
                                                                    <MArrowUpIcon aria-hidden="true" />
                                                                ) : (
                                                                    <MArrowDownIcon aria-hidden="true" />
                                                                )
                                                            ) : (
                                                                <MArrowUpDownIcon aria-hidden="true" />
                                                            )}
                                                        </span>
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className="th-content">{col.label}</span>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 && (
                                <tr>
                                    <td className="empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                                        {emptyText ?? tableTexts.empty}
                                    </td>
                                </tr>
                            )}
                            {pageData.map((row, index) => {
                                const key = getRowKey(row, (page - 1) * pageSize + index, rowKey)
                                const isSelected = selected.includes(key)

                                return (
                                    <tr
                                        key={key}
                                        className={cn('row', isSelected && 'selected', selectable && 'selectable')}
                                        onClick={selectable ? (event) => handleRowClick(key, event) : undefined}
                                    >
                                        {selectable && (
                                            <td className="td check-col">
                                                <MCheckbox
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    size="sm"
                                                    clickEffect="none"
                                                    label={
                                                        <span className="data-table-sr-only">
                                                            {formatMText(tableTexts.selectRow, {
                                                                index: (page - 1) * pageSize + index + 1,
                                                            })}
                                                        </span>
                                                    }
                                                />
                                            </td>
                                        )}
                                        {columns.map((col) => (
                                            <td key={col.key} className="td" style={{textAlign: col.align}}>
                                                {col.render
                                                    ? col.render(
                                                          (row as any)[col.key],
                                                          row,
                                                          (page - 1) * pageSize + index
                                                      )
                                                    : (row as any)[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {loading && (
                    <div className="data-table-loading">
                        <MLoader center={false} minHeight="auto" label={loadingLabel ?? commonTexts.loading} />
                    </div>
                )}
            </div>
            {pagination && totalPages > 1 && (
                <MPagination total={totalItems} page={page} pageSize={pageSize} onChange={setPage} />
            )}
        </div>
    )
}
