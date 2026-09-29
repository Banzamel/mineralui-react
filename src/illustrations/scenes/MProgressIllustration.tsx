import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Progress scene — horizontal milestone track with a small figure walking along it (gamification feel).
export const MProgressIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MProgressIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="78" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="86" ry="58" fill="var(--illustration-accent)" opacity="0.06" />

                {/* Progress bar background (track) */}
                <rect
                    x="22"
                    y="120"
                    width="156"
                    height="14"
                    rx="7"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Filled portion (60%) */}
                <rect x="22" y="120" width="94" height="14" rx="7" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Milestone markers (5 dots) */}
                <g>
                    {/* M1 — done */}
                    <circle cx="40" cy="127" r="9" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-success, #22c55e)" strokeWidth="2" />
                    <path d="M36 127 L39 130 L44 124" fill="none" stroke="var(--mineral-success, #22c55e)" strokeWidth="2" strokeLinecap="round" />

                    {/* M2 — done */}
                    <circle cx="74" cy="127" r="9" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-success, #22c55e)" strokeWidth="2" />
                    <path d="M70 127 L73 130 L78 124" fill="none" stroke="var(--mineral-success, #22c55e)" strokeWidth="2" strokeLinecap="round" />

                    {/* M3 — current */}
                    <circle cx="108" cy="127" r="11" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--illustration-accent)" strokeWidth="2.5" />
                    <circle cx="108" cy="127" r="4" fill="var(--illustration-accent)" />

                    {/* M4 — pending */}
                    <circle cx="142" cy="127" r="9" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    <text x="142" y="131" textAnchor="middle" fontFamily="inherit" fontSize="9" fontWeight="bold" fill="var(--mineral-text-secondary, #6b7280)">4</text>

                    {/* M5 — pending (final / star) */}
                    <circle cx="176" cy="127" r="11" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    <polygon points="176,121 178,126 183,126 179,129 181,134 176,131 171,134 173,129 169,126 174,126" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                </g>

                {/* Walking figure on top of M3 */}
                <g transform="translate(108 86)">
                    {/* Head */}
                    <circle cx="0" cy="-8" r="7" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    {/* Body */}
                    <rect x="-6" y="-1" width="12" height="18" rx="3" fill="var(--illustration-accent)" />
                    {/* Backpack hint */}
                    <rect x="-9" y="2" width="5" height="10" rx="1.5" fill="var(--mineral-info, #3b82f6)" opacity="0.7" />
                    {/* Legs (mid-stride) */}
                    <line x1="-3" y1="17" x2="-6" y2="26" stroke="var(--mineral-border, #3a3f47)" strokeWidth="3" strokeLinecap="round" />
                    <line x1="3" y1="17" x2="6" y2="26" stroke="var(--mineral-border, #3a3f47)" strokeWidth="3" strokeLinecap="round" />
                    {/* Eyes */}
                    <circle cx="-2" cy="-8" r="1" fill="var(--mineral-text, #f5f5fa)" />
                    <circle cx="2" cy="-8" r="1" fill="var(--mineral-text, #f5f5fa)" />
                </g>

                {/* Percentage label */}
                <text x="100" y="62" textAnchor="middle" fontFamily="inherit" fontSize="22" fontWeight="bold" fill="var(--illustration-accent)">60%</text>
                <rect x="78" y="70" width="44" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />

                {/* Floor line */}
                <line x1="22" y1="148" x2="178" y2="148" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" opacity="0.5" />
            </MIllustration>
        )
    }
)
