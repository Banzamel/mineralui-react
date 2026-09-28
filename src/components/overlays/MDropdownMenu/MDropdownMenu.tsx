import {useState, useRef, useCallback, Children, isValidElement, cloneElement} from 'react'
import type * as React from 'react'
import {MPopover} from '../../primitives'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import {cn} from '../../../utils/cn'
import {MCheckIcon} from '../../../icons'
import type {
    MDropdownMenuProps,
    MDropdownItemProps,
    MDropdownGroupProps,
    MDropdownDividerProps,
} from './MDropdownMenu.types'
import './MDropdownMenu.css'

type AnyProps = Record<string, any>

function getProps(el: React.ReactElement): AnyProps {
    return el.props as AnyProps
}

function isItem(child: React.ReactElement): boolean {
    return !!(child.type as any).__dropdownItem
}

function isGroup(child: React.ReactElement): boolean {
    return !!(child.type as any).__dropdownGroup
}

// Collect all MDropdownItem elements from children (including inside groups).
function collectItems(children: React.ReactNode): React.ReactElement[] {
    const items: React.ReactElement[] = []
    Children.forEach(children, (child) => {
        if (!isValidElement(child)) return
        if (isItem(child)) {
            items.push(child)
        } else if (isGroup(child)) {
            Children.forEach(getProps(child).children, (gc: React.ReactNode) => {
                if (isValidElement(gc) && isItem(gc)) {
                    items.push(gc)
                }
            })
        }
    })
    return items
}

export function MDropdownMenu({
    trigger,
    placement = 'bottom-start',
    closeOnSelect = true,
    openOn = 'click',
    onOpenChange,
    isolateClick = false,
    className,
    style,
    popoverClassName,
    popoverStyle,
    children,
}: MDropdownMenuProps) {
    const [open, setOpen] = useState(false)
    const anchorRef = useRef<HTMLDivElement>(null)
    const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)

    const items = collectItems(children)
    const enabledCount = items.filter((i) => !getProps(i).disabled).length

    const setMenuOpen = useCallback(
        (next: boolean | ((prev: boolean) => boolean)) => {
            setOpen((prev) => {
                const resolved = typeof next === 'function' ? next(prev) : next
                onOpenChange?.(resolved)
                return resolved
            })
        },
        [onOpenChange]
    )

    const handleSelect = useCallback(
        (index: number) => {
            let enabledIdx = 0
            for (const item of items) {
                const p = getProps(item)
                if (p.disabled) continue
                if (enabledIdx === index) {
                    p.onClick?.()
                    break
                }
                enabledIdx++
            }
            if (closeOnSelect) setMenuOpen(false)
        },
        [items, closeOnSelect, setMenuOpen]
    )

    const {activeIndex, setActiveIndex, onKeyDown} = useKeyboardNav({
        itemCount: enabledCount,
        onSelect: handleSelect,
        onClose: () => setOpen(false),
        isOpen: open,
    })

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (isolateClick) {
            e.stopPropagation()
            e.preventDefault()
        }
        setMenuOpen((o) => !o)
    }

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (isolateClick) e.stopPropagation()
            setMenuOpen(true)
        }
        if (open) onKeyDown(e as any)
    }

    // Map active index back to flat child rendering with enabled-only tracking.
    let enabledIdx = 0
    const renderChild = (child: React.ReactNode): React.ReactNode => {
        if (!isValidElement(child)) return child

        if (isItem(child)) {
            const p = getProps(child)
            const isDisabled = p.disabled
            const idx = isDisabled ? -1 : enabledIdx++
            return cloneElement(child, {
                _active: idx === activeIndex,
                _onHover: isDisabled ? undefined : () => setActiveIndex(idx),
                _onClick: () => {
                    if (isDisabled) return
                    if (closeOnSelect) setMenuOpen(false)
                },
            } as AnyProps)
        }

        if (isGroup(child)) {
            return cloneElement(child, {
                children: Children.map(getProps(child).children, renderChild),
            } as AnyProps)
        }

        return child
    }

    const hoverHandlers =
        openOn === 'hover'
            ? {
                  onMouseEnter: () => {
                      if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
                      setMenuOpen(true)
                  },
                  onMouseLeave: () => {
                      hoverTimeout.current = setTimeout(() => setMenuOpen(false), 150)
                  },
              }
            : {}

    /**
     * When `isolateClick` is set, every click bubbling out of the menu
     * (trigger AND items) must be stopped — otherwise selecting an action
     * also fires the click handler on a clickable parent (Link, MCard with
     * onClick, MDataTable row link). Trigger click itself is handled by
     * `handleTriggerClick`; this wrapper catches the bubbled item clicks
     * before they leave the anchor. `preventDefault` is needed too — when the
     * dropdown is rendered inside an `<a href>` (MCard component={Link}),
     * stopping propagation alone does not block native link navigation.
     *
     * Caveat: MDropdownItem with `href` will not navigate while inside an
     * `isolateClick` menu — use programmatic navigation (onClick + navigate)
     * in those contexts instead.
     */
    const isolateAnchorClick = isolateClick
        ? (e: React.MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
          }
        : undefined

    return (
        <div
            className={cn('dropdown menu anchor', className)}
            style={style}
            onClick={isolateAnchorClick}
            {...hoverHandlers}
        >
            <div
                ref={anchorRef}
                onClick={openOn === 'click' ? handleTriggerClick : undefined}
                onKeyDown={handleTriggerKeyDown}
                role="button"
                tabIndex={0}
                className="dropdown menu trigger"
            >
                {trigger}
            </div>
            <MPopover
                open={open}
                anchorRef={anchorRef}
                onClose={() => setMenuOpen(false)}
                placement={placement}
                className={cn('dropdown menu popover', popoverClassName)}
                style={popoverStyle}
            >
                <div className="dropdown menu list" role="menu" {...hoverHandlers}>
                    {Children.map(children, renderChild)}
                </div>
            </MPopover>
        </div>
    )
}

