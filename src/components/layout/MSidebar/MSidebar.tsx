import {createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, useId} from 'react'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MChevronRightIcon, MMenuIcon} from '../../../icons'
import {MTooltip} from '../../overlays'
import {MPopover} from '../../primitives/MPopover'
import {useModalLayer} from '../../../utils/useModalLayer'
import {isRtlElement} from '../../../utils/radioGroupKeys'
import {MShellBreakpoints, useMaxWidth} from '../../../theme'
import type {
    MSidebarProps,
    MSidebarHeaderProps,
    MSidebarBodyProps,
    MSidebarNavProps,
    MSidebarItemProps,
    MSidebarGroupProps,
    MSidebarFooterProps,
    MSidebarDividerProps,
    MSidebarMode,
} from './MSidebar.types'
import './MSidebar.css'
import {useMCommonTexts, useMLayoutTexts} from '../../../i18n/frameworkTexts'

const STORAGE_KEY = 'mineralui-sidebar'

interface SidebarContextValue {
    mode: MSidebarMode
    mobile: boolean
    mobileOpen: boolean
    canToggle: boolean
    toggleMode: () => void
}

const SidebarCtx = createContext<SidebarContextValue>({
    mode: 'expanded',
    mobile: false,
    mobileOpen: false,
    canToggle: false,
    toggleMode: () => {},
})

// Read shared sidebar state inside slot components.
function useSidebar() {
    return useContext(SidebarCtx)
}

// Render the sidebar shell and coordinate desktop and mobile behavior.
export function MSidebar({
    mode: modeProp = 'auto',
    defaultMode = 'expanded',
    onModeChange,
    persist = false,
    side = 'left',
    tone = 'subtle',
    bordered = true,
    mobileBreakpoint = MShellBreakpoints.mobile,
    compactBreakpoint = MShellBreakpoints.compact,
    className,
    style,
    children,
}: MSidebarProps) {
    const texts = useMCommonTexts()
    const resolvedCompactBreakpoint = Math.max(compactBreakpoint, mobileBreakpoint)
    const mobile = useMaxWidth(mobileBreakpoint)
    const compactViewport = useMaxWidth(resolvedCompactBreakpoint)
    const compact = !mobile && compactViewport
    const [mobileOpen, setMobileOpen] = useState(false)

    const [internalMode, setInternalMode] = useState<MSidebarMode>(() => {
        if (persist) {
            try {
                const v = localStorage.getItem(STORAGE_KEY)
                if (v === 'expanded' || v === 'collapsed') return v
            } catch {
                /* noop */
            }
        }

        return defaultMode
    })

    const resolvedMode: MSidebarMode = mobile
        ? 'expanded'
        : compact
          ? 'collapsed'
          : modeProp === 'auto'
            ? internalMode
            : modeProp === 'collapsed'
              ? 'collapsed'
              : 'expanded'

    // MToggle only the desktop width state. Mobile uses its own overlay flow.
    const toggleMode = useCallback(() => {
        const next: MSidebarMode = resolvedMode === 'expanded' ? 'collapsed' : 'expanded'

        setInternalMode(next)
        onModeChange?.(next)

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, next)
            } catch {
                /* noop */
            }
        }
    }, [resolvedMode, onModeChange, persist])

    const closeMobile = useCallback(() => setMobileOpen(false), [])
    const asideRef = useRef<HTMLElement | null>(null)
    const layoutTexts = useMLayoutTexts()
    const drawerOpen = mobile && mobileOpen

    // The open mobile drawer is a modal dialog: focus moves in, Tab cycles inside, Escape
    // closes it (only when it is the top layer) and focus returns to the hamburger.
    useModalLayer({active: drawerOpen, containerRef: asideRef, onEscape: closeMobile})

    useEffect(() => {
        if (!mobile) {
            setMobileOpen(false)
        }
    }, [mobile])

    const canToggle = !mobile && !compact && modeProp === 'auto'

    const ctx = useMemo<SidebarContextValue>(
        () => ({mode: resolvedMode, mobile, mobileOpen, canToggle, toggleMode}),
        [resolvedMode, mobile, mobileOpen, canToggle, toggleMode]
    )

    const isCollapsed = !mobile && resolvedMode === 'collapsed'

    const sidebarCls = cn(
        'sidebar',
        tone,
        side,
        isCollapsed && 'collapsed',
        compact && 'compact',
        bordered && 'bordered',
        mobile && 'mobile',
        mobile && mobileOpen && 'mobile-open',
        className
    )

    return (
        <SidebarCtx.Provider value={ctx}>
            {drawerOpen && <div className="sidebar-backdrop" aria-hidden="true" onClick={closeMobile} />}

            <aside
                ref={asideRef}
                className={sidebarCls}
                style={style}
                {...(drawerOpen
                    ? {role: 'dialog', 'aria-modal': true, 'aria-label': layoutTexts.sidebarDialogLabel}
                    : {})}
                // The closed off-canvas drawer must not leave its links in the Tab order.
                inert={mobile && !mobileOpen ? true : undefined}
            >
                {children}
            </aside>

            {mobile && (
                // Stays mounted (hidden) while the drawer is open so focus can return to it on close.
                <button
                    type="button"
                    className={cn('sidebar-hamburger', side)}
                    onClick={() => setMobileOpen(true)}
                    aria-label={texts.openMenu}
                    aria-haspopup="dialog"
                    hidden={mobileOpen}
                >
                    <span className="sidebar-hamburger-icon" aria-hidden="true">
                        <MMenuIcon />
                    </span>
                </button>
            )}
        </SidebarCtx.Provider>
    )
}

