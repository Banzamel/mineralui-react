import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Empty state scene — open box with no content, subtle sparkles.
export const MEmptyStateIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MEmptyStateIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Shadow under box */}
                <ellipse cx="100" cy="168" rx="52" ry="6" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

                {/* Box body */}
                <path
                    d="M52 92 L52 154 C52 158 55 161 59 161 L141 161 C145 161 148 158 148 154 L148 92"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Box inner shadow */}
                <rect x="58" y="96" width="84" height="60" rx="2" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.5" />

                {/* Left flap */}
                <path
                    d="M48 92 L72 68 L100 82 L52 92 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Right flap */}
                <path
                    d="M152 92 L128 68 L100 82 L148 92 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Flap highlight */}
                <path d="M100 82 L100 92" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />

                {/* Accent stripe on box */}
                <rect x="52" y="92" width="96" height="4" fill="var(--illustration-accent)" opacity="0.3" />

                {/* Sparkle top-left */}
                <circle cx="68" cy="50" r="2" fill="var(--illustration-accent)" opacity="0.6" />
                <line
                    x1="68"
                    y1="44"
                    x2="68"
                    y2="56"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    opacity="0.4"
                />
                <line
                    x1="62"
                    y1="50"
                    x2="74"
                    y2="50"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    opacity="0.4"
                />

                {/* Sparkle top-right */}
                <circle cx="138" cy="44" r="1.5" fill="var(--illustration-accent)" opacity="0.5" />
                <line
                    x1="138"
                    y1="39"
                    x2="138"
                    y2="49"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    opacity="0.3"
                />
                <line
                    x1="133"
                    y1="44"
                    x2="143"
                    y2="44"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    opacity="0.3"
                />

                {/* Sparkle small */}
                <circle cx="156" cy="72" r="1" fill="var(--illustration-accent)" opacity="0.4" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="110" rx="50" ry="40" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
