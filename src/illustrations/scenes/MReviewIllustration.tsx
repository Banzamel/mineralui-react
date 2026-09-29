import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Review scene — five-star rating row with a speech bubble carrying excerpt of the opinion.
export const MReviewIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MReviewIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="178" rx="64" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="var(--illustration-accent)" opacity="0.06" />

                {/* Speech bubble (review card) */}
                <rect
                    x="32"
                    y="36"
                    width="136"
                    height="86"
                    rx="10"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Bubble tail */}
                <polygon
                    points="80,122 90,140 100,122"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Cover stroke under tail */}
                <line x1="80" y1="122" x2="100" y2="122" stroke="var(--mineral-surface, #1a1d23)" strokeWidth="3" />

                {/* Reviewer avatar */}
                <circle cx="50" cy="58" r="10" fill="var(--mineral-surface-contrast, #13151a)" stroke="var(--illustration-accent)" strokeWidth="2" />
                <circle cx="50" cy="56" r="3.5" fill="var(--illustration-accent)" opacity="0.85" />
                <path d="M42 64 C42 60 46 58 50 58 C54 58 58 60 58 64" fill="var(--illustration-accent)" opacity="0.85" />

                {/* Name + role */}
                <rect x="66" y="52" width="56" height="3.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" />
                <rect x="66" y="60" width="40" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />

                {/* Review text */}
                <rect x="44" y="78" width="116" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                <rect x="44" y="86" width="100" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                <rect x="44" y="94" width="108" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.6" />
                <rect x="44" y="102" width="64" height="2.5" rx="0.5" fill="var(--mineral-text-secondary, #6b7280)" opacity="0.5" />

                {/* Five stars row (centre-bottom) */}
                <g transform="translate(100 156)">
                    {[-32, -16, 0, 16, 32].map((dx, i) => (
                        <polygon
                            key={i}
                            points={`${dx},-10 ${dx + 3},-3 ${dx + 10},-3 ${dx + 4.5},2 ${dx + 6.5},9 ${dx},5 ${dx - 6.5},9 ${dx - 4.5},2 ${dx - 10},-3 ${dx - 3},-3`}
                            fill="var(--mineral-warning, #f59e0b)"
                            opacity={i < 5 ? 0.95 : 0.4}
                            stroke="var(--mineral-border, #3a3f47)"
                            strokeWidth="0.8"
                            strokeLinejoin="round"
                        />
                    ))}
                </g>

                {/* Subtle quotation marks */}
                <text x="42" y="74" fontFamily="inherit" fontSize="22" fontWeight="bold" fill="var(--illustration-accent)" opacity="0.4">"</text>
                <text x="156" y="112" fontFamily="inherit" fontSize="22" fontWeight="bold" fill="var(--illustration-accent)" opacity="0.4">"</text>
            </MIllustration>
        )
    }
)
