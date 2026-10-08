import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react'
import type {FocusEvent} from 'react'
import type {MToastEntry} from './MToast.types'
import {cn} from '../../../utils/cn'
import {MCloseIcon} from '../../../icons'
import {MButton} from '../../controls'
import {getStatusIcon} from '../statusIcons'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'
import {getFocusable} from '../../../utils/useModalLayer'

// Where focus goes when a toast that holds it disappears: back to where it came from,
// else to the first Tab stop of an open modal, so it never falls to <body>.
function restoreFocus(origin: HTMLElement | null) {
    if (origin && origin.isConnected && !origin.closest('.toast.item') && !origin.closest('[inert]')) {
        origin.focus()
        return
    }

    const modals = Array.from(document.querySelectorAll<HTMLElement>('[aria-modal="true"]'))
    const modal = modals[modals.length - 1]
    if (!modal) return

    const target = getFocusable(modal)[0] ?? modal
    target.focus()
}

// Single toast notification with enter/exit animation.
export function MToastItem({entry, onDismiss}: {entry: MToastEntry; onDismiss: (id: string) => void}) {
    const texts = useMCommonTexts()
    const [exiting, setExiting] = useState(false)
    const duration = entry.duration ?? 4000
    const itemRef = useRef<HTMLDivElement>(null)
    const focusOriginRef = useRef<HTMLElement | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const remainingRef = useRef(duration)
    const startedAtRef = useRef(0)
    const hoveredRef = useRef(false)
    const focusedRef = useRef(false)

    const pauseTimer = useCallback(() => {
        if (timerRef.current === null) return
        clearTimeout(timerRef.current)
        timerRef.current = null
        remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current))
    }, [])

    const startTimer = useCallback(() => {
        if (duration <= 0 || timerRef.current !== null || hoveredRef.current || focusedRef.current) return
        startedAtRef.current = Date.now()
        timerRef.current = setTimeout(() => {
            timerRef.current = null
            setExiting(true)
        }, remainingRef.current)
    }, [duration])

    useEffect(() => {
        remainingRef.current = duration
        startTimer()
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [duration, startTimer])

    // Runs before the toast's DOM is removed, so focus inside it can still be detected.
    useLayoutEffect(() => {
        const item = itemRef
        const origin = focusOriginRef
        return () => {
            if (item.current && item.current.contains(document.activeElement)) {
                restoreFocus(origin.current)
            }
        }
    }, [])

    function handleEnd() {
        if (exiting) onDismiss(entry.id)
    }

    // Auto-dismiss pauses while the pointer or focus is on the toast (WCAG 2.2.1).
    function handleFocus(event: FocusEvent<HTMLDivElement>) {
        const from = event.relatedTarget as HTMLElement | null
        if (from && !event.currentTarget.contains(from)) {
            focusOriginRef.current = from
        }
        focusedRef.current = true
        pauseTimer()
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        focusedRef.current = false
        startTimer()
    }

    const color = entry.color || 'info'
    const icon =
        entry.icon === false
            ? null
            : entry.icon === undefined || entry.icon === true
              ? getStatusIcon(color)
              : entry.icon

    // Announcements come from the provider's persistent live regions, not from this element.
    return (
        <div
            ref={itemRef}
            className={cn('toast item', `color-${color}`, exiting && 'exit')}
            onAnimationEnd={handleEnd}
            onMouseEnter={() => {
                hoveredRef.current = true
                pauseTimer()
            }}
            onMouseLeave={() => {
                hoveredRef.current = false
                startTimer()
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <div className="toast body">
                {icon && <span className="toast icon">{icon}</span>}
                <div className="toast content">
                    {entry.title && <div className="toast title">{entry.title}</div>}
                    {entry.message !== undefined && entry.message !== null && entry.message !== '' && (
                        <div className="toast message">{entry.message}</div>
                    )}
                </div>
            </div>
            <MButton
                variant="ghost"
                color="neutral"
                iconOnly
                size="xs"
                className="toast close"
                onClick={() => setExiting(true)}
                aria-label={texts.close}
            >
                <MCloseIcon />
            </MButton>
        </div>
    )
}
