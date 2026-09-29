import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Error scene — browser window with warning triangle and broken content.
export const MErrorIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MErrorIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Browser frame */}
                <rect
                    x="28"
                    y="32"
                    width="144"
                    height="136"
                    rx="8"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Title bar */}
                <rect x="28" y="32" width="144" height="20" rx="8" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="28" y="44" width="144" height="8" fill="var(--mineral-surface, #1a1d23)" />
                <circle cx="42" cy="42" r="3" fill="var(--mineral-error, #ef4444)" opacity="0.8" />
                <circle cx="52" cy="42" r="3" fill="var(--mineral-warning, #f59e0b)" opacity="0.8" />
                <circle cx="62" cy="42" r="3" fill="var(--mineral-success, #22c55e)" opacity="0.8" />

                {/* Screen bg */}
                <rect x="34" y="54" width="132" height="108" rx="2" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Warning triangle */}
                <path
                    d="M100 80 L120 114 L80 114 Z"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
                <line
                    x1="100"
                    y1="92"
                    x2="100"
                    y2="104"
                    stroke="var(--illustration-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <circle cx="100" cy="109" r="1.5" fill="var(--illustration-accent)" />

                {/* Broken content lines */}
                <rect x="60" y="124" width="32" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.6" />
                <rect
                    x="108"
                    y="124"
                    width="18"
                    height="3"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.4"
                />
                <rect x="72" y="132" width="56" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.5" />
                <rect x="66" y="140" width="22" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />
                <rect x="96" y="140" width="38" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

                {/* Error accent glow */}
                <ellipse cx="100" cy="100" rx="40" ry="30" fill="var(--illustration-accent)" opacity="0.05" />
            </MIllustration>
        )
    }
)
