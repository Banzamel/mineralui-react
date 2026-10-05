import {useEffect, useState} from 'react'
import type {MToastEntry} from './MToast.types'
import {cn} from '../../../utils/cn'
import {MCloseIcon} from '../../../icons'
import {MButton} from '../../controls'
import {getStatusIcon} from '../statusIcons'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Single toast notification with enter/exit animation.
export function MToastItem({entry, onDismiss}: {entry: MToastEntry; onDismiss: (id: string) => void}) {
    const texts = useMCommonTexts()
    const [exiting, setExiting] = useState(false)
    const duration = entry.duration ?? 4000

    useEffect(() => {
        if (duration <= 0) return
        const timer = setTimeout(() => setExiting(true), duration)
        return () => clearTimeout(timer)
    }, [duration])

    function handleEnd() {
        if (exiting) onDismiss(entry.id)
    }

    const color = entry.color || 'info'
    const icon =
        entry.icon === false
            ? null
            : entry.icon === undefined || entry.icon === true
              ? getStatusIcon(color)
              : entry.icon

    return (
        <div className={cn('toast item', `color-${color}`, exiting && 'exit')} role="status" onAnimationEnd={handleEnd}>
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
