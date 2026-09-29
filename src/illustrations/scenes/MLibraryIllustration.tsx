import {forwardRef} from 'react'
import {MIllustration} from '../MIllustration'
import type {MIllustrationProps} from '../MIllustration.types'

// Library scene — three bookshelves with multi-coloured book spines.
export const MLibraryIllustration = forwardRef<SVGSVGElement, MIllustrationProps>(
    function MLibraryIllustration(props, ref) {
        return (
            <MIllustration ref={ref} viewBox="0 0 200 200" {...props}>
                {/* Ground shadow */}
                <ellipse cx="100" cy="180" rx="74" ry="5" fill="var(--mineral-border, #3a3f47)" opacity="0.25" />

                {/* Decorative glow */}
                <ellipse cx="100" cy="100" rx="86" ry="64" fill="var(--illustration-accent)" opacity="0.05" />

                {/* Bookcase frame */}
                <rect
                    x="22"
                    y="28"
                    width="156"
                    height="142"
                    rx="3"
                    fill="var(--mineral-surface, #1a1d23)"
                    stroke="var(--mineral-border, #3a3f47)"
                    strokeWidth="2"
                />
                {/* Top + bottom plates */}
                <rect x="22" y="28" width="156" height="6" fill="var(--mineral-border, #3a3f47)" opacity="0.55" />
                <rect x="22" y="164" width="156" height="6" fill="var(--mineral-border, #3a3f47)" opacity="0.55" />

                {/* Shelf 1 */}
                <g transform="translate(28 38)">
                    <rect x="0" y="0" width="144" height="36" fill="var(--mineral-surface-contrast, #13151a)" />
                    {/* Books */}
                    <rect x="2" y="4" width="10" height="32" fill="var(--illustration-accent)" opacity="0.85" />
                    <rect x="14" y="2" width="8" height="34" fill="var(--mineral-info, #3b82f6)" opacity="0.75" />
                    <rect x="24" y="6" width="12" height="30" fill="var(--mineral-success, #22c55e)" opacity="0.75" />
                    <rect x="38" y="3" width="6" height="33" fill="var(--mineral-warning, #f59e0b)" opacity="0.75" />
                    <rect x="46" y="8" width="14" height="28" fill="var(--mineral-news, #8b5cf6)" opacity="0.75" />
                    <rect x="62" y="4" width="10" height="32" fill="var(--mineral-error, #ef4444)" opacity="0.75" />
                    <rect x="74" y="6" width="8" height="30" fill="var(--illustration-accent)" opacity="0.55" />
                    {/* Tilted book */}
                    <g transform="translate(86 4) rotate(8)">
                        <rect x="0" y="0" width="10" height="32" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                    </g>
                    <rect x="100" y="2" width="8" height="34" fill="var(--mineral-success, #22c55e)" opacity="0.7" />
                    <rect x="110" y="4" width="12" height="32" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                    <rect x="124" y="6" width="6" height="30" fill="var(--illustration-accent)" opacity="0.85" />
                    <rect x="132" y="3" width="10" height="33" fill="var(--mineral-news, #8b5cf6)" opacity="0.7" />
                    {/* Shelf board */}
                    <rect x="-2" y="36" width="148" height="4" fill="var(--mineral-border, #3a3f47)" />
                </g>

                {/* Shelf 2 */}
                <g transform="translate(28 82)">
                    <rect x="0" y="0" width="144" height="36" fill="var(--mineral-surface-contrast, #13151a)" />
                    <rect x="2" y="6" width="8" height="30" fill="var(--mineral-success, #22c55e)" opacity="0.75" />
                    <rect x="12" y="2" width="14" height="34" fill="var(--mineral-warning, #f59e0b)" opacity="0.75" />
                    <rect x="28" y="4" width="6" height="32" fill="var(--mineral-error, #ef4444)" opacity="0.85" />
                    <rect x="36" y="6" width="10" height="30" fill="var(--illustration-accent)" opacity="0.85" />
                    <rect x="48" y="2" width="8" height="34" fill="var(--mineral-info, #3b82f6)" opacity="0.75" />
                    <rect x="58" y="4" width="12" height="32" fill="var(--mineral-news, #8b5cf6)" opacity="0.75" />
                    {/* Decorative trinket */}
                    <rect x="74" y="22" width="10" height="14" rx="1" fill="var(--mineral-text, #f5f5fa)" opacity="0.55" />
                    <rect x="86" y="4" width="6" height="32" fill="var(--mineral-success, #22c55e)" opacity="0.85" />
                    <rect x="94" y="6" width="14" height="30" fill="var(--mineral-warning, #f59e0b)" opacity="0.55" />
                    <rect x="110" y="2" width="8" height="34" fill="var(--illustration-accent)" opacity="0.7" />
                    <rect x="120" y="4" width="10" height="32" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                    <rect x="132" y="6" width="10" height="30" fill="var(--illustration-accent)" opacity="0.55" />
                    <rect x="-2" y="36" width="148" height="4" fill="var(--mineral-border, #3a3f47)" />
                </g>

                {/* Shelf 3 */}
                <g transform="translate(28 126)">
                    <rect x="0" y="0" width="144" height="34" fill="var(--mineral-surface-contrast, #13151a)" />
                    <rect x="2" y="2" width="12" height="32" fill="var(--mineral-news, #8b5cf6)" opacity="0.85" />
                    <rect x="16" y="4" width="8" height="30" fill="var(--illustration-accent)" opacity="0.85" />
                    <rect x="26" y="6" width="10" height="28" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                    <rect x="38" y="2" width="6" height="32" fill="var(--mineral-success, #22c55e)" opacity="0.85" />
                    <rect x="46" y="4" width="14" height="30" fill="var(--mineral-info, #3b82f6)" opacity="0.7" />
                    {/* Lying horizontal stack */}
                    <rect x="62" y="22" width="20" height="6" fill="var(--mineral-error, #ef4444)" opacity="0.7" />
                    <rect x="62" y="28" width="20" height="6" fill="var(--mineral-warning, #f59e0b)" opacity="0.7" />
                    <rect x="86" y="2" width="8" height="32" fill="var(--mineral-news, #8b5cf6)" opacity="0.55" />
                    <rect x="96" y="4" width="12" height="30" fill="var(--illustration-accent)" opacity="0.7" />
                    <rect x="110" y="6" width="6" height="28" fill="var(--mineral-info, #3b82f6)" opacity="0.85" />
                    <rect x="118" y="2" width="10" height="32" fill="var(--mineral-success, #22c55e)" opacity="0.7" />
                    <rect x="130" y="4" width="12" height="30" fill="var(--mineral-warning, #f59e0b)" opacity="0.85" />
                </g>
            </MIllustration>
        )
    }
)
