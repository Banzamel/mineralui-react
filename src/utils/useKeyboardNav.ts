import {useState, useCallback, useEffect, useId, useRef, type FocusEvent, type KeyboardEvent} from 'react'

/**
 * Focus-management strategy (WAI-ARIA APG "Managing focus within components"):
 * - `none` (default) — the hook only tracks `activeIndex`; the caller renders the highlight itself.
 * - `activedescendant` — DOM focus stays on the container / input; the active item is exposed via
 *   `aria-activedescendant` (combobox, listbox, grid with a focused host).
 * - `roving` — exactly one item has `tabIndex=0`, the rest `-1`; arrow keys move real DOM focus
 *   (menu, toolbar, tablist, tree, radio group).
 */
export type UseKeyboardNavMode = 'none' | 'activedescendant' | 'roving'

/** Which arrow keys move the active item. */
export type UseKeyboardNavOrientation = 'vertical' | 'horizontal' | 'both'

export interface UseKeyboardNavOptions {
    itemCount: number
    /** Called on Enter (and Space when `selectOnSpace`) with the active index. */
    onSelect?: (index: number) => void
    /** Called on Escape. When omitted Escape is not handled, so it can bubble to an outer layer. */
    onClose?: () => void
    /** Keys are ignored while `false`. Defaults to `true`. */
    isOpen?: boolean
    loop?: boolean
    /** Focus strategy. Defaults to `'none'` (the original behaviour). */
    mode?: UseKeyboardNavMode
    /** Defaults to `'vertical'` (ArrowUp / ArrowDown). */
    orientation?: UseKeyboardNavOrientation
    /** Flip ArrowLeft / ArrowRight for right-to-left layouts. */
    rtl?: boolean
    /** Disabled items are skipped by arrows, Home / End and typeahead, and are never selected. */
    isItemDisabled?: (index: number) => boolean
    /** Enables first-letter typeahead (APG) when provided. */
    getItemLabel?: (index: number) => string
    /** Treat Space like Enter (menus, toolbars, listboxes without a text input). */
    selectOnSpace?: boolean
    /** Prefix for generated item ids. Defaults to a `useId()` based value. */
    idPrefix?: string
    /** Initial active index. Defaults to `-1` (nothing active). */
    initialIndex?: number
}

export interface UseKeyboardNavItemProps {
    id: string
    tabIndex?: number
    ref?: (el: HTMLElement | null) => void
    onFocus?: (e: FocusEvent<HTMLElement>) => void
}

export interface UseKeyboardNavContainerProps {
    onKeyDown: (e: KeyboardEvent) => void
    'aria-activedescendant'?: string
}

const TYPEAHEAD_RESET_MS = 500

function sanitizeId(value: string) {
    return value.replace(/[^a-zA-Z0-9_-]/g, '')
}

