import {useEffect, useLayoutEffect, useRef} from 'react'
import type {MouseEvent} from 'react'
import type {MBottomNavItem, MBottomNavProps} from './MBottomNav.types'
import {getHiddenProps} from '../../../theme'
import {useMLayoutTexts} from '../../../i18n/frameworkTexts'
import {cn} from '../../../utils/cn'
import {renderOverlayBadge} from '../../../utils/overlayBadge'
import {useControllableState} from '../../../utils/useControllableState'
import {isDevelopment, useAppShellPlacement} from '../MAppShell/appShellContext'
import './MBottomNav.css'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => undefined

const HEIGHT_TOKEN = '--mineral-bottom-nav-height'

// Render an app-level bottom navigation bar: a landmark of links or buttons, not a tablist.
export function MBottomNav({
    items,
    value,
    defaultValue,
    onChange,
    hidden,
    hiddenAbove,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
}: MBottomNavProps) {
    const texts = useMLayoutTexts()
    const [activeValue, setActiveValue] = useControllableState<string | undefined>(value, defaultValue, (next) => {
        if (next !== undefined) onChange?.(next)
    })
    const navRef = useRef<HTMLElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    // Offset the shell content by the rendered height: it covers the safe area, and `hiddenAbove` reads as 0.
    useIsomorphicLayoutEffect(() => {
        const nav = navRef.current
        const shell = nav?.closest<HTMLElement>('.app-shell')
        if (!nav || !shell) return

        const sync = () => shell.style.setProperty(HEIGHT_TOKEN, `${nav.offsetHeight}px`)
        sync()
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync)
        observer?.observe(nav)

        return () => {
            observer?.disconnect()
            shell.style.removeProperty(HEIGHT_TOKEN)
        }
    }, [])

    // Same as MTabs: move the list only, scrollIntoView would also move the page.
    useEffect(() => {
        const list = listRef.current
        const active = list?.querySelector('.bottom-nav-item.active')
        if (!list || !active || list.scrollWidth <= list.clientWidth) return

        const listBox = list.getBoundingClientRect()
        const activeBox = active.getBoundingClientRect()
        if (activeBox.left < listBox.left) list.scrollLeft -= listBox.left - activeBox.left
        else if (activeBox.right > listBox.right) list.scrollLeft += activeBox.right - listBox.right
    }, [activeValue])

    const placement = useAppShellPlacement()
    useEffect(() => {
        if (placement === 'content' && isDevelopment()) {
            console.warn(
                '[MBottomNav] Rendered inside the MAppShell main column, where a transformed ancestor would capture its fixed position. Make it a direct child of MAppShell or pass it through MAppShell bottomNav={...}.'
            )
        }
    }, [placement])

    function handleClick(event: MouseEvent<HTMLElement>, item: MBottomNavItem) {
        if (item.disabled) {
            event.preventDefault()
            return
        }
        setActiveValue(item.value)
    }

    return (
        <nav
            ref={navRef}
            className={cn('bottom-nav', className)}
            aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : texts.bottomNavLabel)}
            aria-labelledby={ariaLabelledBy}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            <ul ref={listRef} className="bottom-nav-list">
                {items.map((item) => {
                    const isActive = item.value === activeValue
                    const isLink = Boolean(item.component || item.href)
                    const Item = item.component ?? (item.href ? 'a' : 'button')
                    const hasTextBadge = typeof item.badge === 'string' || typeof item.badge === 'number'

                    return (
                        <li key={item.value} className="bottom-nav-entry">
                            <Item
                                className={cn('bottom-nav-item', isActive && 'active', item.disabled && 'disabled')}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={(event: MouseEvent<HTMLElement>) => handleClick(event, item)}
                                {...(isLink
                                    ? {
                                          href: item.disabled ? undefined : item.href,
                                          to: item.component ? item.to : undefined,
                                          'aria-disabled': item.disabled || undefined,
                                          tabIndex: item.disabled ? -1 : undefined,
                                      }
                                    : {type: 'button', disabled: item.disabled})}
                            >
                                <span className="bottom-nav-icon" aria-hidden="true">
                                    {item.icon}
                                    {renderOverlayBadge({badge: item.badge, badgeColor: item.badgeColor ?? 'error'})}
                                </span>
                                <span className="bottom-nav-label">{item.label}</span>
                                {hasTextBadge && <span className="bottom-nav-sr-only">, {item.badge}</span>}
                            </Item>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
