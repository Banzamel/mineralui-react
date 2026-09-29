import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Tutor scene — two figures sitting face-to-face across a desk (1:1 lesson).
export const MTutorIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MTutorIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="184" rx="74" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="116" rx="84" ry="52" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Left figure — body */}
                <rect
                    x="22"
                    y="98"
                    width="36"
                    height="50"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="28" y="108" width="24" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />
                {/* Left head */}
                <circle
                    cx="40"
                    cy="86"
                    r="14"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <path d="M28 80 C30 70 38 68 46 70 C54 72 56 80 54 84" fill="var(--illustration-accent)" opacity="0.55" />
                <circle cx="36" cy="86" r="1.4" fill="var(--mineral-text, #f5f5fa)" />
                <circle cx="44" cy="86" r="1.4" fill="var(--mineral-text, #f5f5fa)" />
                <path d="M36 92 Q40 94 44 92" fill="none" stroke="var(--mineral-text-secondary, #6b7280)" strokeWidth="1.2" strokeLinecap="round" />

                {/* Right figure — body */}
                <rect
                    x="142"
                    y="98"
                    width="36"
                    height="50"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="148" y="108" width="24" height="3" rx="1" fill="var(--mineral-info, #3b82f6)" opacity="0.7" />
                {/* Right head */}
                <circle
                    cx="160"
                    cy="86"
                    r="14"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <path d="M148 80 C150 70 158 68 166 70 C174 72 176 80 174 84" fill="var(--mineral-info, #3b82f6)" opacity="0.5" />
                <circle cx="156" cy="86" r="1.4" fill="var(--mineral-text, #f5f5fa)" />
                <circle cx="164" cy="86" r="1.4" fill="var(--mineral-text, #f5f5fa)" />
                <path d="M156 92 Q160 94 164 92" fill="none" stroke="var(--mineral-text-secondary, #6b7280)" strokeWidth="1.2" strokeLinecap="round" />

                {/* Desk */}
                <rect
                    x="48"
                    y="138"
                    width="104"
                    height="10"
                    rx="2"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="58" y="148" width="4" height="22" fill="var(--mineral-border, #3a3f47)" />
                <rect x="138" y="148" width="4" height="22" fill="var(--mineral-border, #3a3f47)" />

                {/* Open book on desk */}
                <rect x="78" y="130" width="44" height="10" rx="1" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <line x1="100" y1="130" x2="100" y2="140" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="82" y="133" width="14" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                <rect x="104" y="133" width="14" height="1.5" rx="0.5" fill="var(--illustration-accent)" opacity="0.7" />
                <rect x="82" y="136" width="10" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="104" y="136" width="12" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />

                {/* Speech bubbles between heads */}
                <circle cx="80" cy="68" r="6" fill="var(--illustration-accent)" opacity="0.45" />
                <circle cx="100" cy="62" r="8" fill="var(--illustration-accent)" opacity="0.6" />
                <circle cx="120" cy="68" r="6" fill="var(--mineral-info, #3b82f6)" opacity="0.45" />
            </MIllustration>
        )
    }
)
