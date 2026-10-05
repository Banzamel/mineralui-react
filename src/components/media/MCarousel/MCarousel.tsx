import {useState, useEffect, useCallback, useRef, Children} from 'react'
import type * as React from 'react'
import type {MCarouselProps} from './MCarousel.types'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MChevronLeftIcon, MChevronRightIcon} from '../../../icons'
import './MCarousel.css'
import {useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'

// Render a swipeable content slider with arrows, dots and transition modes.
export function MCarousel({
    autoPlay = false,
    interval = 5000,
    showDots = true,
    showArrows = true,
    loop = true,
    draggable = true,
    transition = 'slide',
    className,
    children,
    ...rest
}: MCarouselProps) {
    const texts = useMCommonTexts()
    const slides = Children.toArray(children)
    const count = slides.length
    const [active, setActive] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const dragStartX = useRef(0)
    const trackRef = useRef<HTMLDivElement>(null)

    const goTo = useCallback(
        (index: number) => {
            if (loop) {
                setActive((index + count) % count)
            } else {
                setActive(Math.max(0, Math.min(index, count - 1)))
            }
        },
        [count, loop]
    )

    const prev = useCallback(() => goTo(active - 1), [active, goTo])
    const next = useCallback(() => goTo(active + 1), [active, goTo])

    useEffect(() => {
        if (!autoPlay || count <= 1 || isDragging) return
        const timer = setInterval(next, interval)
        return () => clearInterval(timer)
    }, [autoPlay, interval, next, count, isDragging])

    const handleDragStart = (clientX: number) => {
        if (!draggable) return
        setIsDragging(true)
        dragStartX.current = clientX
        setDragOffset(0)
    }

    const handleDragMove = (clientX: number) => {
        if (!isDragging) return
        const diff = clientX - dragStartX.current
        setDragOffset(diff)
    }

    const handleDragEnd = () => {
        if (!isDragging) return
        setIsDragging(false)
        const threshold = 50
        if (dragOffset < -threshold) {
            next()
        } else if (dragOffset > threshold) {
            prev()
        }
        setDragOffset(0)
    }

    const onPointerDown = (e: React.PointerEvent) => {
        if (!draggable) return
        e.currentTarget.setPointerCapture(e.pointerId)
        handleDragStart(e.clientX)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        handleDragMove(e.clientX)
    }

    const onPointerUp = () => {
        handleDragEnd()
    }

    if (count === 0) return null

    const isFade = transition === 'fade'
    const trackStyle = !isFade
        ? {transform: `translateX(calc(-${active * 100}% + ${isDragging ? dragOffset : 0}px))`}
        : undefined

    return (
        <div className={cn('carousel', isFade && 'fade', className)} {...rest}>
            <div
                className="carousel-viewport"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    touchAction: draggable ? 'pan-y' : undefined,
                    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : undefined,
                }}
            >
                <div ref={trackRef} className={cn('carousel-track', isDragging && 'dragging')} style={trackStyle}>
                    {slides.map((slide, i) => (
                        <div
                            key={i}
                            className={cn(
                                'carousel-slide',
                                isFade && i === active && 'active',
                                isFade && i !== active && 'hidden'
                            )}
                        >
                            {slide}
                        </div>
                    ))}
                </div>
            </div>

            {showArrows && count > 1 && (
                <>
                    <MButton
                        variant="ghost"
                        color="primary"
                        iconOnly
                        shape="circle"
                        onClick={prev}
                        aria-label={texts.previousSlide}
                        className="carousel-arrow carousel-arrow-prev"
                    >
                        <MChevronLeftIcon />
                    </MButton>
                    <MButton
                        variant="ghost"
                        color="primary"
                        iconOnly
                        shape="circle"
                        onClick={next}
                        aria-label={texts.nextSlide}
                        className="carousel-arrow carousel-arrow-next"
                    >
                        <MChevronRightIcon />
                    </MButton>
                </>
            )}

            {showDots && count > 1 && (
                <div className="carousel-dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={cn('carousel-dot', i === active && 'active')}
                            onClick={() => goTo(i)}
                            aria-label={formatMText(texts.slideNumber, {index: i + 1})}
                            type="button"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
