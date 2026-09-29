import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Security scene — shield with lock icon and accent glow.
export const MSecurityIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MSecurityIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Outer glow */}
                <ellipse cx="100" cy="104" rx="56" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Shield shape */}
                <path
                    d="M100 30 L148 52 C148 52 152 108 100 168 C48 108 52 52 52 52 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="2.5"
                />

                {/* Shield inner */}
                <path
                    d="M100 42 L140 60 C140 60 143 106 100 158 C57 106 60 60 60 60 Z"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    opacity="0.6"
                />

                {/* Shield accent stripe */}
                <path
                    d="M100 42 L140 60 C140 60 141 72 138 86 L100 72 L62 86 C59 72 60 60 60 60 Z"
                    fill="var(--illustration-accent)"
                    opacity="0.12"
                />

                {/* Lock body */}
                <rect x="84" y="96" width="32" height="28" rx="4" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Lock shackle */}
                <path
                    d="M88 96 L88 84 C88 76 94 70 100 70 C106 70 112 76 112 84 L112 96"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Keyhole */}
                <circle cx="100" cy="108" r="4" fill="var(--mineral-surface-contrast, #13151a)" />
                <rect x="98" y="110" width="4" height="8" rx="1" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Decorative dots */}
                <circle cx="56" cy="40" r="1.5" fill="var(--illustration-accent)" opacity="0.3" />
                <circle cx="144" cy="40" r="1.5" fill="var(--illustration-accent)" opacity="0.3" />
                <circle cx="40" cy="80" r="1" fill="var(--illustration-accent)" opacity="0.2" />
                <circle cx="160" cy="80" r="1" fill="var(--illustration-accent)" opacity="0.2" />
            </MIllustration>
        )
    }
)