// Provide arrow-key navigation and selection state for list-like widgets.
export function useKeyboardNav({
    itemCount,
    onSelect,
    onClose,
    isOpen = true,
    loop = true,
    mode = 'none',
    orientation = 'vertical',
    rtl = false,
    isItemDisabled,
    getItemLabel,
    selectOnSpace = false,
    idPrefix,
    initialIndex = -1,
}: UseKeyboardNavOptions) {
    const [activeIndex, setActiveIndex] = useState(initialIndex)
    const reactId = useId()
    const prefix = idPrefix ?? `m-kbnav-${sanitizeId(reactId)}`
    const itemRefs = useRef<(HTMLElement | null)[]>([])
    const focusPendingRef = useRef(false)
    const typeaheadRef = useRef<{buffer: string; timer: ReturnType<typeof setTimeout> | null}>({
        buffer: '',
        timer: null,
    })

    // Reset highlight state when the owning widget closes or clears results.
    const resetIndex = useCallback(() => setActiveIndex(-1), [])

    const isDisabled = useCallback(
        (index: number) => (isItemDisabled ? isItemDisabled(index) : false),
        [isItemDisabled]
    )

    const firstEnabled = useCallback(() => {
        for (let i = 0; i < itemCount; i++) if (!isDisabled(i)) return i
        return -1
    }, [itemCount, isDisabled])

    const lastEnabled = useCallback(() => {
        for (let i = itemCount - 1; i >= 0; i--) if (!isDisabled(i)) return i
        return -1
    }, [itemCount, isDisabled])

    // Step to the next enabled item in `dir`, honouring `loop`. Returns `prev` when nothing qualifies.
    const step = useCallback(
        (prev: number, dir: 1 | -1) => {
            if (dir === 1) {
                for (let i = prev + 1; i < itemCount; i++) if (!isDisabled(i)) return i
                if (!loop) return prev
                const first = firstEnabled()
                return first === -1 ? prev : first
            }
            for (let i = Math.min(prev, itemCount) - 1; i >= 0; i--) if (!isDisabled(i)) return i
            if (!loop) return prev === -1 ? firstEnabled() : prev
            const last = lastEnabled()
            return last === -1 ? prev : last
        },
        [itemCount, isDisabled, loop, firstEnabled, lastEnabled]
    )

    const moveTo = useCallback((next: number | ((prev: number) => number)) => {
        focusPendingRef.current = true
        setActiveIndex(next)
    }, [])

    // Roving mode: move real DOM focus after a keyboard-driven index change.
    useEffect(() => {
        if (mode !== 'roving' || !focusPendingRef.current) return
        focusPendingRef.current = false
        const el = itemRefs.current[activeIndex]
        if (el && typeof el.focus === 'function' && el !== el.ownerDocument.activeElement) el.focus()
    }, [mode, activeIndex])

    // Active-descendant mode: keep the virtually focused option visible inside scroll containers.
    useEffect(() => {
        if (mode !== 'activedescendant' || !isOpen || activeIndex < 0) return
        const el = itemRefs.current[activeIndex]
        if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({block: 'nearest'})
    }, [mode, isOpen, activeIndex])

    useEffect(() => {
        const state = typeaheadRef.current
        return () => {
            if (state.timer) clearTimeout(state.timer)
        }
    }, [])

    const handleTypeahead = useCallback(
        (char: string) => {
            if (!getItemLabel || itemCount === 0) return false
            const state = typeaheadRef.current
            if (state.timer) clearTimeout(state.timer)
            state.buffer += char.toLowerCase()
            state.timer = setTimeout(() => {
                state.buffer = ''
                state.timer = null
            }, TYPEAHEAD_RESET_MS)

            // Repeating the same letter cycles through matches; a longer prefix refines from the current item.
            const buffer = state.buffer
            const sameChar = buffer.length > 1 && buffer.split('').every((c) => c === buffer[0])
            const search = sameChar ? buffer[0] : buffer
            const startOffset = search.length === 1 ? 1 : 0
            const start = activeIndex < 0 ? 0 : activeIndex
            for (let n = 0; n < itemCount; n++) {
                const i = (start + startOffset + n) % itemCount
                if (isDisabled(i)) continue
                const label = (getItemLabel(i) ?? '').trim().toLowerCase()
                if (label.startsWith(search)) {
                    moveTo(i)
                    return true
                }
            }
            return false
        },
        [getItemLabel, itemCount, activeIndex, isDisabled, moveTo]
    )

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen || itemCount === 0) return

            const vertical = orientation !== 'horizontal'
            const horizontal = orientation !== 'vertical'
            let key = e.key
            if (horizontal && rtl && (key === 'ArrowLeft' || key === 'ArrowRight')) {
                key = key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'
            }

            if ((key === 'ArrowDown' && vertical) || (key === 'ArrowRight' && horizontal)) {
                e.preventDefault()
                moveTo((prev) => step(prev, 1))
                return
            }
            if ((key === 'ArrowUp' && vertical) || (key === 'ArrowLeft' && horizontal)) {
                e.preventDefault()
                moveTo((prev) => step(prev, -1))
                return
            }

            switch (key) {
                case 'Enter': {
                    e.preventDefault()
                    if (activeIndex >= 0 && activeIndex < itemCount && !isDisabled(activeIndex)) {
                        onSelect?.(activeIndex)
                    }
                    return
                }
                case 'Escape': {
                    if (!onClose) return
                    e.preventDefault()
                    onClose()
                    return
                }
                case 'Home': {
                    e.preventDefault()
                    moveTo(firstEnabled())
                    return
                }
                case 'End': {
                    e.preventDefault()
                    moveTo(lastEnabled())
                    return
                }
            }

            if (key === ' ' && selectOnSpace && !typeaheadRef.current.buffer) {
                e.preventDefault()
                if (activeIndex >= 0 && activeIndex < itemCount && !isDisabled(activeIndex)) {
                    onSelect?.(activeIndex)
                }
                return
            }

            if (getItemLabel && key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (key === ' ' && !typeaheadRef.current.buffer) return
                if (handleTypeahead(key) && mode === 'roving') e.preventDefault()
            }
        },
        [
            isOpen,
            itemCount,
            orientation,
            rtl,
            activeIndex,
            onSelect,
            onClose,
            selectOnSpace,
            getItemLabel,
            mode,
            moveTo,
            step,
            isDisabled,
            firstEnabled,
            lastEnabled,
            handleTypeahead,
        ]
    )

    const getItemId = useCallback((index: number) => `${prefix}-item-${index}`, [prefix])

    const activeDescendantId =
        mode === 'activedescendant' && isOpen && activeIndex >= 0 && activeIndex < itemCount
            ? getItemId(activeIndex)
            : undefined

    // Roving: the tab stop is the active item, falling back to the first enabled one.
    const tabStopIndex =
        activeIndex >= 0 && activeIndex < itemCount && !isDisabled(activeIndex) ? activeIndex : firstEnabled()

    const focusItem = useCallback(
        (index: number) => {
            if (index < 0 || index >= itemCount) return
            moveTo(index)
            const el = itemRefs.current[index]
            if (el && typeof el.focus === 'function') el.focus()
        },
        [itemCount, moveTo]
    )

    const getItemProps = useCallback(
        (index: number): UseKeyboardNavItemProps => {
            const ref = (el: HTMLElement | null) => {
                itemRefs.current[index] = el
            }
            if (mode === 'roving') {
                return {
                    id: getItemId(index),
                    tabIndex: index === tabStopIndex ? 0 : -1,
                    ref,
                    onFocus: () => {
                        if (!isDisabled(index)) setActiveIndex(index)
                    },
                }
            }
            return {id: getItemId(index), ref}
        },
        [mode, getItemId, tabStopIndex, isDisabled]
    )

    const getContainerProps = useCallback(
        (): UseKeyboardNavContainerProps =>
            mode === 'activedescendant' ? {onKeyDown, 'aria-activedescendant': activeDescendantId} : {onKeyDown},
        [mode, onKeyDown, activeDescendantId]
    )

    return {
        activeIndex,
        setActiveIndex,
        resetIndex,
        onKeyDown,
        activeDescendantId,
        getItemId,
        getItemProps,
        getContainerProps,
        focusItem,
    }
}

export type UseKeyboardNavResult = ReturnType<typeof useKeyboardNav>
