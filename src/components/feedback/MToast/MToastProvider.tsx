import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {MPortal} from '../../primitives'
import {MToastContextProvider, useMToast} from './MToastContext'
import {MToastItem} from './MToastItem'
import type {MToastEntry, MToastOptions, MToastProviderProps} from './MToast.types'
import {cn} from '../../../utils/cn'
import './MToast.css'

let counter = 0

// Screen readers often skip live regions created together with their text, so both regions
// exist from mount and the text arrives a moment later.
const ANNOUNCE_DELAY = 100

type MToastPoliteness = 'polite' | 'assertive'

function MToastAnnouncement({entry}: {entry: MToastEntry | null}) {
    if (!entry) return null
    return (
        <>
            {entry.title}
            {entry.title && entry.message ? ' ' : null}
            {entry.message}
        </>
    )
}

// Global toast container with auto-dismiss and stacking.
export function MToastProvider({position = 'top-right', duration = 4000, children}: MToastProviderProps) {
    const [toasts, setToasts] = useState<MToastEntry[]>([])
    const defaultDuration = useRef(duration)
    defaultDuration.current = duration
    const [announcements, setAnnouncements] = useState<Record<MToastPoliteness, MToastEntry | null>>({
        polite: null,
        assertive: null,
    })
    const announceTimers = useRef<Partial<Record<MToastPoliteness, ReturnType<typeof setTimeout>>>>({})

    useEffect(() => {
        const timers = announceTimers.current
        return () => {
            Object.values(timers).forEach((timer) => clearTimeout(timer))
        }
    }, [])

    const announce = useCallback((entry: MToastEntry) => {
        // Errors interrupt (role="alert"); everything else waits its turn (role="status").
        const politeness: MToastPoliteness = entry.color === 'error' ? 'assertive' : 'polite'
        clearTimeout(announceTimers.current[politeness])
        setAnnouncements((prev) => ({...prev, [politeness]: null}))
        announceTimers.current[politeness] = setTimeout(() => {
            setAnnouncements((prev) => ({...prev, [politeness]: entry}))
        }, ANNOUNCE_DELAY)
    }, [])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = useCallback(
        (options: MToastOptions) => {
            const id = `toast-${++counter}`
            const entry: MToastEntry = {
                id,
                ...options,
                duration: options.duration ?? defaultDuration.current,
            }
            setToasts((prev) => [...prev, entry])
            announce(entry)
            return id
        },
        [announce]
    )

    const ctx = useMemo(() => ({toast, dismiss}), [toast, dismiss])

    return (
        <MToastContextProvider value={ctx}>
            {children}
            <MPortal>
                <div className={cn('toast container', position)}>
                    <div className="toast live" role="status" aria-live="polite" aria-atomic="true">
                        <MToastAnnouncement entry={announcements.polite} />
                    </div>
                    <div className="toast live" role="alert" aria-live="assertive" aria-atomic="true">
                        <MToastAnnouncement entry={announcements.assertive} />
                    </div>
                    {toasts.map((entry) => (
                        <MToastItem key={entry.id} entry={entry} onDismiss={dismiss} />
                    ))}
                </div>
            </MPortal>
        </MToastContextProvider>
    )
}

export {useMToast}
