import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Online lesson scene — laptop showing two video tiles (Zoom-style) with wifi waves above.
export const MOnlineLessonIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MOnlineLessonIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="170" rx="72" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="106" rx="86" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Wifi waves above the laptop */}
                <g stroke="var(--illustration-accent)" fill="none" strokeLinecap="round">
                    <path d="M76 32 Q100 16 124 32" strokeWidth="2.5" opacity="0.4" />
                    <path d="M82 42 Q100 30 118 42" strokeWidth="2.5" opacity="0.6" />
                    <path d="M88 52 Q100 44 112 52" strokeWidth="2.5" opacity="0.85" />
                </g>
                <circle cx="100" cy="58" r="2.5" fill="var(--illustration-accent)" />

                {/* Laptop screen */}
                <rect
                    x="34"
                    y="68"
                    width="132"
                    height="78"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="40" y="74" width="120" height="66" rx="3" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Top status bar in app */}
                <rect x="44" y="78" width="50" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.85" />
                <circle cx="152" cy="80" r="2" fill="var(--mineral-success, #22c55e)" />

                {/* Video tile — left (teacher) */}
                <rect x="48" y="86" width="48" height="40" rx="3" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                {/* Head + shoulders silhouette */}
                <circle cx="72" cy="100" r="7" fill="var(--illustration-accent)" opacity="0.85" />
                <path d="M58 124 C58 116 66 110 72 110 C78 110 86 116 86 124" fill="var(--illustration-accent)" opacity="0.85" />
                {/* Name plate */}
                <rect x="50" y="119" width="22" height="5" rx="1" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.85" />
                <rect x="52" y="120.5" width="14" height="2" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.7" />
                {/* Mic icon */}
                <rect x="86" y="119" width="6" height="5" rx="1" fill="var(--mineral-success, #22c55e)" opacity="0.85" />

                {/* Video tile — right (student) */}
                <rect x="104" y="86" width="48" height="40" rx="3" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                {/* Head + shoulders silhouette */}
                <circle cx="128" cy="100" r="7" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                <path d="M114 124 C114 116 122 110 128 110 C134 110 142 116 142 124" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                <rect x="106" y="119" width="22" height="5" rx="1" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.85" />
                <rect x="108" y="120.5" width="14" height="2" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.7" />
                <rect x="142" y="119" width="6" height="5" rx="1" fill="var(--mineral-success, #22c55e)" opacity="0.85" />

                {/* Action bar at bottom */}
                <rect x="48" y="130" width="14" height="6" rx="2" fill="var(--mineral-success, #22c55e)" opacity="0.55" />
                <rect x="66" y="130" width="14" height="6" rx="2" fill="var(--mineral-error, #ef4444)" opacity="0.55" />
                <rect x="138" y="130" width="14" height="6" rx="2" fill="var(--illustration-accent)" opacity="0.7" />

                {/* Laptop base */}
                <path
                    d="M22 146 L178 146 L168 156 L32 156 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="86" y="148" width="28" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" />
            </MIllustration>
        )
    }
)
