import {forwardRef, useId} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Conflict scene — two overlapping calendar events on a small grid with a warning badge over the collision.
export const MConflictIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MConflictIllustration(props, ref) {
        // Unique per instance so two illustrations on one page do not share the pattern id.
        const hatchId = `conflictHatch-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="68" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="84" ry="62" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Calendar / timeline grid card */}
                <rect
                    x="26"
                    y="32"
                    width="148"
                    height="120"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Header band */}
                <rect x="26" y="32" width="148" height="18" rx="6" fill="var(--illustration-accent)" opacity="0.18" />
                <rect x="26" y="44" width="148" height="6" fill="var(--illustration-accent)" opacity="0.18" />
                {/* Day labels */}
                <rect x="36" y="38" width="8" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="60" y="38" width="8" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="86" y="38" width="8" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="112" y="38" width="8" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="138" y="38" width="8" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="160" y="38" width="6" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />

                {/* Hour rows (horizontal grid lines) */}
                <g stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" opacity="0.5">
                    <line x1="26" y1="64" x2="174" y2="64" />
                    <line x1="26" y1="80" x2="174" y2="80" />
                    <line x1="26" y1="96" x2="174" y2="96" />
                    <line x1="26" y1="112" x2="174" y2="112" />
                    <line x1="26" y1="128" x2="174" y2="128" />
                </g>

                {/* Hour labels (left margin) */}
                <rect x="30" y="62" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />
                <rect x="30" y="78" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />
                <rect x="30" y="94" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />
                <rect x="30" y="110" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />
                <rect x="30" y="126" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />

                {/* Filler events (background context) */}
                <rect x="50" y="68" width="20" height="14" rx="2" fill="var(--mineral-info, #3b82f6)" opacity="0.55" />
                <rect x="146" y="100" width="20" height="22" rx="2" fill="var(--mineral-success, #22c55e)" opacity="0.55" />

                {/* === Two overlapping events === */}
                {/* Event A — info, Tue 14:00 - 17:00 */}
                <rect
                    x="78"
                    y="84"
                    width="36"
                    height="44"
                    rx="3"
                    fill="var(--mineral-info, #3b82f6)"
                    opacity="0.85"
                    stroke="var(--mineral-info, #3b82f6)"
                    strokeWidth="1.5"
                />
                <rect x="82" y="88" width="22" height="2" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.95" />
                <rect x="82" y="93" width="16" height="1.5" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.7" />

                {/* Event B — error/warning hue, Tue 15:00 - 18:00 — overlaps Event A in middle band */}
                <rect
                    x="98"
                    y="98"
                    width="36"
                    height="44"
                    rx="3"
                    fill="var(--mineral-error, #ef4444)"
                    opacity="0.85"
                    stroke="var(--mineral-error, #ef4444)"
                    strokeWidth="1.5"
                />
                <rect x="102" y="102" width="22" height="2" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.95" />
                <rect x="102" y="107" width="18" height="1.5" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.7" />

                {/* Hatched overlap region — diagonal stripes to highlight conflict */}
                <defs>
                    <pattern id={hatchId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="6" stroke="var(--mineral-warning, #f59e0b)" strokeWidth="2" />
                    </pattern>
                </defs>
                <rect x="98" y="98" width="16" height="30" fill={`url(#${hatchId})`} opacity="0.85" />

                {/* Warning badge — circle with triangle ⚠ over the overlap */}
                <g transform="translate(122 78)">
                    {/* Outer ring */}
                    <circle r="16" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-warning, #f59e0b)" strokeWidth="2.5" />
                    {/* Triangle */}
                    <polygon
                        points="0,-9 10,8 -10,8"
                        fill="var(--mineral-warning, #f59e0b)"
                        stroke="var(--mineral-surface-contrast, #13151a)"
                        strokeWidth="0.8"
                        strokeLinejoin="round"
                    />
                    {/* Exclamation */}
                    <rect x="-1.2" y="-5" width="2.4" height="7" rx="0.6" fill="var(--mineral-surface-contrast, #13151a)" />
                    <circle cx="0" cy="5" r="1.2" fill="var(--mineral-surface-contrast, #13151a)" />
                </g>
            </MIllustration>
        )
    }
)
