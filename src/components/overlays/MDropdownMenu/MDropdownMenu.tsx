import {
    useState,
    useRef,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    Children,
    isValidElement,
    cloneElement,
} from 'react'
import type * as React from 'react'
import {MPopover} from '../../primitives'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import type {UseKeyboardNavItemProps} from '../../../utils/useKeyboardNav'
import {getFocusable} from '../../../utils/useModalLayer'
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

// Plain text of a ReactNode, used for first-letter typeahead.
function nodeText(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return ''
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(nodeText).join('')
    if (isValidElement(node)) return nodeText(getProps(node).children)
    return ''
}

type OpenFocus = 'first' | 'container' | null

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
    const listRef = useRef<HTMLDivElement>(null)
    const itemEls = useRef<(HTMLElement | null)[]>([])
    const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(null)
    const baseId = useId()
    const menuId = `${baseId}-menu`
    const fallbackTriggerId = `${baseId}-trigger`
    // Where focus goes once the menu is positioned: first item (keyboard), the menu itself
    // (pointer) or nowhere (hover-open must not steal focus).
    const [openFocus, setOpenFocus] = useState<OpenFocus>(null)
    // The consumer's trigger carries the menu-button semantics when it contains a focusable
    // element; otherwise the wrapper keeps acting as `role="button"` (the original behaviour).
    const [nativeTrigger, setNativeTrigger] = useState(true)
    const [triggerId, setTriggerId] = useState(fallbackTriggerId)

    const items = collectItems(children)
    const enabledItems = items.filter((i) => !getProps(i).disabled)
    const enabledCount = enabledItems.length

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

    const {activeIndex, setActiveIndex, resetIndex, onKeyDown, getItemProps, focusItem} = useKeyboardNav({
        itemCount: enabledCount,
        // Activate through a real click so links navigate and item handlers run exactly as for the pointer.
        onSelect: (index) => itemEls.current[index]?.click(),
        onClose: () => setMenuOpen(false),
        isOpen: open,
        mode: 'roving',
        selectOnSpace: true,
        getItemLabel: (index) => nodeText(getProps(enabledItems[index]).label),
    })

    useEffect(() => {
        if (!open) resetIndex()
    }, [open, resetIndex])

    // Detect whether the trigger brings its own focusable element and mirror the menu-button
    // state onto it (aria-haspopup / aria-expanded / aria-controls), whatever its structure.
    useLayoutEffect(() => {
        const anchor = anchorRef.current
        if (!anchor) return
        const target = getFocusable(anchor)[0]
        setNativeTrigger(!!target)
        if (!target) {
            setTriggerId(fallbackTriggerId)
            return
        }
        if (!target.id) target.id = fallbackTriggerId
        setTriggerId(target.id)
        target.setAttribute('aria-haspopup', 'menu')
        target.setAttribute('aria-expanded', String(open))
        if (open) target.setAttribute('aria-controls', menuId)
        else target.removeAttribute('aria-controls')
    })

    const openMenu = (focus: OpenFocus, index: number) => {
        setOpenFocus(focus)
        setActiveIndex(index)
        setMenuOpen(true)
    }

    const handleTriggerClick = (e: React.MouseEvent) => {
        if (isolateClick) {
            e.stopPropagation()
            e.preventDefault()
        }
        if (open) {
            setMenuOpen(false)
            return
        }
        // A click synthesised from the keyboard (detail 0) gets the keyboard focus treatment.
        if (e.detail === 0) openMenu('first', 0)
        else openMenu('container', -1)
    }

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
        if (open) {
            if (isolateClick && e.key !== 'Tab') e.stopPropagation()
            onKeyDown(e)
            return
        }
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (isolateClick) e.stopPropagation()
            openMenu('first', 0)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (isolateClick) e.stopPropagation()
            openMenu('first', enabledCount - 1)
        }
    }

    // Firefox activates a button on Space keyup even when keydown was prevented.
    const handleTriggerKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === ' ') e.preventDefault()
    }

    const handleMenuKeyDown = (e: React.KeyboardEvent) => {
        // Tab must reach MPopover (close on Tab-out); everything else stays inside the menu.
        if (isolateClick && e.key !== 'Tab') e.stopPropagation()
        onKeyDown(e)
    }

    // Map active index back to flat child rendering with enabled-only tracking.
    let enabledIdx = 0
    const renderChild = (child: React.ReactNode): React.ReactNode => {
        if (!isValidElement(child)) return child

        if (isItem(child)) {
            const p = getProps(child)
            const isDisabled = p.disabled
            const idx = isDisabled ? -1 : enabledIdx++
            const navProps = isDisabled ? undefined : getItemProps(idx)
            return cloneElement(child, {
                _active: idx >= 0 && idx === activeIndex,
                _onHover: isDisabled
                    ? undefined
                    : () => {
                          // Follow the pointer with real focus only while focus is already in the menu.
                          if (listRef.current?.contains(document.activeElement)) focusItem(idx)
                          else setActiveIndex(idx)
                      },
                _onClick: () => {
                    if (isDisabled) return
                    if (closeOnSelect) setMenuOpen(false)
                },
                _navProps: navProps
                    ? {
                          ...navProps,
                          ref: (el: HTMLElement | null) => {
                              navProps.ref?.(el)
                              itemEls.current[idx] = el
                          },
                      }
                    : undefined,
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
                      if (!open) setOpenFocus(null)
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
                onKeyUp={handleTriggerKeyUp}
                className="dropdown menu trigger"
                {...(nativeTrigger
                    ? {}
                    : {
                          role: 'button',
                          tabIndex: 0,
                          id: fallbackTriggerId,
                          'aria-haspopup': 'menu' as const,
                          'aria-expanded': open,
                          'aria-controls': open ? menuId : undefined,
                      })}
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
                role={null}
                initialFocus={openFocus === 'first' ? 'first' : openFocus === 'container' ? listRef : undefined}
                closeOnTabOut
            >
                <div
                    ref={listRef}
                    id={menuId}
                    className="dropdown menu list"
                    role="menu"
                    aria-labelledby={triggerId}
                    tabIndex={-1}
                    onKeyDown={handleMenuKeyDown}
                    {...hoverHandlers}
                >
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
    _navProps,
}: MDropdownItemProps & {
    _active?: boolean
    _onHover?: () => void
    _onClick?: () => void
    _navProps?: UseKeyboardNavItemProps
}) {
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
            id={_navProps?.id}
            ref={_navProps?.ref}
            tabIndex={_navProps?.tabIndex ?? -1}
            onFocus={_navProps?.onFocus}
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

export function MDropdownGroup({label, className, children}: MDropdownGroupProps) {
    // The visible label names the group for assistive technology.
    const labelId = `${useId()}-label`

    return (
        <div className={cn('dropdown menu group', className)} role="group" aria-labelledby={labelId}>
            <div id={labelId} className="dropdown menu group-label">
                {label}
            </div>
            {children}
        </div>
    )
}
;(MDropdownGroup as any).__dropdownGroup = true

export function MDropdownDivider({className}: MDropdownDividerProps) {
    return <div className={cn('dropdown menu divider', className)} role="separator" />
}
