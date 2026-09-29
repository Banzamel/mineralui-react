import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Mail scene — envelope with notification badge and decorative lines.
export const MMailIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(function MMailIllustration(props, ref) {
    return (
        <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
            {/* Shadow */}
            <ellipse cx="100" cy="162" rx="58" ry="6" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

            {/* Envelope body */}
            <rect
                x="30"
                y="60"
                width="140"
                height="96"
                rx="6"
                fill="var(--mineral-surface, #1a1d23)"
                stroke="var(--mineral-border, #3a3f47)"
                strokeWidth="2"
            />

            {/* Inner paper peeking out */}
            <rect x="42" y="52" width="116" height="70" rx="3" fill="var(--mineral-surface-contrast, #13151a)" />
            <rect
                x="54"
                y="64"
                width="60"
                height="3"
                rx="1"
                fill="var(--mineral-text-secondary, #6b7280)"
                opacity="0.5"
            />
            <rect x="54" y="72" width="80" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.4" />
            <rect x="54" y="80" width="48" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

            {/* Envelope flap */}
            <path
                d="M30 60 L100 110 L170 60"
                fill="none"
                stroke="var(--mineral-border, #3a3f47)"
                strokeWidth="2"
                strokeLinejoin="round"
            />

            {/* Envelope flap fill */}
            <path
                d="M32 62 L100 108 L168 62 L168 60 C168 57 166 55 163 55 L37 55 C34 55 32 57 32 60 Z"
                fill="var(--mineral-surface, #1a1d23)"
            />
            <path
                d="M32 62 L100 108 L168 62"
                fill="none"
                stroke="var(--illustration-accent)"
                strokeWidth="2"
                strokeLinejoin="round"
                opacity="0.6"
            />

            {/* Bottom fold lines */}
            <line
                x1="30"
                y1="156"
                x2="72"
                y2="120"
                stroke="var(--mineral-border, #3a3f47)"
                strokeWidth="1"
                opacity="0.3"
            />
            <line
                x1="170"
                y1="156"
                x2="128"
                y2="120"
                stroke="var(--mineral-border, #3a3f47)"
                strokeWidth="1"
                opacity="0.3"
            />

            {/* Notification badge */}
            <circle cx="156" cy="52" r="14" fill="var(--illustration-accent)" />
            <text
                x="156"
                y="57"
                textAnchor="middle"
                fontFamily="inherit"
                fontSize="14"
                fontWeight="bold"
                fill="var(--mineral-text-inverted, #ffffff)"
            >
                3
            </text>

            {/* Decorative sparkle */}
            <circle cx="40" cy="40" r="1.5" fill="var(--illustration-accent)" opacity="0.4" />
            <circle cx="52" cy="34" r="1" fill="var(--illustration-accent)" opacity="0.3" />

            {/* Decorative glow */}
            <ellipse cx="100" cy="105" rx="56" ry="40" fill="var(--illustration-accent)" opacity="0.04" />
        </MIllustration>
    )
})
