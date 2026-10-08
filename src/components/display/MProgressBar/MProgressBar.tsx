import {useState, useEffect, useRef, useCallback} from 'react'
import type {MProgressBarProps} from './MProgressBar.types'
import {cn} from '../../../utils/cn'
import './MProgressBar.css'

const DURATION = 800

function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3)
}

// Render a horizontal bar that fills to represent progress as a percentage.
export function MProgressBar({
    value,
    max = 100,
    color = 'primary',
    size = 'md',
    label,
    showValue = false,
    animated = false,
    striped = false,
    className,
    ...rest
}: MProgressBarProps) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100))
    const [displayPercent, setDisplayPercent] = useState(0)
    const [barPercent, setBarPercent] = useState(0)
    const prevPercent = useRef(0)
    const rafRef = useRef(0)

    const animate = useCallback((from: number, to: number) => {
        cancelAnimationFrame(rafRef.current)

        // Reduced motion: jump straight to the value instead of counting up.
        if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setBarPercent(to)
            setDisplayPercent(to)
            return
        }
        const start = performance.now()

        const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / DURATION, 1)
            const eased = easeOutCubic(progress)
            const current = from + (to - from) * eased

            setDisplayPercent(current)
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step)
            }
        }

        // Set bar width immediately for CSS transition
        setBarPercent(to)
        rafRef.current = requestAnimationFrame(step)
    }, [])

    useEffect(() => {
        animate(prevPercent.current, percent)
        prevPercent.current = percent
        return () => cancelAnimationFrame(rafRef.current)
    }, [percent, animate])

    return (
        <div
            className={cn('progress-bar', `color-${color}`, size, className)}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label}
            {...rest}
        >
            {(label || showValue) && (
                <div className="progress-bar-header">
                    {label && <span className="progress-bar-label">{label}</span>}
                    {showValue && <span className="progress-bar-value">{Math.round(displayPercent)}%</span>}
                </div>
            )}
            <div className="progress-bar-track">
                <div
                    className={cn('progress-bar-fill', animated && 'animated', striped && 'striped')}
                    style={{width: `${barPercent}%`}}
                />
            </div>
        </div>
    )
}
