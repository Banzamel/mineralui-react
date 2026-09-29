import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Teacher scene — figure with academic mortarboard standing in front of a blackboard.
export const MTeacherIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MTeacherIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="60" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="84" rx="80" ry="56" fill="var(--illustration-accent)" opacity="0.04" />

                {/* Blackboard */}
                <rect
                    x="20"
                    y="28"
                    width="160"
                    height="80"
                    rx="6"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Board frame inner */}
                <rect
                    x="26"
                    y="34"
                    width="148"
                    height="68"
                    rx="3"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1"
                    opacity="0.6"
                />
                {/* Chalk text — A B C */}
                <rect x="40" y="50" width="14" height="14" rx="1" fill="none" stroke="var(--illustration-accent)" strokeWidth="2" opacity="0.85" />
                <rect x="62" y="50" width="14" height="14" rx="1" fill="none" stroke="var(--illustration-accent)" strokeWidth="2" opacity="0.7" />
                <rect x="84" y="50" width="14" height="14" rx="1" fill="none" stroke="var(--illustration-accent)" strokeWidth="2" opacity="0.55" />
                <rect x="40" y="74" width="100" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.6" />
                <rect x="40" y="82" width="76" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.7" />
                <rect x="40" y="90" width="60" height="3" rx="1" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />

                {/* Chalk tray */}
                <rect x="20" y="108" width="160" height="4" rx="1" fill="var(--mineral-border, #3a3f47)" />
                <rect x="148" y="105" width="14" height="3" rx="1" fill="var(--mineral-text, #f5f5fa)" opacity="0.6" />

                {/* Body — torso */}
                <rect
                    x="78"
                    y="124"
                    width="36"
                    height="44"
                    rx="6"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="84" y="132" width="24" height="3" rx="1" fill="var(--illustration-accent)" opacity="0.7" />

                {/* Head */}
                <circle
                    cx="96"
                    cy="118"
                    r="12"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <circle cx="92" cy="118" r="1.3" fill="var(--mineral-text, #f5f5fa)" />
                <circle cx="100" cy="118" r="1.3" fill="var(--mineral-text, #f5f5fa)" />
                <path
                    d="M92 124 Q96 126 100 124"
                    fill="none"
                    stroke="var(--mineral-text-secondary, #6b7280)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />

                {/* Mortarboard cap */}
                <rect x="78" y="104" width="36" height="4" rx="1" fill="var(--mineral-text, #1a1d23)" opacity="0.85" />
                <polygon
                    points="68,104 96,96 124,104 96,112"
                    fill="var(--illustration-accent)"
                    opacity="0.85"
                />
                {/* Tassel */}
                <line x1="124" y1="104" x2="130" y2="116" stroke="var(--illustration-accent)" strokeWidth="1.5" />
                <circle cx="130" cy="118" r="2" fill="var(--illustration-accent)" />

                {/* Pointer/marker in raised hand */}
                <line
                    x1="116"
                    y1="138"
                    x2="138"
                    y2="118"
                    stroke="var(--mineral-text, #f5f5fa)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.85"
                />
                <circle cx="138" cy="118" r="2.5" fill="var(--illustration-accent)" />
            </MIllustration>
        )
    }
)
