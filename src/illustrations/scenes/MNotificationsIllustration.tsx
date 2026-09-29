import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Notifications scene — bell with stacked notification cards.
export const MNotificationsIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MNotificationsIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Bell body */}
                <path
                    d="M100 32 C100 32 68 40 68 80 L68 108 L56 120 L144 120 L132 108 L132 80 C132 40 100 32 100 32 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="2"
                />

                {/* Bell inner shadow */}
                <path
                    d="M100 40 C100 40 76 46 76 80 L76 104 L68 112 L132 112 L124 104 L124 80 C124 46 100 40 100 40 Z"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    opacity="0.4"
                />

                {/* Bell clapper */}
                <ellipse
                    cx="100"
                    cy="124"
                    rx="12"
                    ry="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                />

                {/* Bell top knob */}
                <circle cx="100" cy="30" r="4" fill="var(--illustration-accent)" opacity="0.7" />

                {/* Sound waves left */}
                <path
                    d="M54 72 C48 78 48 92 54 98"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.3"
                />
                <path
                    d="M46 66 C38 76 38 96 46 106"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.2"
                />

                {/* Sound waves right */}
                <path
                    d="M146 72 C152 78 152 92 146 98"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.3"
                />
                <path
                    d="M154 66 C162 76 162 96 154 106"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.2"
                />

                {/* Notification badge */}
                <circle cx="128" cy="48" r="12" fill="var(--illustration-accent)" />
                <text
                    x="128"
                    y="53"
                    textAnchor="middle"
                    fontFamily="inherit"
                    fontSize="12"
                    fontWeight="bold"
                    fill="var(--mineral-text-inverted, #ffffff)"
                >
                    5
                </text>

                {/* Notification card 1 */}
                <rect
                    x="44"
                    y="136"
                    width="112"
                    height="20"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                />
                <circle cx="58" cy="146" r="5" fill="var(--illustration-accent)" opacity="0.4" />
                <rect
                    x="68"
                    y="142"
                    width="40"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                />
                <rect x="68" y="148" width="28" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />
                <circle cx="146" cy="146" r="3" fill="var(--illustration-accent)" opacity="0.6" />

                {/* Notification card 2 */}
                <rect
                    x="50"
                    y="160"
                    width="100"
                    height="18"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                    opacity="0.7"
                />
                <circle cx="62" cy="169" r="4" fill="var(--mineral-info, #3b82f6)" opacity="0.3" />
                <rect
                    x="70"
                    y="166"
                    width="36"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.35"
                />
                <rect x="70" y="172" width="24" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.2" />

                {/* Glow */}
                <ellipse cx="100" cy="90" rx="48" ry="44" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
