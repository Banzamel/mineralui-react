import {useCallback, useEffect, useLayoutEffect, useRef} from 'react'
import type {FocusEvent, KeyboardEvent, RefObject} from 'react'
import {getFocusable} from './useModalLayer'
import {isRtlElement} from './radioGroupKeys'

/**
 * Internal (not re-exported from the package root): WAI-ARIA APG toolbar keyboard model for a
 * container whose controls are rendered by arbitrary children (slots, MButton, MDropdownMenu
 * triggers).
 *
 * The toolbar is one Tab stop: exactly one control keeps `tabindex="0"`, the others get `-1`.
 * ArrowLeft / ArrowRight move focus between the controls (flipped in right-to-left layouts, both
 * wrap), Home / End jump to the ends. Text fields and controls inside a nested dialog, menu,
 * listbox, grid or toolbar are left alone, so they keep their own keys and Tab stop.
 *
 * The roving state is applied to the DOM directly (the controls are not owned by the toolbar),
 * re-synced after every render and whenever the children change.
 */
export interface UseRovingToolbarOptions {
    /** Turns the behaviour off (the controls keep their own Tab stops). Defaults to `true`. */
    enabled?: boolean
    /** Control that holds the Tab stop until the user moves it (e.g. the selected day). */
    preferSelector?: string
}

const ITEM_ATTRIBUTE = 'data-m-roving-item'
const NESTED_WIDGETS =
    '[role="dialog"],[role="menu"],[role="listbox"],[role="grid"],[role="tree"],[role="toolbar"],[role="tablist"]'
const TEXT_INPUT_TYPES = new Set(['button', 'checkbox', 'radio', 'submit', 'reset', 'image', 'color', 'file'])

function isTextEntry(element: HTMLElement): boolean {
    const tag = element.tagName
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (tag === 'INPUT') return !TEXT_INPUT_TYPES.has((element as HTMLInputElement).type)
    return element.isContentEditable || element.getAttribute('contenteditable') === 'true'
}

/** Controls of the toolbar `root`, in DOM order. */
export function getToolbarItems(root: HTMLElement): HTMLElement[] {
    const candidates = new Set<HTMLElement>([
        ...getFocusable(root),
        ...Array.from(root.querySelectorAll<HTMLElement>(`[${ITEM_ATTRIBUTE}]`)),
    ])
    const ordered = Array.from(candidates).sort((left, right) =>
        left === right ? 0 : left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    )
    return ordered.filter((element) => {
        if (!element.isConnected || isTextEntry(element)) return false
        if ((element as HTMLButtonElement).disabled) return false
        const nested = element.parentElement?.closest(NESTED_WIDGETS)
        if (nested && nested !== root && root.contains(nested)) return false
        return true
    })
}

export function useRovingToolbar(
    rootRef: RefObject<HTMLElement | null>,
    {enabled = true, preferSelector}: UseRovingToolbarOptions = {}
) {
    const activeRef = useRef<HTMLElement | null>(null)

    const sync = useCallback(() => {
        const root = rootRef.current
        if (!root || !enabled) return
        const items = getToolbarItems(root)
        if (items.length === 0) return
        let active = activeRef.current && items.includes(activeRef.current) ? activeRef.current : null
        if (!active && preferSelector) active = items.find((item) => item.matches(preferSelector)) ?? null
        if (!active) active = items[0]
        activeRef.current = active
        items.forEach((item) => {
            item.setAttribute(ITEM_ATTRIBUTE, '')
            const next = item === active ? '0' : '-1'
            if (item.getAttribute('tabindex') !== next) item.setAttribute('tabindex', next)
        })
    }, [rootRef, enabled, preferSelector])

    // Re-apply after every render: React may have replaced a control or changed which one is preferred.
    useLayoutEffect(() => {
        sync()
    })

    // Slot content can change without this component re-rendering.
    useEffect(() => {
        const root = rootRef.current
        if (!root || !enabled || typeof MutationObserver === 'undefined') return
        const observer = new MutationObserver(() => sync())
        observer.observe(root, {childList: true, subtree: true, attributes: true, attributeFilter: ['disabled']})
        return () => observer.disconnect()
    }, [rootRef, enabled, sync])

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            const root = rootRef.current
            if (!root || !enabled || event.defaultPrevented) return
            if (event.altKey || event.ctrlKey || event.metaKey) return
            const items = getToolbarItems(root)
            const index = items.indexOf(event.target as HTMLElement)
            if (index < 0) return
            let key = event.key
            if (isRtlElement(root) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
                key = key === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'
            }
            let next: number
            switch (key) {
                case 'ArrowRight':
                    next = (index + 1) % items.length
                    break
                case 'ArrowLeft':
                    next = (index - 1 + items.length) % items.length
                    break
                case 'Home':
                    next = 0
                    break
                case 'End':
                    next = items.length - 1
                    break
                default:
                    return
            }
            event.preventDefault()
            activeRef.current = items[next]
            sync()
            items[next].focus()
        },
        [rootRef, enabled, sync]
    )

    const onFocus = useCallback(
        (event: FocusEvent<HTMLElement>) => {
            const root = rootRef.current
            if (!root || !enabled) return
            const target = event.target as HTMLElement
            if (target === activeRef.current || !getToolbarItems(root).includes(target)) return
            activeRef.current = target
            sync()
        },
        [rootRef, enabled, sync]
    )

    return {onKeyDown, onFocus}
}
