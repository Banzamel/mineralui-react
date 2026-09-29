import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Workbook scene — open exercise book with ruled lines and a small illustration thumbnail on the right page.
export const MWorkbookIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MWorkbookIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="172" rx="76" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="86" ry="58" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Book — back cover (perspective tilt) */}
                <path
                    d="M22 60 L100 50 L178 60 L178 154 L100 164 L22 154 Z"
                    fill="var(--illustration-accent)"
                    opacity="0.85"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Left page */}
                <path
                    d="M28 64 L100 56 L100 156 L28 148 Z"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                {/* Left — header line + ruled lines */}
                <line x1="38" y1="74" x2="92" y2="71" stroke="var(--illustration-accent)" strokeWidth="1.5" opacity="0.7" />
                <g stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.5" opacity="0.55">
                    <line x1="38" y1="84" x2="92" y2="82" />
                    <line x1="38" y1="92" x2="92" y2="90" />
                    <line x1="38" y1="100" x2="92" y2="98" />
                    <line x1="38" y1="108" x2="92" y2="106" />
                    <line x1="38" y1="116" x2="92" y2="114" />
                    <line x1="38" y1="124" x2="92" y2="122" />
                    <line x1="38" y1="132" x2="92" y2="130" />
                    <line x1="38" y1="140" x2="92" y2="138" />
                </g>
                {/* Pencil writing partial line */}
                <rect x="38" y="86" width="34" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                <rect x="38" y="94" width="42" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="38" y="102" width="38" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />
                <rect x="38" y="110" width="22" height="2" rx="0.5" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Right page */}
                <path
                    d="M100 56 L172 64 L172 148 L100 156 Z"
                    fill="var(--mineral-text, #f5f5fa)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                {/* Right page — illustration thumbnail (a sun + hill drawing) */}
                <rect x="108" y="68" width="56" height="34" rx="2" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" opacity="0.55" />
                <circle cx="124" cy="80" r="6" fill="var(--mineral-warning, #f59e0b)" opacity="0.9" />
                <path d="M108 96 Q126 84 136 90 Q150 100 164 92 L164 102 L108 102 Z" fill="var(--mineral-success, #22c55e)" opacity="0.8" />

                {/* Right page — exercise blanks */}
                <g>
                    {/* Q1 */}
                    <rect x="108" y="110" width="38" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                    <rect x="108" y="116" width="56" height="6" rx="1" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" />
                    {/* Q2 */}
                    <rect x="108" y="128" width="48" height="2" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                    <rect x="108" y="134" width="56" height="6" rx="1" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="0.6" />
                    {/* Filled answer (accent) */}
                    <rect x="110" y="136" width="22" height="2" rx="0.5" fill="var(--illustration-accent)" opacity="0.85" />
                </g>

                {/* Spine highlight */}
                <line x1="100" y1="56" x2="100" y2="156" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
            </MIllustration>
        )
    }
)
