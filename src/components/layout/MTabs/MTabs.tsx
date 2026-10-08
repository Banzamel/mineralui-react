import {useId, useMemo, useRef, useState} from 'react'
import type {KeyboardEvent} from 'react'
import type {MTabsItem, MTabsProps} from './MTabs.types'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {getRadioGroupTarget, isRtlElement} from '../../../utils/radioGroupKeys'
import './MTabs.css'

interface MTabsTriggerProps {
    item: MTabsItem
    isActive: boolean
    tabId: string
    /** Only set when the tab's panel is actually rendered, so `aria-controls` never dangles. */
    panelId: string | undefined
    clickEffect: MTabsProps['clickEffect']
    rippleColor: string | undefined
    onSelect: (value: string) => void
    registerRef: (value: string, node: HTMLButtonElement | null) => void
}

// Keep the tab trigger behavior isolated from the list and panel rendering.
function MTabsTrigger({
    item,
    isActive,
    tabId,
    panelId,
    clickEffect,
    rippleColor,
    onSelect,
    registerRef,
}: MTabsTriggerProps) {
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLButtonElement>({
        effect: clickEffect,
        disabled: item.disabled,
        centered: true,
        color: rippleColor,
    })

    return (
        <button
            type="button"
            ref={(node) => registerRef(item.value, node)}
            id={tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            className={cn('tabs-trigger', isActive && 'active', item.disabled && 'disabled', effectClassName)}
            onPointerDown={handlePointerDown}
            onKeyDown={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    triggerEffect(event.currentTarget)
                }
            }}
            onClick={() => onSelect(item.value)}
        >
            {effectLayer}
            {item.icon && <span className="tabs-icon">{item.icon}</span>}
            <span className="tabs-label">{item.label}</span>
        </button>
    )
}

export function MTabs({
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    orientation = 'horizontal',
    size = 'md',
    fullWidth = false,
    showPanels = true,
    panelClassName,
    clickEffect = 'ripple',
    rippleColor,
    className,
    ...rest
}: MTabsProps) {
    // Pick the first enabled item when the caller does not control the active tab.
    const fallbackValue = useMemo(
        () => defaultValue ?? items.find((item) => !item.disabled)?.value ?? '',
        [defaultValue, items]
    )
    const [internalValue, setInternalValue] = useState(fallbackValue)
    const activeValue = value ?? internalValue
    const activeItem = items.find((item) => item.value === activeValue) ?? items[0]
    const baseId = useId()

    // Support both controlled and uncontrolled tab state.
    function selectTab(nextValue: string) {
        if (value === undefined) {
            setInternalValue(nextValue)
        }
        onValueChange?.(nextValue)
    }

    const tabRefs = useRef(new Map<string, HTMLButtonElement>())
    function registerRef(itemValue: string, node: HTMLButtonElement | null) {
        if (node) tabRefs.current.set(itemValue, node)
        else tabRefs.current.delete(itemValue)
    }

    // APG tabs with automatic activation: arrows along the orientation only (wrapping, flipped in
    // RTL for horizontal lists), Home / End jump to the ends, and focus follows the selection.
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const axisKeys = orientation === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
        if (!axisKeys.includes(event.key) && event.key !== 'Home' && event.key !== 'End') return

        const enabledItems = items.filter((item) => !item.disabled)
        if (enabledItems.length === 0) return
        // Start from the focused tab when there is one, otherwise from the selected tab.
        const focusedValue = [...tabRefs.current.entries()].find(([, node]) => node === event.target)?.[0]
        const fromValue = focusedValue ?? activeItem?.value
        const currentIndex = enabledItems.findIndex((item) => item.value === fromValue)
        const rtl = orientation === 'horizontal' && isRtlElement(event.currentTarget)
        const targetIndex = getRadioGroupTarget(event.key, currentIndex, enabledItems.length, rtl)
        if (targetIndex === null) return

        event.preventDefault()
        const target = enabledItems[targetIndex]
        if (target.value !== activeItem?.value) selectTab(target.value)
        tabRefs.current.get(target.value)?.focus()
    }

    return (
        <div className={cn('tabs', variant, orientation, size, fullWidth && 'full-width', className)} {...rest}>
            <div className="tabs-list" role="tablist" aria-orientation={orientation} onKeyDown={handleKeyDown}>
                {items.map((item) => {
                    const isActive = item.value === activeItem?.value
                    const tabId = `${baseId}-${item.value}-tab`
                    const hasPanel = showPanels && isActive && item.content !== undefined
                    const panelId = hasPanel ? `${baseId}-${item.value}-panel` : undefined

                    return (
                        <MTabsTrigger
                            key={item.value}
                            item={item}
                            isActive={isActive}
                            tabId={tabId}
                            panelId={panelId}
                            clickEffect={clickEffect}
                            rippleColor={rippleColor}
                            onSelect={selectTab}
                            registerRef={registerRef}
                        />
                    )
                })}
            </div>

            {showPanels && activeItem?.content !== undefined && (
                <div
                    key={activeItem.value}
                    id={`${baseId}-${activeItem.value}-panel`}
                    role="tabpanel"
                    aria-labelledby={`${baseId}-${activeItem.value}-tab`}
                    tabIndex={0}
                    className={cn('tabs-panel', panelClassName)}
                >
                    {activeItem.content}
                </div>
            )}
        </div>
    )
}
