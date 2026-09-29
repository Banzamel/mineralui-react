import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Writing scene — a fountain pen drawing lines across a sheet of paper.
export const MWritingIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MWritingIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="172" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Paper sheet */}
                <rect
                    x="32"
                    y="38"
                    width="120"
                    height="128"
                    rx="4"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Top margin line — accent */}
                <line x1="40" y1="56" x2="144" y2="56" stroke="var(--illustration-accent)" strokeWidth="1" opacity="0.4" />
                {/* Vertical margin line — red */}
                <line x1="48" y1="38" x2="48" y2="166" stroke="var(--mineral-error, #ef4444)" strokeWidth="0.8" opacity="0.5" />

                {/* Text lines (already written, fading) */}
                <g fill="var(--mineral-text-secondary, #6b7280)">
                    <rect x="54" y="64" width="80" height="2" rx="0.5" opacity="0.85" />
                    <rect x="54" y="74" width="74" height="2" rx="0.5" opacity="0.7" />
                    <rect x="54" y="84" width="78" height="2" rx="0.5" opacity="0.55" />
                    <rect x="54" y="94" width="60" height="2" rx="0.5" opacity="0.4" />
                </g>
                {/* Currently writing line — partial, accent */}
                <rect x="54" y="106" width="40" height="2.5" rx="0.5" fill="var(--illustration-accent)" />
                {/* Empty lines below */}
                <g stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.5" opacity="0.5">
                    <line x1="54" y1="120" x2="138" y2="120" />
                    <line x1="54" y1="132" x2="138" y2="132" />
                    <line x1="54" y1="144" x2="138" y2="144" />
                    <line x1="54" y1="156" x2="138" y2="156" />
                </g>

                {/* Fountain pen — body (rotated, tip at writing line) */}
                <g transform="translate(94 106) rotate(-32)">
                    {/* Barrel */}
                    <rect x="6" y="-6" width="60" height="12" rx="3" fill="var(--illustration-accent)" opacity="0.85" />
                    <rect x="6" y="-6" width="60" height="12" rx="3" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    {/* Cap (back end) */}
                    <rect x="62" y="-7" width="14" height="14" rx="3" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                    <circle cx="76" cy="0" r="2" fill="var(--illustration-accent)" />
                    {/* Section + clip */}
                    <rect x="2" y="-5" width="6" height="10" rx="1" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="14" y="-8" width="20" height="2" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.4" />
                    {/* Nib (triangle) */}
                    <polygon points="-8,-3 2,0 -8,3" fill="var(--mineral-text, #f5f5fa)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <line x1="-3" y1="0" x2="0" y2="0" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" />
                </g>

                {/* Tiny ink dot under the nib */}
                <circle cx="93" cy="111" r="1.4" fill="var(--illustration-accent)" />
            </MIllustration>
        )
    }
)
