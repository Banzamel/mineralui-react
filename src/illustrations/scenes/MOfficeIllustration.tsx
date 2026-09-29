import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Office scene — secretary desk with monitor, phone and stacked papers.
export const MOfficeIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MOfficeIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="72" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Desk surface */}
                <rect
                    x="20"
                    y="138"
                    width="160"
                    height="14"
                    rx="2"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Desk legs */}
                <rect x="32" y="152" width="6" height="22" fill="var(--mineral-border, #3a3f47)" />
                <rect x="162" y="152" width="6" height="22" fill="var(--mineral-border, #3a3f47)" />

                {/* Drawer (right) */}
                <rect
                    x="118"
                    y="152"
                    width="44"
                    height="22"
                    rx="2"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <line x1="118" y1="163" x2="162" y2="163" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" opacity="0.6" />
                <circle cx="140" cy="158" r="1.5" fill="var(--illustration-accent)" opacity="0.7" />
                <circle cx="140" cy="168" r="1.5" fill="var(--illustration-accent)" opacity="0.5" />

                {/* Monitor */}
                <rect
                    x="62"
                    y="64"
                    width="76"
                    height="56"
                    rx="4"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="68" y="70" width="64" height="44" rx="2" fill="var(--mineral-surface-contrast, #13151a)" />
                {/* Screen content — UI lines */}
                <rect x="72" y="76" width="20" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="72" y="84" width="38" height="2" rx="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                <rect x="72" y="90" width="32" height="2" rx="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="72" y="96" width="36" height="2" rx="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.4" />
                <rect x="72" y="104" width="28" height="6" rx="2" fill="var(--illustration-accent)" opacity="0.6" />
                {/* Monitor stand */}
                <rect x="92" y="120" width="16" height="6" fill="var(--mineral-border, #3a3f47)" />
                <rect x="84" y="126" width="32" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />

                {/* Phone (left of monitor) */}
                <rect
                    x="28"
                    y="120"
                    width="28"
                    height="18"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Handset */}
                <path
                    d="M28 120 C28 110 36 102 42 102 C48 102 56 110 56 120"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <ellipse cx="32" cy="120" rx="4" ry="2" fill="var(--illustration-accent)" opacity="0.85" />
                <ellipse cx="52" cy="120" rx="4" ry="2" fill="var(--illustration-accent)" opacity="0.85" />
                <g fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6">
                    <circle cx="36" cy="128" r="1.4" />
                    <circle cx="42" cy="128" r="1.4" />
                    <circle cx="48" cy="128" r="1.4" />
                    <circle cx="36" cy="133" r="1.4" />
                    <circle cx="42" cy="133" r="1.4" />
                    <circle cx="48" cy="133" r="1.4" />
                </g>

                {/* Stacked papers (right of monitor) */}
                <rect x="148" y="124" width="28" height="14" rx="1" fill="var(--mineral-text, #f5f5fa)" opacity="0.85" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="146" y="120" width="28" height="14" rx="1" fill="var(--mineral-text, #f5f5fa)" opacity="0.85" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="144" y="116" width="28" height="14" rx="1" fill="var(--mineral-text, #f5f5fa)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="148" y="120" width="14" height="2" rx="0.5" fill="var(--illustration-accent)" opacity="0.7" />
                <rect x="148" y="124" width="18" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />

                {/* Coffee cup on desk */}
                <ellipse cx="100" cy="138" rx="6" ry="2" fill="var(--illustration-accent)" opacity="0.85" />
                <path d="M94 138 L96 134 L104 134 L106 138 Z" fill="var(--illustration-accent)" opacity="0.6" />
            </MIllustration>
        )
    }
)
