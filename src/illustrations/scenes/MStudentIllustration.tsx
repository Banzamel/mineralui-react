import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Student scene — single learner with backpack and an open book.
export const MStudentIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MStudentIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="44" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="70" ry="60" fill="var(--illustration-accent)" opacity="0.04" />

                {/* Backpack — straps */}
                <path
                    d="M82 86 C82 78 90 74 100 74 C110 74 118 78 118 86"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Backpack — body */}
                <rect
                    x="64"
                    y="86"
                    width="28"
                    height="46"
                    rx="6"
                    fill="var(--illustration-accent)"
                    opacity="0.7"
                />
                <rect x="68" y="98" width="20" height="4" rx="1" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.4" />
                <rect x="68" y="106" width="14" height="3" rx="1" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.3" />

                {/* Body — torso */}
                <rect
                    x="86"
                    y="92"
                    width="36"
                    height="46"
                    rx="8"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="92" y="100" width="24" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />
                <rect x="92" y="108" width="18" height="2" rx="1" fill="var(--mineral-text-secondary, #6b7280)" />

                {/* Head */}
                <circle
                    cx="104"
                    cy="68"
                    r="16"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Hair tuft */}
                <path
                    d="M90 60 C92 52 100 50 108 52 C116 54 120 60 118 64"
                    fill="var(--illustration-accent)"
                    opacity="0.55"
                />
                {/* Eye */}
                <circle cx="100" cy="70" r="1.5" fill="var(--mineral-text, #f5f5fa)" />
                <circle cx="110" cy="70" r="1.5" fill="var(--mineral-text, #f5f5fa)" />
                {/* Smile */}
                <path
                    d="M100 76 Q105 79 110 76"
                    fill="none"
                    stroke="var(--mineral-text-secondary, #6b7280)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />

                {/* Legs */}
                <rect x="92" y="138" width="8" height="28" rx="3" fill="var(--mineral-border, #3a3f47)" />
                <rect x="108" y="138" width="8" height="28" rx="3" fill="var(--mineral-border, #3a3f47)" />

                {/* Open book in hands */}
                <g transform="translate(120 116) rotate(-12)">
                    <rect
                        x="0"
                        y="0"
                        width="48"
                        height="34"
                        rx="2"
                        fill="var(--mineral-surface, #1a1d23)"
                        stroke="var(--mineral-border, #3a3f47)"
                        strokeWidth="1.5"
                    />
                    <line x1="24" y1="2" x2="24" y2="32" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="4" y="6" width="16" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" />
                    <rect x="4" y="11" width="14" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                    <rect x="4" y="16" width="12" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                    <rect x="28" y="6" width="14" height="2" rx="0.5" fill="var(--illustration-accent)" opacity="0.7" />
                    <rect x="28" y="11" width="16" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                    <rect x="28" y="16" width="10" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                </g>
            </MIllustration>
        )
    }
)
