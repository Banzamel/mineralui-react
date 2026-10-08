import {useEffect, useId, useState, useRef} from 'react'
import type {MouseEvent} from 'react'
import type {MModalProps} from './MModal.types'
import {MCard, MCardBody, MCardFooter, MCardHeader} from '../../cards'
import {MPortal} from '../../primitives'
import {cn} from '../../../utils/cn'
import {useModalLayer} from '../../../utils/useModalLayer'
import {lockBodyScroll} from '../scrollLock'
import './MModal.css'

const EXIT_DURATION = 540

// Render blocking overlay content for dense details and mobile-friendly dialogs.
export function MModal({
    open,
    onClose,
    title,
    description,
    footer,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    className,
    children,
    ...rest
}: MModalProps) {
    const titleId = useId()
    const [mounted, setMounted] = useState(false)
    const [closing, setClosing] = useState(false)
    const backdropRef = useRef<HTMLDivElement>(null)

    useModalLayer({active: open && mounted, containerRef: backdropRef, onEscape: closeOnEscape ? onClose : undefined})

    // Open → mount immediately
    useEffect(() => {
        if (open) {
            setMounted(true)
            setClosing(false)
        }
    }, [open])

    // Close → animate out, then unmount
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

    useEffect(() => {
        if (!mounted) return
        return lockBodyScroll()
    }, [mounted])

    if (!mounted) return null

    const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!closeOnBackdrop) return
        if (event.target === event.currentTarget) onClose()
    }

    return (
        <MPortal>
            <div
                ref={backdropRef}
                className={cn('mineral-backdrop', 'modal-backdrop', closing && 'closing')}
                onMouseDown={handleBackdropClick}
            >
                <div className={'modal-shell'}>
                    <MCard
                        className={cn('modal', size, className)}
                        role={'dialog'}
                        aria-modal={'true'}
                        aria-labelledby={title ? titleId : undefined}
                        {...rest}
                    >
                        {(title || description) && (
                            <MCardHeader>
                                {title && (
                                    <div id={titleId} className={'modal-title'}>
                                        {title}
                                    </div>
                                )}
                                {description && <div className={'modal-description'}>{description}</div>}
                            </MCardHeader>
                        )}
                        <MCardBody>{children}</MCardBody>
                        {footer && <MCardFooter>{footer}</MCardFooter>}
                    </MCard>
                </div>
            </div>
        </MPortal>
    )
}
