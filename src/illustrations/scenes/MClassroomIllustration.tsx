import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Classroom scene — interior view of a room with rows of desks and a board on the back wall.
export const MClassroomIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MClassroomIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="78" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="84" ry="64" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Back wall */}
                <rect x="20" y="22" width="160" height="100" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                {/* Floor (perspective trapezoid) */}
                <polygon points="20,122 180,122 196,170 4,170" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                {/* Floor lines (perspective) */}
                <line x1="20" y1="138" x2="180" y2="138" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" opacity="0.5" />
                <line x1="14" y1="154" x2="186" y2="154" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" opacity="0.4" />

                {/* Whiteboard on back wall */}
                <rect
                    x="64"
                    y="34"
                    width="72"
                    height="44"
                    rx="2"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="70" y="42" width="40" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="70" y="50" width="56" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                <rect x="70" y="56" width="48" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="70" y="62" width="52" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="70" y="68" width="40" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />

                {/* Wall clock */}
                <circle cx="40" cy="50" r="9" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                <circle cx="40" cy="50" r="1" fill="var(--illustration-accent)" />
                <line x1="40" y1="50" x2="40" y2="44" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1" strokeLinecap="round" />
                <line x1="40" y1="50" x2="44" y2="52" stroke="var(--illustration-accent)" strokeWidth="1.2" strokeLinecap="round" />

                {/* Bulletin board (right) */}
                <rect x="148" y="38" width="22" height="34" rx="1" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                <rect x="151" y="42" width="16" height="6" rx="1" fill="var(--illustration-accent)" opacity="0.55" />
                <rect x="151" y="50" width="12" height="4" rx="1" fill="var(--mineral-info, #3b82f6)" opacity="0.55" />
                <rect x="151" y="56" width="14" height="4" rx="1" fill="var(--mineral-success, #22c55e)" opacity="0.55" />
                <rect x="151" y="62" width="10" height="4" rx="1" fill="var(--mineral-warning, #f59e0b)" opacity="0.55" />

                {/* Desks — front row (3 desks) */}
                <g>
                    {/* Desk 1 */}
                    <rect x="36" y="118" width="36" height="10" rx="2" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    <rect x="42" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    <rect x="63" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    {/* Chair behind */}
                    <rect x="46" y="148" width="16" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />

                    {/* Desk 2 */}
                    <rect x="82" y="118" width="36" height="10" rx="2" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    <rect x="88" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    <rect x="109" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    <rect x="92" y="148" width="16" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />

                    {/* Desk 3 */}
                    <rect x="128" y="118" width="36" height="10" rx="2" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    <rect x="134" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    <rect x="155" y="128" width="3" height="20" fill="var(--mineral-border, #3a3f47)" />
                    <rect x="138" y="148" width="16" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />
                </g>

                {/* Notebooks on desks */}
                <rect x="44" y="120" width="14" height="6" rx="0.5" fill="var(--mineral-info, #3b82f6)" opacity="0.7" />
                <rect x="90" y="120" width="14" height="6" rx="0.5" fill="var(--mineral-success, #22c55e)" opacity="0.7" />
                <rect x="136" y="120" width="14" height="6" rx="0.5" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
            </MIllustration>
        )
    }
)