// Render the top area with branding and an optional collapse toggle.
export function MSidebarHeader({bordered = false, className, children}: MSidebarHeaderProps) {
    const {mode, mobile, canToggle, toggleMode} = useSidebar()
    const isCollapsed = !mobile && mode === 'collapsed'
    const layoutTexts = useMLayoutTexts()

    return (
        <div className={cn('sidebar-header', bordered && 'bordered', className)}>
            <div className="sidebar-header-content">{children}</div>
            {canToggle && (
                <MButton
                    variant="outlined"
                    color="neutral"
                    iconOnly
                    size="sm"
                    onClick={toggleMode}
                    aria-label={isCollapsed ? layoutTexts.sidebarExpand : layoutTexts.sidebarCollapse}
                    className="sidebar-toggle"
                >
                    <span className={cn('sidebar-chevron', isCollapsed && 'flipped')}>
                        <MChevronRightIcon />
                    </span>
                </MButton>
            )}
        </div>
    )
}

// Wrap the scrollable middle area between header and footer.
export function MSidebarBody({className, children}: MSidebarBodyProps) {
    return <div className={cn('sidebar-body', className)}>{children}</div>
}

// Wrap sidebar links in a navigation landmark.
export function MSidebarNav({className, children}: MSidebarNavProps) {
    return <nav className={cn('sidebar-nav', className)}>{children}</nav>
}

// Render one clickable sidebar row as a link, button or custom component.
export function MSidebarItem({
    icon,
    label,
    description,
    href,
    to,
    onClick,
    active = false,
    disabled = false,
    badge,
    color,
    component,
    className,
}: MSidebarItemProps) {
    const {mode, mobile} = useSidebar()
    const isCollapsed = !mobile && mode === 'collapsed'

    // ONE tooltip per row: prefer description, fall back to label. The HTML
    // title attribute used in collapsed mode mirrors the same priority but is
    // limited to strings (browsers can't render ReactNodes).
    const tooltipContent = description ?? label
    const titleAttr = typeof description === 'string' ? description : typeof label === 'string' ? label : undefined

    const Tag = component ?? (href || to ? 'a' : 'button')
    const linkProps = component ? (to ? {to} : href ? {href} : {}) : href ? {href} : to ? {href: to} : {}
    const cls = cn('sidebar-item', active && 'active', disabled && 'disabled', color, className)

    return (
        <Tag
            className={cls}
            onClick={disabled ? undefined : onClick}
            aria-disabled={disabled || undefined}
            title={isCollapsed ? titleAttr : undefined}
            {...linkProps}
        >
            {icon && <span className="sidebar-item-icon">{icon}</span>}
            {isCollapsed ? (
                // Collapsed rows show only the icon; keep the label as the accessible
                // name (a bare `title` is not reliably announced nor shown on focus).
                <span className="sidebar-item-label-hidden">{label}</span>
            ) : (
                <MTooltip content={tooltipContent} placement="top" className="sidebar-item-label-tooltip">
                    <span className="sidebar-item-label">{label}</span>
                </MTooltip>
            )}
            {!isCollapsed && badge && <span className="sidebar-item-badge">{badge}</span>}
        </Tag>
    )
}

