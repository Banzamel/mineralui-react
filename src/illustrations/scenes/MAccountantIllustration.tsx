import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Accountant scene — figure with calculator and a stack of invoices.
export const MAccountantIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MAccountantIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Stack of invoices behind (left side) */}
                <g transform="translate(28 84)">
                    <rect x="6" y="10" width="46" height="58" rx="2" fill="var(--mineral-text, #f5f5fa)" opacity="0.85" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="3" y="6" width="46" height="58" rx="2" fill="var(--mineral-text, #f5f5fa)" opacity="0.92" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="0" y="2" width="46" height="58" rx="2" fill="var(--mineral-text, #f5f5fa)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    {/* Invoice header — accent stripe */}
                    <rect x="0" y="2" width="46" height="8" fill="var(--illustration-accent)" opacity="0.85" />
                    {/* Invoice line items */}
                    <rect x="4" y="14" width="14" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                    <rect x="4" y="20" width="38" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                    <rect x="4" y="26" width="34" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                    <rect x="4" y="32" width="36" height="1.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                    {/* Total stripe */}
                    <line x1="4" y1="46" x2="42" y2="46" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.8" />
                    <rect x="22" y="50" width="20" height="3" rx="0.5" fill="var(--illustration-accent)" opacity="0.8" />
                </g>

                {/* Body — torso */}
                <rect
                    x="100"
                    y="106"
                    width="44"
                    height="56"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Tie/lapel */}
                <path d="M122 106 L118 122 L122 138 L126 122 Z" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Head */}
                <circle
                    cx="122"
                    cy="92"
                    r="14"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Glasses */}
                <circle cx="117" cy="93" r="3" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1.2" />
                <circle cx="127" cy="93" r="3" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1.2" />
                <line x1="120" y1="93" x2="124" y2="93" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1.2" />
                {/* Hair top */}
                <path d="M110 86 C112 78 120 76 128 78 C134 80 136 86 134 90" fill="var(--mineral-border, #3a3f47)" />
                {/* Smile */}
                <path d="M118 100 Q122 102 126 100" fill="none" stroke="var(--mineral-text-secondary, #6b7280)" strokeWidth="1.2" strokeLinecap="round" />

                {/* Calculator (held in front) */}
                <g transform="translate(140 120)">
                    <rect x="0" y="0" width="34" height="48" rx="3" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    {/* Display */}
                    <rect x="3" y="3" width="28" height="10" rx="1.5" fill="var(--mineral-surface-contrast, #13151a)" />
                    <rect x="20" y="6" width="9" height="4" rx="0.5" fill="var(--illustration-accent)" opacity="0.85" />
                    {/* Buttons grid 3x4 */}
                    <g fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.5">
                        <rect x="3" y="16" width="8" height="6" rx="1" />
                        <rect x="13" y="16" width="8" height="6" rx="1" />
                        <rect x="23" y="16" width="8" height="6" rx="1" fill="var(--illustration-accent)" opacity="0.6" />
                        <rect x="3" y="24" width="8" height="6" rx="1" />
                        <rect x="13" y="24" width="8" height="6" rx="1" />
                        <rect x="23" y="24" width="8" height="6" rx="1" fill="var(--illustration-accent)" opacity="0.6" />
                        <rect x="3" y="32" width="8" height="6" rx="1" />
                        <rect x="13" y="32" width="8" height="6" rx="1" />
                        <rect x="23" y="32" width="8" height="6" rx="1" fill="var(--illustration-accent)" opacity="0.6" />
                        <rect x="3" y="40" width="18" height="6" rx="1" />
                        <rect x="23" y="40" width="8" height="6" rx="1" fill="var(--illustration-accent)" opacity="0.85" />
                    </g>
                </g>
            </MIllustration>
        )
    }
)
