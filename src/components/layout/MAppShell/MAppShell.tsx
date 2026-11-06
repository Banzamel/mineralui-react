import {forwardRef, Children, isValidElement} from 'react'
import type * as React from 'react'
import type {MAppShellProps, MBodyProps} from './MAppShell.types'
import {cn} from '../../../utils/cn'
import {MSidebar} from '../MSidebar'
import type {MSidebarProps} from '../MSidebar'
import {MBottomNav} from '../MBottomNav'
import {AppShellPlacementCtx} from './appShellContext'
import './MAppShell.css'

function isRightSidebar(node: React.ReactNode): boolean {
    return isValidElement(node) && node.type === MSidebar && (node.props as MSidebarProps).side === 'right'
}

export const MAppShell = forwardRef<HTMLDivElement, MAppShellProps>(function MAppShell(
    {sidebar, aside, bottomNav, className, children, ...rest},
    ref
) {
    const leftSidebars: React.ReactNode[] = []
    const rightSidebars: React.ReactNode[] = []
    const bottomNavs: React.ReactNode[] = []
    const otherElements: React.ReactNode[] = []

    Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === MSidebar) {
            ;(isRightSidebar(child) ? rightSidebars : leftSidebars).push(child)
        } else if (isValidElement(child) && child.type === MBottomNav) {
            bottomNavs.push(child)
        } else {
            otherElements.push(child)
        }
    })

    // Slot nodes are rendered in their own positions (not pushed into the child arrays),
    // so they need no keys. A `sidebar` slot holding `<MSidebar side="right">` docks on the right.
    const hasSidebarSlot = sidebar != null && sidebar !== false
    const sidebarSlotRight = hasSidebarSlot && isRightSidebar(sidebar)
    const leftSlot = hasSidebarSlot && !sidebarSlotRight ? sidebar : null
    const rightSlot = sidebarSlotRight ? sidebar : null
    const hasRight = rightSidebars.length > 0 || sidebarSlotRight || (aside != null && aside !== false)
    const hasBottomNav = bottomNavs.length > 0 || (bottomNav != null && bottomNav !== false)

    return (
        <div ref={ref} className={cn('app-shell', className)} {...rest}>
            <AppShellPlacementCtx.Provider value="docked">
                {leftSlot}
                {leftSidebars}
            </AppShellPlacementCtx.Provider>
            <AppShellPlacementCtx.Provider value="content">
                <div className="app-main">{otherElements}</div>
            </AppShellPlacementCtx.Provider>
            {hasRight && (
                <AppShellPlacementCtx.Provider value="docked">
                    {rightSidebars}
                    {rightSlot}
                    {aside}
                </AppShellPlacementCtx.Provider>
            )}
            {hasBottomNav && (
                <AppShellPlacementCtx.Provider value="docked">
                    {bottomNavs}
                    {bottomNav}
                </AppShellPlacementCtx.Provider>
            )}
        </div>
    )
})

export const MBody = forwardRef<HTMLDivElement, MBodyProps>(function MBody({className, children, ...rest}, ref) {
    return (
        <div ref={ref} className={cn('app-body', className)} {...rest}>
            {children}
        </div>
    )
})
