import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Search scene — magnifying glass hovering over document cards.
export const MSearchIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MSearchIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Background card 1 */}
                <rect
                    x="32"
                    y="56"
                    width="72"
                    height="92"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect
                    x="40"
                    y="68"
                    width="36"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                />
                <rect x="40" y="76" width="52" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.4" />
                <rect x="40" y="84" width="44" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />
                <rect x="40" y="96" width="56" height="24" rx="3" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.5" />
                <rect x="40" y="128" width="48" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

                {/* Background card 2 */}
                <rect
                    x="96"
                    y="72"
                    width="72"
                    height="92"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect
                    x="104"
                    y="84"
                    width="40"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                />
                <rect x="104" y="92" width="52" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.4" />
                <rect
                    x="104"
                    y="100"
                    width="36"
                    height="3"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.3"
                />
                <rect x="104" y="112" width="48" height="20" rx="3" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.5" />
                <rect
                    x="104"
                    y="140"
                    width="42"
                    height="3"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.3"
                />

                {/* Highlight on card matching search */}
                <rect
                    x="40"
                    y="94"
                    width="58"
                    height="28"
                    rx="3"
                    fill="var(--illustration-accent)"
                    opacity="0.15"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                />

                {/* Magnifying glass */}
                <circle
                    cx="120"
                    cy="52"
                    r="24"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                />
                <circle
                    cx="120"
                    cy="52"
                    r="16"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    opacity="0.25"
                />
                <line
                    x1="138"
                    y1="69"
                    x2="152"
                    y2="88"
                    stroke="var(--illustration-accent)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.8"
                />

                {/* Search dots inside lens */}
                <circle cx="112" cy="48" r="2" fill="var(--illustration-accent)" opacity="0.4" />
                <circle cx="120" cy="52" r="2" fill="var(--illustration-accent)" opacity="0.5" />
                <circle cx="128" cy="48" r="2" fill="var(--illustration-accent)" opacity="0.4" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="60" ry="50" fill="var(--illustration-accent)" opacity="0.03" />
            </MIllustration>
        )
    }
)
