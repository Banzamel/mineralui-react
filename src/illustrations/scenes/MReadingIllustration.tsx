import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Reading scene — open book with a magnifying glass focusing on a paragraph.
export const MReadingIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MReadingIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="172" rx="68" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Open book — left page */}
                <path
                    d="M28 48 L100 56 L100 156 L28 148 Z"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Open book — right page */}
                <path
                    d="M172 48 L100 56 L100 156 L172 148 Z"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Spine */}
                <line x1="100" y1="56" x2="100" y2="156" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />

                {/* Left page — text lines */}
                <g fill="var(--mineral-text-secondary, #6b7280)">
                    <rect x="38" y="62" width="30" height="2.5" rx="0.5" opacity="0.85" />
                    <rect x="38" y="70" width="52" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="76" width="48" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="82" width="50" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="88" width="46" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="94" width="50" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="100" width="42" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="38" y="110" width="50" height="1.8" rx="0.5" opacity="0.5" />
                    <rect x="38" y="116" width="46" height="1.8" rx="0.5" opacity="0.5" />
                    <rect x="38" y="122" width="48" height="1.8" rx="0.5" opacity="0.5" />
                    <rect x="38" y="128" width="40" height="1.8" rx="0.5" opacity="0.5" />
                </g>
                {/* Right page — text lines (some highlighted under glass) */}
                <g fill="var(--mineral-text-secondary, #6b7280)">
                    <rect x="110" y="62" width="48" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="110" y="68" width="44" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="110" y="74" width="50" height="1.8" rx="0.5" opacity="0.6" />
                    <rect x="110" y="86" width="48" height="1.8" rx="0.5" opacity="0.5" />
                    <rect x="110" y="92" width="46" height="1.8" rx="0.5" opacity="0.5" />
                    <rect x="110" y="98" width="50" height="1.8" rx="0.5" opacity="0.5" />
                </g>

                {/* Magnifying glass — frame */}
                <circle
                    cx="135"
                    cy="118"
                    r="22"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    fillOpacity="0.55"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                />
                {/* Glass shine */}
                <path
                    d="M122 110 C126 104 134 102 140 106"
                    fill="none"
                    stroke="var(--mineral-text, #f5f5fa)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.85"
                />
                {/* Highlighted lines under the glass — accent */}
                <rect x="120" y="116" width="30" height="2.5" rx="0.5" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="120" y="122" width="22" height="2.5" rx="0.5" fill="var(--illustration-accent)" opacity="0.6" />
                {/* Handle */}
                <line
                    x1="151"
                    y1="134"
                    x2="170"
                    y2="158"
                    stroke="var(--illustration-accent)"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                <line
                    x1="151"
                    y1="134"
                    x2="170"
                    y2="158"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </MIllustration>
        )
    }
)
