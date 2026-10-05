import {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MChevronRightIcon, MMenuIcon} from '../../../icons'
import {MDropdownMenu, MTooltip} from '../../overlays'
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
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

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

    // Let Escape close the temporary mobile drawer.
    useEffect(() => {
        if (!mobileOpen) return

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false)
        }

        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [mobileOpen])

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
            {mobile && mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

            <aside className={sidebarCls} style={style}>
                {children}
            </aside>

            {mobile && !mobileOpen && (
                <button
                    className={cn('sidebar-hamburger', side)}
                    onClick={() => setMobileOpen(true)}
                    aria-label={texts.openMenu}
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
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
            {!isCollapsed && (
                <MTooltip content={tooltipContent} placement="top" className="sidebar-item-label-tooltip">
                    <span className="sidebar-item-label">{label}</span>
                </MTooltip>
            )}
            {!isCollapsed && badge && <span className="sidebar-item-badge">{badge}</span>}
        </Tag>
    )
}

// Group related sidebar items and swap to a dropdown when collapsed.
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
        const trigger = (
            <span className={cn('sidebar-group-icon collapsed', active && 'active')} title={label}>
                {icon}
            </span>
        )

        return (
            <div className={cn('sidebar-group', className)}>
                <MDropdownMenu trigger={trigger} placement="right-start" closeOnSelect openOn="hover">
                    <SidebarCtx.Provider value={expandedCtx}>{children}</SidebarCtx.Provider>
                </MDropdownMenu>
            </div>
        )
    }

    return (
        <div className={cn('sidebar-group', className)}>
            <button className={cn('sidebar-group-header', active && 'active')} onClick={toggle} aria-expanded={open}>
                {icon && <span className="sidebar-group-icon">{icon}</span>}
                <span className="sidebar-group-label">{label}</span>
                {collapsible && (
                    <span className={cn('sidebar-group-arrow', open && 'open')}>
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
