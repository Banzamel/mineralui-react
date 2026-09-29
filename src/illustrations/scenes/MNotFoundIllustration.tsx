import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// 404 Not Found scene — magnifying glass searching over a torn page.
export const MNotFoundIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MNotFoundIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Shadow */}
                <ellipse cx="100" cy="172" rx="54" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Page background */}
                <rect
                    x="46"
                    y="28"
                    width="90"
                    height="120"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Page fold */}
                <path
                    d="M116 28 L136 28 L136 48 Z"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                />

                {/* Page lines */}
                <rect x="56" y="44" width="50" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.5" />
                <rect x="56" y="54" width="62" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.4" />
                <rect x="56" y="64" width="44" height="3" rx="1" fill="var(--mineral-border, #3a3f47)" opacity="0.3" />

                {/* Torn edge */}
                <path
                    d="M46 90 L56 86 L66 92 L76 84 L86 90 L96 85 L106 92 L116 86 L126 90 L136 88"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                    opacity="0.5"
                />

                {/* 404 text */}
                <text
                    x="91"
                    y="120"
                    textAnchor="middle"
                    fontFamily="inherit"
                    fontSize="28"
                    fontWeight="bold"
                    fill="var(--illustration-accent)"
                    opacity="0.7"
                >
                    404
                </text>

                {/* Magnifying glass */}
                <circle
                    cx="132"
                    cy="108"
                    r="26"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="3"
                    opacity="0.9"
                />
                <circle
                    cx="132"
                    cy="108"
                    r="20"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                    opacity="0.4"
                />
                <line
                    x1="151"
                    y1="127"
                    x2="164"
                    y2="148"
                    stroke="var(--illustration-accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                />

                {/* Question mark in lens */}
                <text
                    x="132"
                    y="116"
                    textAnchor="middle"
                    fontFamily="inherit"
                    fontSize="22"
                    fontWeight="bold"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.5"
                >
                    ?
                </text>

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="56" ry="46" fill="var(--illustration-accent)" opacity="0.04" />
            </MIllustration>
        )
    }
)
