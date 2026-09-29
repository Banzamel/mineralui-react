import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Upload scene — cloud with upload arrow and file icons.
export const MUploadIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MUploadIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Cloud shape */}
                <path
                    d="M52 108 C32 108 20 92 28 76 C34 62 50 56 64 60 C68 42 86 32 104 36 C120 40 132 52 132 68 C148 66 164 78 162 96 C160 110 148 116 136 114 L52 114 Z"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Cloud inner highlight */}
                <path
                    d="M60 106 C44 106 34 94 40 82 C44 72 56 68 66 70 C70 56 84 48 98 50 C112 54 120 62 120 74 C134 72 146 82 144 94 C142 104 134 108 126 106 Z"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    opacity="0.3"
                />

                {/* Upload arrow shaft */}
                <line
                    x1="94"
                    y1="104"
                    x2="94"
                    y2="68"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* Upload arrow head */}
                <polyline
                    points="80,82 94,66 108,82"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* File icon 1 */}
                <rect
                    x="44"
                    y="128"
                    width="30"
                    height="38"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <path
                    d="M62 128 L74 128 L74 140 Z"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="0.5"
                />
                <rect x="50" y="144" width="18" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.5" />
                <rect x="50" y="150" width="14" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />
                <rect x="50" y="156" width="16" height="2" rx="1" fill="var(--illustration-accent)" opacity="0.3" />

                {/* File icon 2 */}
                <rect
                    x="82"
                    y="132"
                    width="30"
                    height="38"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect x="88" y="140" width="18" height="12" rx="2" fill="var(--illustration-accent)" opacity="0.15" />
                <rect x="88" y="156" width="14" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.4" />
                <rect x="88" y="162" width="10" height="2" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

                {/* File icon 3 */}
                <rect
                    x="120"
                    y="128"
                    width="30"
                    height="38"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <rect
                    x="126"
                    y="136"
                    width="18"
                    height="2"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.5"
                />
                <rect
                    x="126"
                    y="142"
                    width="14"
                    height="2"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.4"
                />
                <rect
                    x="126"
                    y="148"
                    width="16"
                    height="2"
                    rx="1"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.3"
                />
                <rect x="126" y="154" width="12" height="2" rx="1" fill="var(--illustration-accent)" opacity="0.3" />

                {/* Progress dots */}
                <circle cx="86" cy="120" r="2" fill="var(--illustration-accent)" opacity="0.5" />
                <circle cx="94" cy="118" r="2" fill="var(--illustration-accent)" opacity="0.7" />
                <circle cx="102" cy="120" r="2" fill="var(--illustration-accent)" opacity="0.4" />

                {/* Glow */}
                <ellipse cx="94" cy="90" rx="50" ry="36" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
