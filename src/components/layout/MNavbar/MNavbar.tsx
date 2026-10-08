import {Children, cloneElement, isValidElement, useEffect, useId, useRef, useState} from 'react'
import type {MouseEvent as ReactMouseEvent, ReactElement, ReactNode} from 'react'
import type {MNavbarProps} from './MNavbar.types'
import {getHiddenProps, MShellBreakpoints, useMaxWidth} from '../../../theme'
import {cn} from '../../../utils/cn'
import {MContainer} from '../MContainer'
import {MInline} from '../MInline'
import type {MInlineProps} from '../MInline'
import {MNavs} from '../MNavs'
import {MButton} from '../../controls/MButton'
import {MMenuIcon} from '../../../icons'
import './MNavbar.css'
import {useMLayoutTexts} from '../../../i18n/frameworkTexts'

type NavLikeElement = ReactElement<{children?: ReactNode; orientation?: 'horizontal' | 'vertical'}>

// Walks the children tree (any depth) looking for MNavs instances so the navbar
// can pull them into the mobile menu even when wrapped in MInline / MStack.
function findNavLikeChildren(children: ReactNode, found: NavLikeElement[] = []): NavLikeElement[] {
    Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
            return
        }
        if (child.type === MNavs) {
            found.push(child as NavLikeElement)
            return
        }
        const nestedChildren = (child.props as {children?: ReactNode} | null)?.children
        if (nestedChildren !== undefined) {
            findNavLikeChildren(nestedChildren, found)
        }
    })
    return found
}

// Render a horizontal app or site navigation shell with container alignment.
// Below the md breakpoint MNavs children are collapsed behind a hamburger toggle
// that opens either a dropdown panel or a side drawer with the navigation items.
export function MNavbar({
    container = 'content',
    padded = true,
    bordered = true,
    sticky = false,
    tone = 'surface',
    justify = 'between',
    wrap = false,
    mobileMenu = 'dropdown',
    mobileMenuContent,
    mobileMenuFooter,
    collapseActions = false,
    mobileMenuLabel,
    mobileBreakpoint = MShellBreakpoints.compact,
    hidden,
    className,
    children,
    ...rest
}: MNavbarProps) {
    const texts = useMLayoutTexts()
    const [open, setOpen] = useState(false)
    const rootRef = useRef<HTMLElement | null>(null)
    const menuId = useId()
    const mobile = useMaxWidth(mobileBreakpoint)

    const childArray = Children.toArray(children)

    const mobileNavs = findNavLikeChildren(children).map((element, index) =>
        cloneElement(element, {
            key: `mnavbar-mobile-navs-${index}`,
            orientation: 'vertical',
        })
    )

    const toggleButton = (
        <MButton
            key="mnavbar-toggle"
            type="button"
            variant="ghost"
            size="md"
            shape="circle"
            iconOnly
            className="navbar-toggle"
            aria-label={mobileMenuLabel ?? texts.navbarMenu}
            aria-expanded={open}
            // The menu is display: none above the breakpoint, so only point at it below.
            aria-controls={mobile ? menuId : undefined}
            onClick={handleToggleClick}
        >
            <MMenuIcon />
        </MButton>
    )

    let lastInlineIndex = -1
    for (let index = childArray.length - 1; index >= 0; index -= 1) {
        const child = childArray[index]
        if (isValidElement(child) && child.type === MInline) {
            lastInlineIndex = index
            break
        }
    }

    // When collapseActions is on and we're below the breakpoint, the last inline
    // (usually theme / lang / search) is pulled out of the bar and rendered in
    // the mobile menu footer. The burger toggle then attaches to the previous
    // inline (typically primary actions) — or sits on its own when none exists.
    const shouldCollapseLastInline = collapseActions && mobile && lastInlineIndex !== -1
    let collapsedActionsInline: ReactElement<MInlineProps> | null = null
    let workingChildren = childArray
    let toggleHostIndex = lastInlineIndex
    if (shouldCollapseLastInline) {
        collapsedActionsInline = childArray[lastInlineIndex] as ReactElement<MInlineProps>
        workingChildren = childArray.filter((_, index) => index !== lastInlineIndex)
        toggleHostIndex = -1
        for (let index = workingChildren.length - 1; index >= 0; index -= 1) {
            const child = workingChildren[index]
            if (isValidElement(child) && child.type === MInline) {
                toggleHostIndex = index
                break
            }
        }
    }

    const renderedChildren =
        toggleHostIndex === -1
            ? [...workingChildren, toggleButton]
            : workingChildren.map((child, index) => {
                  if (index !== toggleHostIndex) return child
                  const inlineChild = child as ReactElement<MInlineProps>
                  const inlineChildren = Children.toArray(inlineChild.props.children)
                  return cloneElement(inlineChild, {
                      key: inlineChild.key ?? `mnavbar-inline-${index}`,
                      children: [...inlineChildren, toggleButton],
                  })
              })

    useEffect(() => {
        if (!open) return

        function handlePointerDown(event: PointerEvent) {
            const root = rootRef.current
            if (!root) return
            if (event.target instanceof Node && root.contains(event.target)) return
            setOpen(false)
        }

        function handleKeydown(event: KeyboardEvent) {
            if (event.key !== 'Escape') return
            setOpen(false)
            // Hand focus back to the burger when it was inside the navbar (e.g. on a
            // menu link), so keyboard users are not dropped onto <body>.
            const root = rootRef.current
            const active = document.activeElement
            if (root && active instanceof Node && root.contains(active)) {
                root.querySelector<HTMLElement>('.navbar-toggle')?.focus()
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeydown)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeydown)
        }
    }, [open])

    useEffect(() => {
        if (!mobile) {
            setOpen(false)
        }
    }, [mobile])

    function handleToggleClick() {
        setOpen((previous) => !previous)
    }

    function handleMenuClick(event: ReactMouseEvent<HTMLDivElement>) {
        const target = event.target as HTMLElement | null
        if (!target) return
        if (target.closest('a, [role="menuitem"]')) {
            setOpen(false)
        }
    }

    return (
        <nav
            ref={rootRef}
            className={cn(
                'navbar',
                tone,
                bordered && 'bordered',
                sticky && 'sticky',
                mobile && 'mobile-view',
                open && 'mobile-open',
                `mobile-${mobileMenu}`,
                className
            )}
            {...getHiddenProps(hidden)}
            {...rest}
        >
            <MContainer size={container} padded={padded} className="container">
                <div className={cn('inner', justify, wrap && 'wrap')}>{renderedChildren}</div>
            </MContainer>

            {mobileMenu === 'drawer' && (
                <div
                    className={cn('mobile-backdrop', open && 'visible')}
                    aria-hidden
                    // The backdrop lives inside the navbar root, so the outside-pointer
                    // listener ignores it; close explicitly on click.
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                id={menuId}
                className={cn('mobile-menu', mobileMenu, open && 'open')}
                // APG disclosure: the burger owns aria-expanded / aria-controls and the panel is a
                // plain container of links, so no role="menu" (which promises menu keyboarding).
                aria-hidden={!open || undefined}
                // Keep links in a closed menu out of the tab order, not just hidden from AT.
                inert={!open}
                onClick={handleMenuClick}
            >
                {mobileNavs}
                {mobileMenuContent}
                {collapsedActionsInline ? (
                    <div className="mobile-menu-footer">
                        {cloneElement(collapsedActionsInline, {
                            key: 'mnavbar-collapsed-actions',
                        })}
                    </div>
                ) : null}
                {mobileMenuFooter ? <div className="mobile-menu-footer">{mobileMenuFooter}</div> : null}
            </div>
        </nav>
    )
}