export function MDropdownItem({
    icon,
    label,
    description,
    role = 'menuitem',
    checked,
    href,
    to,
    onClick,
    color,
    disabled = false,
    active = false,
    component,
    className,
    _active,
    _onHover,
    _onClick,
}: MDropdownItemProps & {_active?: boolean; _onHover?: () => void; _onClick?: () => void}) {
    const isHighlighted = _active ?? active

    const checkable = role === 'menuitemradio' || role === 'menuitemcheckbox'
    const leading =
        icon ??
        (role === 'menuitemcheckbox' ? (
            <span className="dropdown menu check" aria-hidden="true">
                {checked ? <MCheckIcon size={14} /> : null}
            </span>
        ) : null)

    const content = (
        <>
            {leading && <span className="dropdown menu icon">{leading}</span>}
            {description ? (
                <span className="dropdown menu label with-description">
                    <span className="dropdown menu label-text">{label}</span>
                    <span className="dropdown menu description">{description}</span>
                </span>
            ) : (
                <span className="dropdown menu label">{label}</span>
            )}
        </>
    )

    const cls = cn(
        'dropdown menu item',
        isHighlighted && 'active',
        disabled && 'disabled',
        checkable && checked && 'checked',
        color,
        className
    )

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault()
            return
        }
        onClick?.()
        _onClick?.()
    }

    const Tag = component ?? (href || to ? 'a' : 'button')
    const linkProps = component ? {...(href ? {href} : {}), ...(to ? {to} : {})} : href ? {href} : to ? {href: to} : {}

    return (
        <Tag
            className={cls}
            role={role}
            aria-checked={checkable ? Boolean(checked) : undefined}
            tabIndex={-1}
            onClick={handleClick}
            onMouseEnter={_onHover}
            aria-disabled={disabled || undefined}
            {...linkProps}
        >
            {content}
        </Tag>
    )
}
;(MDropdownItem as any).__dropdownItem = true

export function MDropdownGroup({label, children}: MDropdownGroupProps) {
    return (
        <div className="dropdown menu group" role="group">
            <div className="dropdown menu group-label">{label}</div>
            {children}
        </div>
    )
}
;(MDropdownGroup as any).__dropdownGroup = true

export function MDropdownDivider({className}: MDropdownDividerProps) {
    return <div className={cn('dropdown menu divider', className)} role="separator" />
}
