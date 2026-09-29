import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Refund scene — circular U-turn arrow with coins flowing back to a wallet/pocket.
export const MRefundIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MRefundIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="86" ry="60" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Big U-turn arrow */}
                <path
                    d="M44 120 L44 80 C44 56 64 36 88 36 L132 36 C156 36 176 56 176 80 L176 96"
                    fill="none"
                    stroke="var(--illustration-accent)"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Arrow head */}
                <polygon
                    points="166,96 186,96 176,116"
                    fill="var(--illustration-accent)"
                />

                {/* Tail end disk (where the refund "comes back" to) */}
                <circle cx="44" cy="124" r="9" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--illustration-accent)" strokeWidth="3" />
                <line x1="40" y1="124" x2="48" y2="124" stroke="var(--illustration-accent)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Coins along the curve (3 coins, decreasing fade) */}
                <g>
                    {/* Coin 1 — bigger, near the arrow head */}
                    <circle cx="146" cy="58" r="14" fill="var(--mineral-warning, #f59e0b)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    <circle cx="146" cy="58" r="9" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1" opacity="0.85" />
                    <text x="146" y="62" textAnchor="middle" fontFamily="inherit" fontSize="11" fontWeight="bold" fill="var(--mineral-text, #f5f5fa)">$</text>

                    {/* Coin 2 — middle */}
                    <circle cx="100" cy="48" r="12" fill="var(--mineral-warning, #f59e0b)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" opacity="0.92" />
                    <circle cx="100" cy="48" r="7.5" fill="none" stroke="var(--mineral-text, #f5f5fa)" strokeWidth="1" opacity="0.85" />
                    <text x="100" y="51.5" textAnchor="middle" fontFamily="inherit" fontSize="9" fontWeight="bold" fill="var(--mineral-text, #f5f5fa)">$</text>

                    {/* Coin 3 — small, near the destination */}
                    <circle cx="60" cy="64" r="9" fill="var(--mineral-warning, #f59e0b)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1.5" opacity="0.85" />
                    <text x="60" y="67" textAnchor="middle" fontFamily="inherit" fontSize="7" fontWeight="bold" fill="var(--mineral-text, #f5f5fa)">$</text>
                </g>

                {/* Wallet / pocket destination (bottom-left) */}
                <g transform="translate(20 130)">
                    <rect x="0" y="0" width="56" height="34" rx="5" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    <path d="M0 8 L0 6 C0 3 2 0 6 0 L50 0 C54 0 56 3 56 6 L56 8" fill="var(--mineral-surface, #1a1d23)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="2" />
                    <rect x="0" y="6" width="56" height="3" fill="var(--illustration-accent)" opacity="0.55" />
                    {/* Clasp */}
                    <rect x="38" y="14" width="14" height="10" rx="2" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--mineral-border, #3a3f47)" strokeWidth="1" />
                    <circle cx="45" cy="19" r="2.5" fill="var(--illustration-accent)" />
                </g>
            </MIllustration>
        )
    }
)
