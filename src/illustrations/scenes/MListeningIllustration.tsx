import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Listening scene — over-ear headphones with a sound waveform passing through.
export const MListeningIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MListeningIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="170" rx="56" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Headband */}
                <path
                    d="M52 110 C52 60 100 40 148 60 C160 64 168 80 168 110"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                <path
                    d="M52 110 C52 60 100 40 148 60 C160 64 168 80 168 110"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Left ear cup */}
                <rect
                    x="32"
                    y="100"
                    width="36"
                    height="46"
                    rx="10"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="38" y="106" width="24" height="34" rx="6" fill="var(--illustration-accent)" opacity="0.5" />
                <circle cx="50" cy="123" r="6" fill="var(--mineral-surface-contrast, #13151a)" />
                <circle cx="50" cy="123" r="2.5" fill="var(--illustration-accent)" />

                {/* Right ear cup */}
                <rect
                    x="132"
                    y="100"
                    width="36"
                    height="46"
                    rx="10"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="138" y="106" width="24" height="34" rx="6" fill="var(--illustration-accent)" opacity="0.5" />
                <circle cx="150" cy="123" r="6" fill="var(--mineral-surface-contrast, #13151a)" />
                <circle cx="150" cy="123" r="2.5" fill="var(--illustration-accent)" />

                {/* Sound waveform passing between cups */}
                <g stroke="var(--illustration-accent)" strokeLinecap="round" fill="none">
                    <line x1="76" y1="123" x2="76" y2="123" strokeWidth="3" opacity="0.4" />
                    <line x1="82" y1="115" x2="82" y2="131" strokeWidth="3" opacity="0.55" />
                    <line x1="88" y1="108" x2="88" y2="138" strokeWidth="3" opacity="0.7" />
                    <line x1="94" y1="100" x2="94" y2="146" strokeWidth="3" opacity="0.85" />
                    <line x1="100" y1="92" x2="100" y2="154" strokeWidth="3" />
                    <line x1="106" y1="100" x2="106" y2="146" strokeWidth="3" opacity="0.85" />
                    <line x1="112" y1="108" x2="112" y2="138" strokeWidth="3" opacity="0.7" />
                    <line x1="118" y1="115" x2="118" y2="131" strokeWidth="3" opacity="0.55" />
                    <line x1="124" y1="123" x2="124" y2="123" strokeWidth="3" opacity="0.4" />
                </g>
            </MIllustration>
        )
    }
)
