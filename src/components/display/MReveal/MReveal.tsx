import {useEffect, useRef} from 'react'
import type {CSSProperties} from 'react'
import type {MRevealProps} from './MReveal.types'
import {cn} from '../../../utils/cn'

function getRevealOffset(direction: MRevealProps['direction'], distance: number) {
    switch (direction) {
        case 'down':
            return {x: 0, y: -distance}
        case 'left':
            return {x: distance, y: 0}
        case 'right':
            return {x: -distance, y: 0}
        case 'none':
            return {x: 0, y: 0}
        case 'up':
        default:
            return {x: 0, y: distance}
    }
}

export function MReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.46,
    distance = 20,
    once = true,
    trigger = 'view',
    className,
    style,
    ...rest
}: MRevealProps) {
    const revealRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const node = revealRef.current
        if (!node) {
            return
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        node.classList.remove('revealed')

        if (prefersReducedMotion) {
            node.classList.add('revealed')
            return
        }

        if (trigger === 'mount') {
            const frame = window.requestAnimationFrame(() => {
                node.classList.add('revealed')
            })

            return () => window.cancelAnimationFrame(frame)
        }

        // 2.9.1: an element taller than 5 viewports can never show 20% of itself, so it also reveals once
        // it fills half the viewport. A segment at least half the viewport tall always covers the centre
        // line, and an element crossing that line shows at least that much (or all of itself), so a
        // zero-height root at the centre tests this at any height. The browser re-evaluates both observers
        // on every layout, which covers elements that grow after mount.
        const inView = {ratio: false, centerLine: false}
        const observers: IntersectionObserver[] = []
        const stopObserving = () => observers.forEach((observer) => observer.disconnect())

        const watch = (key: keyof typeof inView, options: IntersectionObserverInit) => {
            const observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    inView[key] = entry.isIntersecting
                }

                if (inView.ratio || inView.centerLine) {
                    node.classList.add('revealed')
                    if (once) {
                        stopObserving()
                    }
                } else if (!once) {
                    node.classList.remove('revealed')
                }
            }, options)

            observers.push(observer)
            observer.observe(node)
        }

        watch('ratio', {threshold: 0.2})
        watch('centerLine', {rootMargin: '-50% 0px -50% 0px', threshold: 0})

        return stopObserving
    }, [delay, direction, distance, duration, once, trigger])

    const offset = getRevealOffset(direction, distance)
    const revealStyle = {
        minWidth: 0,
        maxWidth: '100%',
        '--reveal-delay': `${delay}s`,
        '--reveal-duration': `${duration}s`,
        '--reveal-translate-x': `${offset.x}px`,
        '--reveal-translate-y': `${offset.y}px`,
        ...style,
    } as CSSProperties

    return (
        <div ref={revealRef} className={cn('reveal', className)} style={revealStyle} {...rest}>
            {children}
        </div>
    )
}
