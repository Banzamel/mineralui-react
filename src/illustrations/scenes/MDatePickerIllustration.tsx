import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

export const MDatePickerIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MDatePickerIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                <rect
                    x="42"
                    y="34"
                    width="116"
                    height="126"
                    rx="14"
                    fill="var(--mineral-surface)"
                    stroke="var(--mineral-border)"
                    strokeWidth="2"
                />
                <rect x="42" y="34" width="116" height="28" rx="14" fill="var(--illustration-accent)" opacity="0.18" />
                <rect x="58" y="26" width="10" height="20" rx="5" fill="var(--mineral-text-secondary)" />
                <rect x="132" y="26" width="10" height="20" rx="5" fill="var(--mineral-text-secondary)" />
                <rect x="58" y="78" width="24" height="20" rx="6" fill="var(--illustration-accent)" opacity="0.18" />
                <rect x="88" y="78" width="24" height="20" rx="6" fill="var(--mineral-info)" opacity="0.12" />
                <rect x="118" y="78" width="24" height="20" rx="6" fill="var(--mineral-warning)" opacity="0.12" />
                <rect
                    x="58"
                    y="104"
                    width="24"
                    height="20"
                    rx="6"
                    fill="var(--mineral-surface-contrast)"
                    stroke="var(--mineral-border)"
                />
                <rect
                    x="88"
                    y="104"
                    width="24"
                    height="20"
                    rx="6"
                    fill="var(--mineral-surface-contrast)"
                    stroke="var(--mineral-border)"
                />
                <rect x="118" y="104" width="24" height="20" rx="6" fill="var(--illustration-accent)" opacity="0.75" />
                <path
                    d="M124 114 L129 119 L138 108"
                    stroke="var(--mineral-dark-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <ellipse cx="100" cy="154" rx="44" ry="8" fill="var(--illustration-accent)" opacity="0.05" />
            </MIllustration>
        )
    }
)
