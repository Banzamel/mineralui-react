import {useState, useEffect, useCallback, useId, useRef, Children} from 'react'
import type * as React from 'react'
import type {MCarouselProps} from './MCarousel.types'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MChevronLeftIcon, MChevronRightIcon, MPlayIcon, MStopIcon} from '../../../icons'
import {getCarouselKeyStep, usePrefersReducedMotion} from '../carouselA11y'
import './MCarousel.css'
import {useMCommonTexts, useMMediaTexts, formatMText} from '../../../i18n/frameworkTexts'

type RotationChoice = 'auto' | 'stopped' | 'running'

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
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    ...rest
}: MCarouselProps) {
    const texts = useMCommonTexts()
    const mediaTexts = useMMediaTexts()
    const trackId = `${useId()}-carousel-track`
    const reducedMotion = usePrefersReducedMotion()
    // APG carousel: auto-rotation has an explicit stop / start control, pauses while the pointer
    // hovers the carousel or keyboard focus is inside it, and starts stopped under reduced motion.
    const [rotationChoice, setRotationChoice] = useState<RotationChoice>('auto')
    const [hovered, setHovered] = useState(false)
    const [focusInside, setFocusInside] = useState(false)
    const rotationButtonRef = useRef<HTMLElement | null>(null)
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

    const canRotate = autoPlay && count > 1
    const rotating = canRotate && (rotationChoice === 'running' || (rotationChoice === 'auto' && !reducedMotion))
    const paused = hovered || focusInside || isDragging

    useEffect(() => {
        if (!rotating || paused) return
        const timer = setInterval(next, interval)
        return () => clearInterval(timer)
    }, [rotating, paused, interval, next])

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

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        // Focus on the rotation control itself does not pause, so "Start" takes effect at once.
        setFocusInside(!rotationButtonRef.current?.contains(event.target as Node))
        onFocus?.(event)
    }

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        const nextTarget = event.relatedTarget as Node | null
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) setFocusInside(false)
        onBlur?.(event)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || count <= 1) return
        const step = getCarouselKeyStep(event)
        if (step === null) return
        event.preventDefault()
        goTo(active + step)
    }

    const isFade = transition === 'fade'
    const trackStyle = !isFade
        ? {transform: `translateX(calc(-${active * 100}% + ${isDragging ? dragOffset : 0}px))`}
        : undefined

    return (
        <div
            className={cn('carousel', isFade && 'fade', className)}
            role="region"
            aria-roledescription={mediaTexts.carouselRoleDescription}
            aria-label={rest['aria-labelledby'] ? undefined : mediaTexts.carouselLabel}
            {...rest}
            onMouseEnter={(event) => {
                setHovered(true)
                onMouseEnter?.(event)
            }}
            onMouseLeave={(event) => {
                setHovered(false)
                onMouseLeave?.(event)
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {canRotate && (
                <MButton
                    ref={rotationButtonRef}
                    variant="ghost"
                    color="primary"
                    iconOnly
                    shape="circle"
                    size="sm"
                    className="carousel-rotation"
                    aria-label={rotating ? mediaTexts.stopRotation : mediaTexts.startRotation}
                    aria-controls={trackId}
                    onClick={() => setRotationChoice(rotating ? 'stopped' : 'running')}
                >
                    {rotating ? <MStopIcon /> : <MPlayIcon />}
                </MButton>
            )}
            <div
                className="carousel-viewport"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onDragStart={(e) => {
                    // A native image/link drag would end the swipe with pointercancel.
                    if (draggable) e.preventDefault()
                }}
                style={{
                    touchAction: draggable ? 'pan-y' : undefined,
                    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : undefined,
                }}
            >
                <div
                    ref={trackRef}
                    id={trackId}
                    className={cn('carousel-track', isDragging && 'dragging')}
                    style={trackStyle}
                    aria-live={rotating && !paused ? 'off' : 'polite'}
                >
                    {slides.map((slide, i) => (
                        <div
                            key={i}
                            className={cn(
                                'carousel-slide',
                                isFade && i === active && 'active',
                                isFade && i !== active && 'hidden'
                            )}
                            role="group"
                            aria-roledescription={mediaTexts.slideRoleDescription}
                            aria-label={formatMText(mediaTexts.slideOf, {index: i + 1, count})}
                            // Off-screen slides stay out of the Tab order and the accessibility tree.
                            aria-hidden={i !== active || undefined}
                            inert={i !== active ? true : undefined}
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
                        aria-controls={trackId}
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
                        aria-controls={trackId}
                        className="carousel-arrow carousel-arrow-next"
                    >
                        <MChevronRightIcon />
                    </MButton>
                </>
            )}

            {showDots && count > 1 && (
                <div className="carousel-dots" role="group" aria-label={mediaTexts.chooseSlide}>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={cn('carousel-dot', i === active && 'active')}
                            onClick={() => goTo(i)}
                            aria-label={formatMText(texts.slideNumber, {index: i + 1})}
                            aria-current={i === active ? 'true' : undefined}
                            aria-controls={trackId}
                            type="button"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
