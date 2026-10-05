import {
    Fragment,
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import type {ReactElement} from 'react'
import type {MTooltipPlacement, MTooltipProps} from './MTooltip.types'
import {cn} from '../../../utils/cn'
import {MPortal} from '../../primitives'
import './MTooltip.css'

const VIEWPORT_MARGIN = 8

const OPPOSITE: Record<MTooltipPlacement, MTooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
}

function computePosition(trigger: DOMRect, bubble: DOMRect, placement: string): {top: number; left: number} {
    const gap = 6
    switch (placement) {
        case 'bottom':
            return {top: trigger.bottom + gap, left: trigger.left + trigger.width / 2 - bubble.width / 2}
        case 'left':
            return {top: trigger.top + trigger.height / 2 - bubble.height / 2, left: trigger.left - bubble.width - gap}
        case 'right':
            return {top: trigger.top + trigger.height / 2 - bubble.height / 2, left: trigger.right + gap}
        default:
            return {top: trigger.top - bubble.height - gap, left: trigger.left + trigger.width / 2 - bubble.width / 2}
    }
}

function fitsViewport(pos: {top: number; left: number}, bubble: DOMRect, placement: MTooltipPlacement): boolean {
    if (placement === 'top') return pos.top >= VIEWPORT_MARGIN
    if (placement === 'bottom') return pos.top + bubble.height <= window.innerHeight - VIEWPORT_MARGIN
    if (placement === 'left') return pos.left >= VIEWPORT_MARGIN
    return pos.left + bubble.width <= window.innerWidth - VIEWPORT_MARGIN
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), Math.max(min, max))
}

// Flip to the opposite side when the preferred one overflows, then keep the bubble on screen.
function resolvePosition(trigger: DOMRect, bubble: DOMRect, placement: MTooltipPlacement) {
    let resolved = placement
    let pos = computePosition(trigger, bubble, placement)

    if (!fitsViewport(pos, bubble, placement)) {
        const flipped = computePosition(trigger, bubble, OPPOSITE[placement])
        if (fitsViewport(flipped, bubble, OPPOSITE[placement])) {
            resolved = OPPOSITE[placement]
            pos = flipped
        }
    }

    return {
        placement: resolved,
        top: clamp(pos.top, VIEWPORT_MARGIN, window.innerHeight - bubble.height - VIEWPORT_MARGIN),
        left: clamp(pos.left, VIEWPORT_MARGIN, window.innerWidth - bubble.width - VIEWPORT_MARGIN),
    }
}

export function MTooltip({content, placement = 'top', delay = 0, className, children, ...rest}: MTooltipProps) {
    const [visible, setVisible] = useState(false)
    const [pos, setPos] = useState<{top: number; left: number; placement: MTooltipPlacement} | null>(null)
    const tooltipId = useId()
    const wrapperRef = useRef<HTMLDivElement>(null)
    const bubbleRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

    const show = useCallback(() => {
        if (delay > 0) {
            timeoutRef.current = setTimeout(() => setVisible(true), delay)
        } else {
            setVisible(true)
        }
    }, [delay])

    const hide = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setVisible(false)
        setPos(null)
    }, [])

    useLayoutEffect(() => {
        if (!visible || !wrapperRef.current || !bubbleRef.current) return
        const triggerRect = wrapperRef.current.getBoundingClientRect()
        const bubbleRect = bubbleRef.current.getBoundingClientRect()
        setPos(resolvePosition(triggerRect, bubbleRect, placement))
    }, [visible, placement])

    // Let keyboard and screen-magnifier users dismiss the bubble without moving focus.
    useEffect(() => {
        if (!visible) return
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') hide()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [visible, hide])

    useEffect(
        () => () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        },
        []
    )

    // Describe the trigger itself, so the tooltip is announced when it receives focus.
    const describedChild =
        visible && isValidElement(children) && children.type !== Fragment
            ? cloneElement(children as ReactElement<{'aria-describedby'?: string}>, {
                  'aria-describedby': [
                      (children as ReactElement<{'aria-describedby'?: string}>).props['aria-describedby'],
                      tooltipId,
                  ]
                      .filter(Boolean)
                      .join(' '),
              })
            : children

    return (
        <div
            ref={wrapperRef}
            className={cn('tooltip wrapper', className)}
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            {...rest}
        >
            {describedChild}
            {visible && (
                <MPortal>
                    <div
                        ref={bubbleRef}
                        id={tooltipId}
                        className={cn('tooltip bubble', pos?.placement ?? placement)}
                        role="tooltip"
                        style={pos ? {top: pos.top, left: pos.left} : {visibility: 'hidden'}}
                    >
                        {content}
                    </div>
                </MPortal>
            )}
        </div>
    )
}
