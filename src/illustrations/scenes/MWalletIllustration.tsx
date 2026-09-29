import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Wallet scene — wallet with credit card and coins.
export const MWalletIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MWalletIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Shadow */}
                <ellipse cx="100" cy="170" rx="56" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Wallet body */}
                <rect
                    x="32"
                    y="64"
                    width="136"
                    height="96"
                    rx="8"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Wallet flap */}
                <path
                    d="M32 88 L32 72 C32 67.6 35.6 64 40 64 L160 64 C164.4 64 168 67.6 168 72 L168 88"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                <rect x="32" y="84" width="136" height="6" fill="var(--illustration-accent)" opacity="0.15" />

                {/* Wallet clasp */}
                <rect
                    x="130"
                    y="96"
                    width="30"
                    height="24"
                    rx="4"
                    fill="var(--mineral-surface-contrast, #13151a)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="1.5"
                />
                <circle cx="145" cy="108" r="6" fill="var(--illustration-accent)" opacity="0.5" />
                <circle cx="145" cy="108" r="3" fill="var(--mineral-surface-contrast, #13151a)" />

                {/* Credit card peeking out */}
                <rect
                    x="42"
                    y="40"
                    width="80"
                    height="50"
                    rx="5"
                    fill="var(--illustration-accent)"
                    opacity="0.7"
                    transform="rotate(-6 82 65)"
                />
                <rect
                    x="50"
                    y="52"
                    width="24"
                    height="4"
                    rx="1"
                    fill="var(--mineral-text-inverted, #ffffff)"
                    opacity="0.4"
                    transform="rotate(-6 62 54)"
                />
                <rect
                    x="50"
                    y="60"
                    width="40"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-inverted, #ffffff)"
                    opacity="0.25"
                    transform="rotate(-6 70 62)"
                />
                <rect
                    x="96"
                    y="44"
                    width="16"
                    height="12"
                    rx="2"
                    fill="var(--mineral-text-inverted, #ffffff)"
                    opacity="0.15"
                    transform="rotate(-6 104 50)"
                />

                {/* Coins */}
                <ellipse cx="60" cy="140" rx="14" ry="5" fill="var(--mineral-warning, #f59e0b)" opacity="0.2" />
                <ellipse cx="60" cy="138" rx="14" ry="5" fill="var(--mineral-warning, #f59e0b)" opacity="0.3" />
                <ellipse
                    cx="60"
                    cy="136"
                    rx="14"
                    ry="5"
                    fill="var(--mineral-warning, #f59e0b)"
                    opacity="0.5"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="0.5"
                />

                <ellipse cx="84" cy="142" rx="12" ry="4" fill="var(--mineral-warning, #f59e0b)" opacity="0.2" />
                <ellipse
                    cx="84"
                    cy="140"
                    rx="12"
                    ry="4"
                    fill="var(--mineral-warning, #f59e0b)"
                    opacity="0.4"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="0.5"
                />

                {/* Currency symbol on top coin */}
                <text
                    x="60"
                    y="138"
                    textAnchor="middle"
                    fontFamily="inherit"
                    fontSize="7"
                    fontWeight="bold"
                    fill="var(--mineral-surface, #1a1d23)"
                    opacity="0.6"
                >
                    $
                </text>

                {/* Balance display */}
                <rect x="42" y="102" width="76" height="12" rx="2" fill="var(--mineral-surface-contrast, #13151a)" opacity="0.5" />
                <rect x="46" y="105" width="40" height="5" rx="1" fill="var(--illustration-accent)" opacity="0.4" />

                {/* Glow */}
                <ellipse cx="100" cy="100" rx="56" ry="46" fill="var(--illustration-accent)" opacity="0.03" />
            </MIllustration>
        )
    }
)
