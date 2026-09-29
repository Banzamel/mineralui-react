import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Calendar scene — calendar page with highlighted date and events.
export const MCalendarIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MCalendarIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Shadow */}
                <ellipse cx="100" cy="176" rx="56" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Calendar body */}
                <rect
                    x="32"
                    y="36"
                    width="136"
                    height="132"
                    rx="8"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />

                {/* Calendar header */}
                <rect x="32" y="36" width="136" height="28" rx="8" fill="var(--illustration-accent)" opacity="0.15" />
                <rect x="32" y="56" width="136" height="8" fill="var(--illustration-accent)" opacity="0.15" />

                {/* Binding rings */}
                <rect x="60" y="30" width="8" height="16" rx="3" fill="var(--mineral-border, #3a3f47)" />
                <rect x="92" y="30" width="8" height="16" rx="3" fill="var(--mineral-border, #3a3f47)" />
                <rect x="124" y="30" width="8" height="16" rx="3" fill="var(--mineral-border, #3a3f47)" />

                {/* Month title */}
                <rect x="56" y="44" width="44" height="5" rx="2" fill="var(--illustration-accent)" opacity="0.7" />
                <rect
                    x="112"
                    y="44"
                    width="16"
                    height="5"
                    rx="2"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.4"
                />

                {/* Day headers */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <rect
                        key={`dh-${i}`}
                        x={40 + i * 18}
                        y="72"
                        width="10"
                        height="3"
                        rx="1"
                        fill="var(--mineral-text-secondary, #6b7280)"
                        opacity="0.4"
                    />
                ))}

                {/* Day grid — 5 rows x 7 cols */}
                {[0, 1, 2, 3, 4].map((row) =>
                    [0, 1, 2, 3, 4, 5, 6].map((col) => {
                        const x = 40 + col * 18
                        const y = 84 + row * 18
                        const isHighlighted = row === 1 && col === 3
                        const hasEvent = (row === 2 && col === 1) || (row === 3 && col === 5)
                        const isEmpty = (row === 0 && col < 2) || (row === 4 && col > 3)

                        if (isEmpty) return null

                        return (
                            <g key={`d-${row}-${col}`}>
                                <rect
                                    x={x}
                                    y={y}
                                    width="12"
                                    height="12"
                                    rx="3"
                                    fill={isHighlighted ? 'var(--illustration-accent)' : 'var(--mineral-surface-contrast, #13151a)'}
                                    opacity={isHighlighted ? 0.85 : 0.4}
                                />
                                {hasEvent && (
                                    <circle
                                        cx={x + 6}
                                        cy={y + 14}
                                        r="1.5"
                                        fill="var(--illustration-accent)"
                                        opacity="0.6"
                                    />
                                )}
                            </g>
                        )
                    })
                )}

                {/* Decorative glow */}
                <ellipse cx="100" cy="104" rx="52" ry="48" fill="var(--illustration-accent)" opacity="0.03" />
            </MIllustration>
        )
    }
)
