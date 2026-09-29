import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Settings scene — interlocking gear wheels with toggle switches.
export const MSettingsIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MSettingsIllustration(props, ref) {
        // Gear tooth path generator
        const gearPath = (cx: number, cy: number, r: number, teeth: number) => {
            const inner = r * 0.7
            const outer = r
            const step = (Math.PI * 2) / (teeth * 2)
            let d = ''
            for (let i = 0; i < teeth * 2; i++) {
                const radius = i % 2 === 0 ? outer : inner
                const x = cx + radius * Math.cos(i * step - Math.PI / 2)
                const y = cy + radius * Math.sin(i * step - Math.PI / 2)
                d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `
            }
            return d + 'Z'
        }

        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Main gear */}
                <path
                    d={gearPath(90, 88, 42, 10)}
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="2"
                />
                <circle cx="90" cy="88" r="16" fill="var(--mineral-surface-contrast, #13151a)" />
                <circle cx="90" cy="88" r="8" fill="var(--illustration-accent)" opacity="0.3" />

                {/* Secondary gear */}
                <path
                    d={gearPath(140, 120, 28, 8)}
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    opacity="0.8"
                />
                <circle cx="140" cy="120" r="10" fill="var(--mineral-surface-contrast, #13151a)" />
                <circle cx="140" cy="120" r="5" fill="var(--illustration-accent)" opacity="0.25" />

                {/* Small gear */}
                <path
                    d={gearPath(52, 140, 18, 6)}
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--illustration-accent)"
                    strokeWidth="1.5"
                    opacity="0.6"
                />
                <circle cx="52" cy="140" r="7" fill="var(--mineral-surface-contrast, #13151a)" />
                <circle cx="52" cy="140" r="3.5" fill="var(--illustration-accent)" opacity="0.2" />

                {/* Toggle switch 1 — on */}
                <rect x="120" y="44" width="40" height="18" rx="9" fill="var(--illustration-accent)" opacity="0.3" />
                <circle cx="148" cy="53" r="7" fill="var(--illustration-accent)" />

                {/* Toggle switch 2 — off */}
                <rect
                    x="120"
                    y="68"
                    width="40"
                    height="18"
                    rx="9"
                    fill="var(--mineral-border, #3a3f47)"
                    opacity="0.4"
                />
                <circle cx="132" cy="77" r="7" fill="var(--mineral-border, #3a3f47)" />

                {/* Setting labels */}
                <rect
                    x="166"
                    y="50"
                    width="20"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.3"
                />
                <rect
                    x="166"
                    y="74"
                    width="16"
                    height="3"
                    rx="1"
                    fill="var(--mineral-text-secondary, #6b7280)"
                    opacity="0.3"
                />

                {/* Decorative dots */}
                <circle cx="34" cy="50" r="2" fill="var(--illustration-accent)" opacity="0.2" />
                <circle cx="170" cy="160" r="2" fill="var(--illustration-accent)" opacity="0.2" />
                <circle cx="100" cy="172" r="1.5" fill="var(--illustration-accent)" opacity="0.15" />

                {/* Glow */}
                <ellipse cx="100" cy="100" rx="58" ry="50" fill="var(--illustration-accent)" opacity="0.03" />
            </MIllustration>
        )
    }
)
