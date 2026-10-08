import {Children, isValidElement, useEffect, useId, useState, useRef} from 'react'
import type {MouseEvent, ReactElement, ReactNode} from 'react'
import type {MDrawerProps, MDrawerSectionProps} from './MDrawer.types'
import {MPortal} from '../../primitives'
import {MButton} from '../../controls'
import {MCloseIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import {useModalLayer} from '../../../utils/useModalLayer'
import {lockBodyScroll} from '../scrollLock'
import './MDrawer.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

const EXIT_DURATION = 600

type DrawerSlotElement = ReactElement<MDrawerSectionProps>

function isDrawerHeader(child: ReactNode): child is DrawerSlotElement {
    return isValidElement(child) && !!(child.type as any).__drawerHeader
}

function isDrawerBody(child: ReactNode): child is DrawerSlotElement {
    return isValidElement(child) && !!(child.type as any).__drawerBody
}

function isDrawerFooter(child: ReactNode): child is DrawerSlotElement {
    return isValidElement(child) && !!(child.type as any).__drawerFooter
}

export function MDrawerHeader({children}: MDrawerSectionProps) {
    return <>{children}</>
}
;(MDrawerHeader as any).__drawerHeader = true

export function MDrawerBody({children}: MDrawerSectionProps) {
    return <>{children}</>
}
;(MDrawerBody as any).__drawerBody = true

export function MDrawerFooter({children}: MDrawerSectionProps) {
    return <>{children}</>
}
;(MDrawerFooter as any).__drawerFooter = true

export function MDrawer({
    open,
    onClose,
    side = 'right',
    size = 'md',
    overlay = true,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className,
    children,
    ...rest
}: MDrawerProps) {
    const texts = useMCommonTexts()
    const [mounted, setMounted] = useState(false)
    const [closing, setClosing] = useState(false)
    const backdropRef = useRef<HTMLDivElement>(null)
    const drawerRef = useRef<HTMLDivElement>(null)
    const titleId = useId()

    useModalLayer({active: open && mounted, containerRef: backdropRef, onEscape: closeOnEscape ? onClose : undefined})

    useEffect(() => {
        if (open) {
            setMounted(true)
            setClosing(false)
        }
    }, [open])

    useEffect(() => {
        if (!open && mounted) {
            setClosing(true)
            const timer = setTimeout(() => {
                setMounted(false)
                setClosing(false)
            }, EXIT_DURATION)
            return () => clearTimeout(timer)
        }
    }, [open, mounted])

    // A drawer without an overlay is non-modal: the page beside it stays usable,
    // so it neither locks scrolling nor blocks clicks.
    useEffect(() => {
        if (!mounted || !overlay) return
        return lockBodyScroll()
    }, [mounted, overlay])

    // Without an overlay the backdrop lets clicks through (`pointer-events: none`),
    // so "click outside closes" is detected on the document instead.
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    }, [onClose])
    useEffect(() => {
        if (!open || !mounted || overlay || !closeOnBackdrop) return

        const handlePointerDown = (event: globalThis.MouseEvent) => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (drawerRef.current?.contains(target)) return
            // Popovers, menus and other overlays opened from the drawer portal outside it.
            if (target.closest('.popover, .mineral-backdrop')) return
            onCloseRef.current()
        }

        document.addEventListener('mousedown', handlePointerDown)
        return () => document.removeEventListener('mousedown', handlePointerDown)
    }, [open, mounted, overlay, closeOnBackdrop])

    if (!mounted) return null

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose()
    }

    let header: ReactNode = null
    let headerProps: MDrawerSectionProps | null = null
    let bodyProps: MDrawerSectionProps | null = null
    let footer: ReactNode = null
    let footerProps: MDrawerSectionProps | null = null
    const body: ReactNode[] = []

    Children.forEach(children, (child) => {
        if (isDrawerHeader(child)) {
            header = child.props.children
            headerProps = child.props
            return
        }

        if (isDrawerBody(child)) {
            bodyProps = child.props
            body.push(child.props.children)
            return
        }

        if (isDrawerFooter(child)) {
            footer = child.props.children
            footerProps = child.props
            return
        }

        body.push(child)
    })

    const headerSection = headerProps ?? ({children: undefined} as MDrawerSectionProps)
    const bodySection = bodyProps ?? ({children: undefined} as MDrawerSectionProps)
    const footerSection = footerProps ?? ({children: undefined} as MDrawerSectionProps)
    const {
        children: _headerChildren,
        className: headerClassName,
        bordered: headerBordered = false,
        ...headerRest
    } = headerSection
    const {children: _bodyChildren, className: bodyClassName, ...bodyRest} = bodySection
    const {
        children: _footerChildren,
        className: footerClassName,
        bordered: footerBordered = false,
        ...footerRest
    } = footerSection

    return (
        <MPortal>
            <div
                ref={backdropRef}
                className={cn('mineral-backdrop', 'drawer-backdrop', !overlay && 'no-overlay', closing && 'closing')}
                onMouseDown={handleBackdropClick}
            >
                <div
                    ref={drawerRef}
                    className={cn('drawer', side, size, className)}
                    role="dialog"
                    aria-modal={overlay ? 'true' : undefined}
                    aria-labelledby={header ? titleId : undefined}
                    {...rest}
                >
                    {header && (
                        <div
                            {...headerRest}
                            className={cn('drawer-header', headerBordered && 'bordered', headerClassName)}
                        >
                            <div id={titleId} className="drawer-title">
                                {header}
                            </div>
                            <MButton
                                variant="link"
                                color="neutral"
                                iconOnly
                                size="sm"
                                onClick={onClose}
                                aria-label={texts.close}
                                className="close"
                            >
                                <MCloseIcon />
                            </MButton>
                        </div>
                    )}
                    <div {...bodyRest} className={cn('drawer-body', bodyClassName)}>
                        {body}
                    </div>
                    {footer && (
                        <div
                            {...footerRest}
                            className={cn('drawer-footer', footerBordered && 'bordered', footerClassName)}
                        >
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </MPortal>
    )
}
