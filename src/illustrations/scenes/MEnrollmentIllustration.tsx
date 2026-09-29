import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Enrollment scene — sign-up form with checkboxes and a hand holding a pen filling it in.
export const MEnrollmentIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MEnrollmentIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Form sheet */}
                <rect
                    x="36"
                    y="28"
                    width="116"
                    height="138"
                    rx="6"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Form header — accent strip + title */}
                <rect x="36" y="28" width="116" height="20" rx="6" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="36" y="40" width="116" height="8" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="46" y="34" width="50" height="5" rx="1" fill="var(--mineral-text, #f5f5fa)" opacity="0.85" />

                {/* Field label + input row 1 */}
                <rect x="46" y="56" width="36" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="46" y="62" width="96" height="8" rx="2" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.06" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="50" y="65" width="40" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />

                {/* Field label + input row 2 */}
                <rect x="46" y="76" width="40" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />
                <rect x="46" y="82" width="96" height="8" rx="2" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.06" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <rect x="50" y="85" width="50" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />

                {/* Section: choose course (checkboxes) */}
                <rect x="46" y="98" width="48" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />

                {/* Checkbox 1 — checked */}
                <rect x="46" y="106" width="8" height="8" rx="2" fill="var(--illustration-accent)" />
                <path d="M48 110 L51 113 L55 108" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="58" y="108" width="44" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />

                {/* Checkbox 2 — checked */}
                <rect x="46" y="118" width="8" height="8" rx="2" fill="var(--illustration-accent)" />
                <path d="M48 122 L51 125 L55 120" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="58" y="120" width="50" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.85" />

                {/* Checkbox 3 — empty */}
                <rect x="46" y="130" width="8" height="8" rx="2" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                <rect x="58" y="132" width="38" height="3" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.55" />

                {/* Submit button (accent) */}
                <rect x="46" y="146" width="96" height="12" rx="3" fill="var(--illustration-accent)" />
                <rect x="76" y="151" width="36" height="3" rx="0.5" fill="var(--mineral-text, #f5f5fa)" opacity="0.95" />

                {/* Hand + pen (right side, hovering over checkbox 3) */}
                <g transform="translate(132 124) rotate(-22)">
                    {/* Pen body */}
                    <rect x="0" y="-3" width="48" height="6" rx="1.5" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.2" />
                    <rect x="0" y="-3" width="14" height="6" rx="1.5" fill="var(--illustration-accent)" />
                    {/* Pen tip */}
                    <polygon points="-6,-2 0,0 -6,2" fill="var(--illustration-accent)" />
                    {/* Hand (simple grip) */}
                    <ellipse cx="32" cy="0" rx="14" ry="9" fill="var(--mineral-text, #f5f5fa)" opacity="0.9" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.2" />
                </g>
            </MIllustration>
        )
    }
)
