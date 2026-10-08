import {useState, useRef} from 'react'
import type {MBannerProps} from './MBanner.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MCloseIcon} from '../../../icons'
import './MBanner.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

// Render a prominent banner for announcements, CTAs or dismissible messages.
export function MBanner({
    color = 'primary',
    variant = 'filled',
    icon,
    action,
    hidden,
    hiddenAbove,
    dismissible = false,
    onDismiss,
    className,
    children,
    ...rest
}: MBannerProps) {
    const texts = useMCommonTexts()
    const [visible, setVisible] = useState(true)
    const [dismissing, setDismissing] = useState(false)
    const wrapRef = useRef<HTMLDivElement>(null)

    if (!visible) return null

    const handleDismiss = () => {
        if (dismissing) return
        setDismissing(true)
        const el = wrapRef.current
        if (!el) {
            setVisible(false)
            onDismiss?.()
            return
        }
        // Finish once: when the wrapper's height collapse ends, or after the fallback timeout.
        let done = false
        const finish = () => {
            if (done) return
            done = true
            el.removeEventListener('transitionend', onTransitionEnd)
            window.clearTimeout(fallback)
            setVisible(false)
            setDismissing(false)
            onDismiss?.()
        }
        const onTransitionEnd = (event: TransitionEvent) => {
            if (event.target === el && event.propertyName === 'grid-template-rows') finish()
        }
        el.addEventListener('transitionend', onTransitionEnd)
        const fallback = window.setTimeout(finish, 1000)
    }

    return (
        <div
            ref={wrapRef}
            className={cn('banner-wrap', dismissing && 'dismissing')}
            {...getHiddenProps(hidden, hiddenAbove)}
        >
            <div className={cn('banner', `color-${color}`, variant, className)} {...rest}>
                {icon && <span className="banner-icon">{icon}</span>}
                <div className="banner-content">{children}</div>
                {action && <div className="banner-action">{action}</div>}
                {dismissible && (
                    <MButton
                        variant="link"
                        color="neutral"
                        iconOnly
                        size="sm"
                        className="banner-dismiss"
                        onClick={handleDismiss}
                        aria-label={texts.dismiss}
                    >
                        <MCloseIcon />
                    </MButton>
                )}
            </div>
        </div>
    )
}
