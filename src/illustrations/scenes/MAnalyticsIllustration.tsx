import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Analytics scene — pie chart with floating data cards and trend line.
export const MAnalyticsIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MAnalyticsIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Pie chart */}
                <circle
                    cx="76"
                    cy="96"
                    r="40"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />

                {/* Pie slice 1 — accent ~40% */}
                <path d="M76 56 A40 40 0 0 1 110 116 L76 96 Z" fill="var(--illustration-accent)" opacity="0.8" />

                {/* Pie slice 2 — info ~25% */}
                <path d="M110 116 A40 40 0 0 1 56 124 L76 96 Z" fill="var(--mineral-info, #3b82f6)" opacity="0.5" />

                {/* Pie slice 3 — warning ~20% */}
                <path d="M56 124 A40 40 0 0 1 44 76 L76 96 Z" fill="var(--mineral-warning, #f59e0b)" opacity="0.5" />

                {/* Pie slice 4 — rest */}
                <path d="M44 76 A40 40 0 0 1 76 56 L76 96 Z" fill="var(--mineral-border, #3a3f47)" opacity="0.5" />

                {/* Pie center hole (donut style) */}
                <circle cx="76" cy="96" r="18" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Percentage in center */}
                <text
                    x="76"
                    y="100"
                    textAnchor="middle"
                    fontFamily="inherit"
                    fontSize="12"
                    fontWeight="bold"
                    fill="var(--illustration-accent)"
                    opacity="0.8"
                >
                    40%
                </text>

                {/* Data card top-right */}
                <rect
                    x="126"
                    y="36"
                    width="60"
                    height="36"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect
                    x="132"
                    y="44"
                    width="24"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                />
                <rect x="132" y="52" width="32" height="5" rx="1" fill="var(--illustration-accent)" opacity="0.7" />
                <rect
                    x="132"
                    y="62"
                    width="16"
                    height="2"
                    rx="1"
                    fill="var(--mineral-success, #22c55e)"
                    opacity="0.5"
                />

                {/* Data card bottom-right */}
                <rect
                    x="126"
                    y="82"
                    width="60"
                    height="36"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect
                    x="132"
                    y="90"
                    width="20"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                />
                <rect x="132" y="98" width="28" height="5" rx="1" fill="var(--mineral-info, #3b82f6)" opacity="0.6" />
                <rect
                    x="132"
                    y="108"
                    width="18"
                    height="2"
                    rx="1"
                    fill="var(--mineral-warning, #f59e0b)"
                    opacity="0.5"
                />

                {/* Trend line area */}
                <rect
                    x="34"
                    y="148"
                    width="140"
                    height="32"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                />
                <polyline
                    points="42,170 58,164 74,168 90,158 106,162 122,154 138,156 154,148 166,152"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                />

                {/* Glow */}
                <ellipse cx="100" cy="100" rx="60" ry="50" fill="var(--illustration-accent)" opacity="0.03" />
            </MIllustration>
        )
    }
)
