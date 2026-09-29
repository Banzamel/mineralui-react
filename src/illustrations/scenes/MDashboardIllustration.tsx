import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Dashboard scene — monitor with chart, KPI cards and UI chrome.
// Colors adapt via --illustration-accent and --mineral-* tokens.
export const MDashboardIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MDashboardIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Monitor stand */}
                <rect x="85" y="160" width="30" height="8" rx="2" fill="var(--mineral-border, #3a3f47)" />
                <rect x="92" y="148" width="16" height="14" rx="1" fill="var(--mineral-border, #3a3f47)" />

                {/* Monitor frame */}
                <rect
                    x="24"
                    y="28"
                    width="152"
                    height="124"
                    rx="8"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Screen background */}
                <rect x="32" y="36" width="136" height="108" rx="4" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Top bar */}
                <rect x="36" y="40" width="128" height="10" rx="2" fill="var(--mineral-surface, #1a1d23)" />
                <circle cx="42" cy="45" r="2" fill="var(--mineral-error, #ef4444)" opacity="0.7" />
                <circle cx="49" cy="45" r="2" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                <circle cx="56" cy="45" r="2" fill="var(--mineral-success, #22c55e)" opacity="0.7" />
                <rect x="100" y="43" width="56" height="4" rx="2" fill="var(--mineral-border, #3a3f47)" />

                {/* KPI card 1 */}
                <rect x="36" y="54" width="38" height="24" rx="3" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="40" y="58" width="16" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />
                <rect x="40" y="64" width="24" height="5" rx="1" fill="var(--illustration-accent)" />
                <rect x="40" y="72" width="12" height="2" rx="1" fill="var(--mineral-success, #22c55e)" opacity="0.6" />

                {/* KPI card 2 */}
                <rect x="78" y="54" width="38" height="24" rx="3" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="82" y="58" width="16" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />
                <rect x="82" y="64" width="20" height="5" rx="1" fill="var(--illustration-accent)" opacity="0.7" />
                <rect x="82" y="72" width="14" height="2" rx="1" fill="var(--mineral-warning, #f59e0b)" opacity="0.6" />

                {/* KPI card 3 */}
                <rect x="120" y="54" width="40" height="24" rx="3" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="124" y="58" width="18" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />
                <rect x="124" y="64" width="26" height="5" rx="1" fill="var(--illustration-accent)" opacity="0.5" />
                <rect x="124" y="72" width="10" height="2" rx="1" fill="var(--mineral-info, #3b82f6)" opacity="0.6" />

                {/* Chart area */}
                <rect x="36" y="82" width="80" height="56" rx="3" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="40" y="86" width="30" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />

                {/* Chart bars */}
                <rect x="44" y="118" width="8" height="14" rx="1.5" fill="var(--illustration-accent)" opacity="0.35" />
                <rect x="56" y="110" width="8" height="22" rx="1.5" fill="var(--illustration-accent)" opacity="0.5" />
                <rect x="68" y="104" width="8" height="28" rx="1.5" fill="var(--illustration-accent)" opacity="0.7" />
                <rect x="80" y="96" width="8" height="36" rx="1.5" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="92" y="100" width="8" height="32" rx="1.5" fill="var(--illustration-accent)" />

                {/* Chart trend line */}
                <polyline
                    points="48,116 60,108 72,102 84,94 96,98"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                />

                {/* Sidebar / list panel */}
                <rect x="120" y="82" width="40" height="56" rx="3" fill="var(--mineral-surface, #1a1d23)" />
                <rect x="124" y="86" width="24" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />

                {/* List items */}
                <rect x="124" y="93" width="32" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />
                <rect x="124" y="101" width="28" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />
                <rect x="124" y="109" width="32" height="4" rx="1" fill="var(--illustration-accent)" opacity="0.4" />
                <rect x="124" y="117" width="24" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />
                <rect x="124" y="125" width="30" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />

                {/* Decorative glow behind monitor */}
                <ellipse cx="100" cy="100" rx="60" ry="50" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
