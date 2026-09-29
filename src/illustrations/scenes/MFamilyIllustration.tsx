import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Family scene — house silhouette with a parent and two children inside.
export const MFamilyIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MFamilyIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="64" fill="var(--illustration-accent)" opacity="0.05" />

                {/* House — roof */}
                <polygon
                    points="100,28 168,80 32,80"
                    fill="var(--illustration-accent)"
                    opacity="0.75"
                />
                <polygon
                    points="100,28 168,80 32,80"
                    fill="none"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Chimney */}
                <rect x="138" y="44" width="10" height="22" fill="var(--illustration-accent)" opacity="0.85" />
                <rect x="138" y="44" width="10" height="22" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />

                {/* House — body */}
                <rect
                    x="40"
                    y="80"
                    width="120"
                    height="80"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Window left (sun) */}
                <rect
                    x="50"
                    y="92"
                    width="22"
                    height="20"
                    rx="2"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <line x1="61" y1="92" x2="61" y2="112" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <line x1="50" y1="102" x2="72" y2="102" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />

                {/* Window right */}
                <rect
                    x="128"
                    y="92"
                    width="22"
                    height="20"
                    rx="2"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <line x1="139" y1="92" x2="139" y2="112" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                <line x1="128" y1="102" x2="150" y2="102" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />

                {/* Door (centered) — frames the family */}
                <rect
                    x="80"
                    y="100"
                    width="40"
                    height="60"
                    rx="2"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Family — parent (center, taller) */}
                <circle cx="100" cy="118" r="6" fill="var(--mineral-surface, #1a1d23)" stroke="var(--illustration-accent)" strokeWidth="1.5" />
                <rect x="94" y="124" width="12" height="20" rx="3" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Child 1 (left) */}
                <circle cx="88" cy="130" r="4.5" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-info, #3b82f6)" strokeWidth="1.5" />
                <rect x="83.5" y="135" width="9" height="14" rx="2" fill="var(--mineral-info, #3b82f6)" opacity="0.75" />

                {/* Child 2 (right) */}
                <circle cx="112" cy="130" r="4.5" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-success, #22c55e)" strokeWidth="1.5" />
                <rect x="107.5" y="135" width="9" height="14" rx="2" fill="var(--mineral-success, #22c55e)" opacity="0.75" />

                {/* Doorknob */}
                <circle cx="115" cy="135" r="1.4" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
            </MIllustration>
        )
    }
)