// Collapsed rail: the group icon is a disclosure button with a flyout of the group's links.
// Hover still opens it (as before); click / tap / Enter / Space / ArrowRight toggle it from
// pointer, touch and keyboard. Escape or Tab-out closes it and focus returns to the button.
function MSidebarGroupFlyout({
    label,
    icon,
    active,
    className,
    ctx,
    children,
}: {
    label: string
    icon: MSidebarGroupProps['icon']
    active: boolean
    className?: string
    ctx: SidebarContextValue
    children: MSidebarGroupProps['children']
}) {
    const [open, setOpen] = useState(false)
    const [focusFirst, setFocusFirst] = useState(false)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const flyoutId = useId()
    const titleId = `${flyoutId}-title`

    useEffect(
        () => () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        },
        []
    )

    const openFlyout = (withFocus: boolean) => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        setFocusFirst(withFocus)
        setOpen(true)
    }

    const hoverHandlers = {
        onMouseEnter: () => {
            if (!open) openFlyout(false)
            else if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
        },
        onMouseLeave: () => {
            // Leaving the rail for the flyout (or back) must not flicker the panel.
            hoverTimeout.current = setTimeout(() => {
                const flyout = document.getElementById(flyoutId)
                // Keep a keyboard-opened flyout while focus is inside it.
                if (flyout && flyout.contains(document.activeElement)) return
                setOpen(false)
            }, 150)
        },
    }

    return (
        <div className={cn('sidebar-group', className)} {...hoverHandlers}>
            <button
                ref={buttonRef}
                type="button"
                className={cn('sidebar-group-icon collapsed', active && 'active', open && 'open')}
                title={label}
                aria-label={label}
                aria-expanded={open}
                aria-controls={open ? flyoutId : undefined}
                onClick={(event) => {
                    if (open) {
                        setOpen(false)
                        return
                    }
                    // A click synthesised from the keyboard (detail 0) moves focus into the flyout.
                    openFlyout(event.detail === 0)
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                        const rtl = isRtlElement(event.currentTarget)
                        const opening = rtl ? 'ArrowLeft' : 'ArrowRight'
                        if (event.key !== opening) return
                        event.preventDefault()
                        openFlyout(true)
                    }
                }}
            >
                {icon}
            </button>
            <MPopover
                open={open}
                anchorRef={buttonRef}
                onClose={() => setOpen(false)}
                placement="right-start"
                className="dropdown menu popover sidebar-flyout"
                role="group"
                id={flyoutId}
                aria-labelledby={titleId}
                initialFocus={focusFirst ? 'first' : undefined}
                closeOnTabOut
            >
                <div
                    className="dropdown menu list sidebar-flyout-list"
                    {...hoverHandlers}
                    onClick={(event) => {
                        // Following a link closes the flyout (the old closeOnSelect behaviour).
                        if ((event.target as HTMLElement).closest('a, button')) setOpen(false)
                    }}
                >
                    <div id={titleId} className="sidebar-flyout-title">
                        {label}
                    </div>
                    <SidebarCtx.Provider value={ctx}>{children}</SidebarCtx.Provider>
                </div>
            </MPopover>
        </div>
    )
}

// Group related sidebar items and swap to a flyout when collapsed.
export function MSidebarGroup({
    label,
    icon,
    active = false,
    defaultOpen = true,
    collapsible = true,
    children,
    className,
}: MSidebarGroupProps) {
    const sidebarCtx = useSidebar()
    const {mode, mobile} = sidebarCtx
    const isCollapsed = !mobile && mode === 'collapsed'
    const [open, setOpen] = useState(defaultOpen)

    const expandedCtx = useMemo<SidebarContextValue>(() => ({...sidebarCtx, mode: 'expanded'}), [sidebarCtx])

    // Keep expand/collapse local to this group.
    const toggle = () => {
        if (collapsible) setOpen((o) => !o)
    }

    if (isCollapsed) {
        return (
            <MSidebarGroupFlyout label={label} icon={icon} active={active} className={className} ctx={expandedCtx}>
                {children}
            </MSidebarGroupFlyout>
        )
    }

    return (
        <div className={cn('sidebar-group', className)}>
            <button
                type="button"
                className={cn('sidebar-group-header', active && 'active')}
                onClick={toggle}
                aria-expanded={collapsible ? open : undefined}
            >
                {icon && <span className="sidebar-group-icon">{icon}</span>}
                <span className="sidebar-group-label">{label}</span>
                {collapsible && (
                    <span className={cn('sidebar-group-arrow', open && 'open')} aria-hidden="true">
                        <MChevronRightIcon />
                    </span>
                )}
            </button>
            {open && <div className="sidebar-group-items">{children}</div>}
        </div>
    )
}

// Render the bottom slot for version info or quick actions.
export function MSidebarFooter({bordered = false, className, children}: MSidebarFooterProps) {
    return <div className={cn('sidebar-footer', bordered && 'bordered', className)}>{children}</div>
}

// Render a spacing-aware divider between sidebar regions.
export function MSidebarDivider({className, spacing = 'md'}: MSidebarDividerProps) {
    return <hr className={cn('sidebar-divider', spacing, className)} />
}
