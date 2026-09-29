import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Onboarding scene — rocket launching from a platform with exhaust trail.
export const MOnboardingIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MOnboardingIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Stars / space dots */}
                <circle cx="32" cy="36" r="1.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.4" />
                <circle cx="168" cy="28" r="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.3" />
                <circle cx="154" cy="52" r="1.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.35" />
                <circle cx="46" cy="64" r="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.3" />
                <circle cx="172" cy="88" r="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.25" />

                {/* Exhaust trail */}
                <path
                    d="M100 148 C92 160 84 168 78 176 C86 172 94 170 100 170 C106 170 114 172 122 176 C116 168 108 160 100 148 Z"
                    fill="var(--mineral-warning, #f59e0b)"
                    opacity="0.3"
                />
                <path
                    d="M100 140 C96 150 90 158 86 164 C92 162 96 160 100 160 C104 160 108 162 114 164 C110 158 104 150 100 140 Z"
                    fill="var(--illustration-accent)"
                    opacity="0.4"
                />

                {/* Launch platform */}
                <rect
                    x="60"
                    y="164"
                    width="80"
                    height="6"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect x="72" y="170" width="8" height="10" rx="1" fill="var(--mineral-border, #3a3f47)" />
                <rect x="120" y="170" width="8" height="10" rx="1" fill="var(--mineral-border, #3a3f47)" />

                {/* Rocket body */}
                <path
                    d="M88 140 L88 80 C88 60 100 36 100 36 C100 36 112 60 112 80 L112 140 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Rocket nose cone */}
                <path
                    d="M92 80 C92 64 100 42 100 42 C100 42 108 64 108 80 Z"
                    fill="var(--illustration-accent)"
                    opacity="0.6"
                />

                {/* Rocket window */}
                <circle
                    cx="100"
                    cy="96"
                    r="8"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    opacity="0.8"
                />
                <circle cx="98" cy="94" r="3" fill="var(--illustration-accent)" opacity="0.15" />

                {/* Rocket stripes */}
                <rect x="90" y="112" width="20" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.3" />
                <rect x="90" y="120" width="20" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.2" />

                {/* Left fin */}
                <path
                    d="M88 128 L72 148 L88 142 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />

                {/* Right fin */}
                <path
                    d="M112 128 L128 148 L112 142 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />

                {/* Speed lines */}
                <line
                    x1="68"
                    y1="72"
                    x2="56"
                    y2="72"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.3"
                />
                <line
                    x1="64"
                    y1="84"
                    x2="48"
                    y2="84"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.25"
                />
                <line
                    x1="132"
                    y1="76"
                    x2="148"
                    y2="76"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.3"
                />
                <line
                    x1="136"
                    y1="88"
                    x2="152"
                    y2="88"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.25"
                />

                {/* Glow */}
                <ellipse cx="100" cy="100" rx="44" ry="56" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
