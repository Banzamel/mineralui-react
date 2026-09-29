import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Corporate scene — office building tower with a handshake in the foreground.
export const MCorporateIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MCorporateIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="74" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="80" rx="84" ry="64" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Side building (back-left) */}
                <rect
                    x="22"
                    y="60"
                    width="40"
                    height="108"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <g fill="var(--illustration-accent)" opacity="0.5">
                    <rect x="28" y="68" width="6" height="6" rx="1" />
                    <rect x="38" y="68" width="6" height="6" rx="1" opacity="0.6" />
                    <rect x="48" y="68" width="6" height="6" rx="1" opacity="0.4" />
                    <rect x="28" y="80" width="6" height="6" rx="1" opacity="0.7" />
                    <rect x="38" y="80" width="6" height="6" rx="1" />
                    <rect x="48" y="80" width="6" height="6" rx="1" opacity="0.6" />
                    <rect x="28" y="92" width="6" height="6" rx="1" opacity="0.4" />
                    <rect x="38" y="92" width="6" height="6" rx="1" opacity="0.7" />
                    <rect x="48" y="92" width="6" height="6" rx="1" opacity="0.5" />
                    <rect x="28" y="104" width="6" height="6" rx="1" opacity="0.6" />
                    <rect x="38" y="104" width="6" height="6" rx="1" opacity="0.4" />
                </g>

                {/* Main tower */}
                <rect
                    x="68"
                    y="32"
                    width="64"
                    height="136"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="68" y="32" width="64" height="6" fill="var(--illustration-accent)" opacity="0.85" />
                <g fill="var(--illustration-accent)" opacity="0.6">
                    <rect x="76" y="46" width="10" height="8" rx="1" />
                    <rect x="92" y="46" width="10" height="8" rx="1" opacity="0.55" />
                    <rect x="108" y="46" width="16" height="8" rx="1" opacity="0.7" />
                    <rect x="76" y="60" width="10" height="8" rx="1" opacity="0.55" />
                    <rect x="92" y="60" width="10" height="8" rx="1" />
                    <rect x="108" y="60" width="16" height="8" rx="1" opacity="0.5" />
                    <rect x="76" y="74" width="10" height="8" rx="1" opacity="0.7" />
                    <rect x="92" y="74" width="10" height="8" rx="1" opacity="0.55" />
                    <rect x="108" y="74" width="16" height="8" rx="1" />
                </g>
                {/* Door */}
                <rect x="92" y="138" width="16" height="30" rx="2" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />

                {/* Side building (back-right) */}
                <rect
                    x="138"
                    y="80"
                    width="40"
                    height="88"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <g fill="var(--illustration-accent)" opacity="0.5">
                    <rect x="144" y="88" width="6" height="6" rx="1" opacity="0.7" />
                    <rect x="154" y="88" width="6" height="6" rx="1" />
                    <rect x="164" y="88" width="6" height="6" rx="1" opacity="0.5" />
                    <rect x="144" y="100" width="6" height="6" rx="1" opacity="0.5" />
                    <rect x="154" y="100" width="6" height="6" rx="1" opacity="0.7" />
                    <rect x="164" y="100" width="6" height="6" rx="1" opacity="0.4" />
                    <rect x="144" y="112" width="6" height="6" rx="1" />
                    <rect x="164" y="112" width="6" height="6" rx="1" opacity="0.6" />
                </g>

                {/* Handshake — ground level, in front of door */}
                <g transform="translate(100 158)">
                    {/* Left arm/sleeve */}
                    <rect x="-30" y="-4" width="22" height="10" rx="2" fill="var(--illustration-accent)" opacity="0.85" />
                    {/* Right arm/sleeve */}
                    <rect x="8" y="-4" width="22" height="10" rx="2" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                    {/* Hands meeting */}
                    <ellipse cx="0" cy="1" rx="10" ry="6" fill="var(--mineral-text, #f5f5fa)" opacity="0.85" />
                    <ellipse cx="0" cy="1" rx="10" ry="6" fill="none" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" />
                </g>
            </MIllustration>
        )
    }
)
