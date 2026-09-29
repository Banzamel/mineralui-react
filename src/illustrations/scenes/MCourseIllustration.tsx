import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Course scene — classroom front: blackboard with "ABC", small student row, teacher figure.
export const MCourseIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MCourseIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="78" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="80" rx="86" ry="56" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Blackboard */}
                <rect
                    x="34"
                    y="22"
                    width="132"
                    height="74"
                    rx="4"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* ABC chalk text — three big letters as outlined boxes */}
                <text x="60" y="72" fontFamily="inherit" fontSize="40" fontWeight="bold" fill="var(--illustration-accent)" opacity="0.9">A</text>
                <text x="92" y="72" fontFamily="inherit" fontSize="40" fontWeight="bold" fill="var(--illustration-accent)" opacity="0.7">B</text>
                <text x="124" y="72" fontFamily="inherit" fontSize="40" fontWeight="bold" fill="var(--illustration-accent)" opacity="0.5">C</text>
                {/* Underline */}
                <line x1="56" y1="84" x2="148" y2="84" stroke="var(--illustration-accent)" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />

                {/* Chalk tray */}
                <rect x="34" y="96" width="132" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />

                {/* Teacher (left of board) */}
                <circle cx="32" cy="118" r="8" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                <rect x="24" y="126" width="16" height="26" rx="3" fill="var(--illustration-accent)" opacity="0.85" />
                {/* Teacher pointer arm */}
                <line x1="40" y1="132" x2="58" y2="120" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

                {/* Student row (5 small figures) */}
                <g>
                    {/* Student 1 */}
                    <circle cx="62" cy="132" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-info, #3b82f6)" strokeWidth="1.5" />
                    <rect x="56" y="138" width="12" height="20" rx="3" fill="var(--mineral-info, #3b82f6)" opacity="0.7" />
                    {/* Student 2 */}
                    <circle cx="84" cy="132" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-success, #22c55e)" strokeWidth="1.5" />
                    <rect x="78" y="138" width="12" height="20" rx="3" fill="var(--mineral-success, #22c55e)" opacity="0.7" />
                    {/* Student 3 */}
                    <circle cx="106" cy="132" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-warning, #f59e0b)" strokeWidth="1.5" />
                    <rect x="100" y="138" width="12" height="20" rx="3" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                    {/* Student 4 */}
                    <circle cx="128" cy="132" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-news, #8b5cf6)" strokeWidth="1.5" />
                    <rect x="122" y="138" width="12" height="20" rx="3" fill="var(--mineral-news, #8b5cf6)" opacity="0.7" />
                    {/* Student 5 */}
                    <circle cx="150" cy="132" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--illustration-accent)" strokeWidth="1.5" />
                    <rect x="144" y="138" width="12" height="20" rx="3" fill="var(--illustration-accent)" opacity="0.7" />
                </g>

                {/* Floor line */}
                <line x1="20" y1="160" x2="180" y2="160" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" opacity="0.5" />
            </MIllustration>
        )
    }
)
