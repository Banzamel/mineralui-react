import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Exam scene — exam paper with multiple-choice questions, a pencil and a ticking clock in the corner.
export const MExamIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MExamIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Exam paper */}
                <rect
                    x="34"
                    y="32"
                    width="120"
                    height="138"
                    rx="4"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Header */}
                <rect x="42" y="40" width="46" height="4" rx="1" fill="var(--illustration-accent)" />
                <rect x="42" y="48" width="80" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />

                {/* Question 1 */}
                <rect x="42" y="58" width="66" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <g>
                    <circle cx="46" cy="68" r="2.5" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="52" y="66.5" width="32" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                    {/* Selected (filled) */}
                    <circle cx="46" cy="76" r="2.5" fill="var(--illustration-accent)" />
                    <rect x="52" y="74.5" width="40" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                    <circle cx="46" cy="84" r="2.5" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="52" y="82.5" width="34" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                </g>

                {/* Question 2 */}
                <rect x="42" y="96" width="60" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <g>
                    <circle cx="46" cy="106" r="2.5" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="52" y="104.5" width="38" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                    <circle cx="46" cy="114" r="2.5" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <rect x="52" y="112.5" width="32" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                    <circle cx="46" cy="122" r="2.5" fill="var(--illustration-accent)" />
                    <rect x="52" y="120.5" width="42" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                </g>

                {/* Question 3 (open question with two writing lines) */}
                <rect x="42" y="134" width="56" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <line x1="42" y1="146" x2="146" y2="146" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" />
                <line x1="42" y1="158" x2="146" y2="158" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" />

                {/* Pencil — diagonal across paper */}
                <g transform="translate(94 138) rotate(-30)">
                    <rect x="0" y="-3" width="58" height="6" rx="1" fill="var(--mineral-warning, #f59e0b)" opacity="0.85" />
                    <rect x="0" y="-3" width="58" height="6" rx="1" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    {/* Eraser end */}
                    <rect x="58" y="-3" width="8" height="6" rx="1" fill="var(--mineral-error, #ef4444)" />
                    <rect x="58" y="-3" width="8" height="6" rx="1" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    {/* Tip */}
                    <polygon points="-6,-3 0,0 -6,3" fill="var(--mineral-text, #f5f5fa)" />
                    <polygon points="-2,-1 0,0 -2,1" fill="var(--mineral-surface-contrast, #13151a)" />
                </g>

                {/* Clock (top-right corner) */}
                <circle cx="156" cy="40" r="20" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                <circle cx="156" cy="40" r="2" fill="var(--illustration-accent)" />
                {/* Hour hand */}
                <line x1="156" y1="40" x2="156" y2="30" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="2" strokeLinecap="round" />
                {/* Minute hand */}
                <line x1="156" y1="40" x2="166" y2="42" stroke="var(--illustration-accent)" strokeWidth="2" strokeLinecap="round" />
                {/* Hour ticks */}
                <g stroke="var(--mineral-text-secondary, #6b7280)" strokeLinecap="round">
                    <line x1="156" y1="22" x2="156" y2="25" strokeWidth="1.2" />
                    <line x1="174" y1="40" x2="171" y2="40" strokeWidth="1.2" />
                    <line x1="156" y1="58" x2="156" y2="55" strokeWidth="1.2" />
                    <line x1="138" y1="40" x2="141" y2="40" strokeWidth="1.2" />
                </g>
            </MIllustration>
        )
    }
)
