import {useEffect, useRef} from 'react'
import type {MouseEvent} from 'react'
import {MButton} from '../../controls'
import {MBadge} from '../../feedback'
import {MPortal} from '../../primitives'
import {MCloseIcon, MChevronLeftIcon, MChevronRightIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import {useModalLayer} from '../../../utils/useModalLayer'
import {lockBodyScroll} from '../../overlays/scrollLock'
import './MMediaLightbox.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

export interface MMediaLightboxItem {
    src: string
    alt?: string
    caption?: string
}

interface MMediaLightboxProps {
    open: boolean
    items: MMediaLightboxItem[]
    activeIndex: number
    onClose: () => void
    onActiveIndexChange: (index: number) => void
}

export function MMediaLightbox({open, items, activeIndex, onClose, onActiveIndexChange}: MMediaLightboxProps) {
    const texts = useMCommonTexts()
    const currentItem = items[activeIndex]
    const frameRef = useRef<HTMLDivElement | null>(null)
    const backdropRef = useRef<HTMLDivElement | null>(null)
    const canGoPrev = activeIndex > 0
    const canGoNext = activeIndex < items.length - 1

    useModalLayer({active: open && !!currentItem, containerRef: backdropRef, onEscape: onClose})

    useEffect(() => {
        if (!open) {
            return
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft' && canGoPrev) {
                onActiveIndexChange(activeIndex - 1)
            }

            if (event.key === 'ArrowRight' && canGoNext) {
                onActiveIndexChange(activeIndex + 1)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [activeIndex, canGoNext, canGoPrev, onActiveIndexChange, onClose, open])

    useEffect(() => {
        if (!open) {
            return
        }

        return lockBodyScroll()
    }, [open])

    if (!open || !currentItem) {
        return null
    }

    const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target as Node | null

        if (target && frameRef.current && !frameRef.current.contains(target)) {
            onClose()
        }
    }

    const previewLabel = currentItem.alt || currentItem.caption || texts.imagePreview

    return (
        <MPortal>
            <div
                ref={backdropRef}
                className={cn('mineral-backdrop', 'media-lightbox-backdrop')}
                onMouseDown={handleBackdropMouseDown}
            >
                <div className="media-lightbox-shell" role="dialog" aria-modal="true" aria-label={previewLabel}>
                    <div className="media-lightbox-stage">
                        <div ref={frameRef} className="media-lightbox-frame">
                            <div className="media-lightbox-topbar">
                                <MBadge color="dark" size="md" rounded className="media-lightbox-counter">
                                    {items.length > 1 ? `${activeIndex + 1} / ${items.length}` : texts.preview}
                                </MBadge>
                                <MButton
                                    type="button"
                                    variant="ghost"
                                    color="error"
                                    size="lg"
                                    shape="circle"
                                    iconOnly
                                    className="media-lightbox-action"
                                    aria-label={texts.closePreview}
                                    onClick={onClose}
                                >
                                    <MCloseIcon />
                                </MButton>
                            </div>

                            <MButton
                                type="button"
                                variant="ghost"
                                color="primary"
                                size="lg"
                                shape="circle"
                                iconOnly
                                className="media-lightbox-nav media-lightbox-nav-prev"
                                aria-label={texts.previousImage}
                                disabled={items.length <= 1 || !canGoPrev}
                                onClick={() => canGoPrev && onActiveIndexChange(activeIndex - 1)}
                            >
                                <MChevronLeftIcon />
                            </MButton>

                            <img className="media-lightbox-image" src={currentItem.src} alt={currentItem.alt || ''} />

                            <MButton
                                type="button"
                                variant="ghost"
                                color="primary"
                                size="lg"
                                shape="circle"
                                iconOnly
                                className="media-lightbox-nav media-lightbox-nav-next"
                                aria-label={texts.nextImage}
                                disabled={items.length <= 1 || !canGoNext}
                                onClick={() => canGoNext && onActiveIndexChange(activeIndex + 1)}
                            >
                                <MChevronRightIcon />
                            </MButton>

                            {currentItem.caption || currentItem.alt ? (
                                <MBadge color="dark" size="sm" rounded className="media-lightbox-caption">
                                    {currentItem.caption || currentItem.alt}
                                </MBadge>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </MPortal>
    )
}
