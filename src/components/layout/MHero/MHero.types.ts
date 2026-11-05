import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'
import type {MColor} from '../../../theme'

export type MHeroImageFit = 'cover' | 'contain'
/** Darkening gradient over a background image so text stays readable. */
export type MHeroScrim = 'none' | 'left' | 'bottom' | 'both'
/** Vertical placement of the content: top, middle or bottom of the hero. */
export type MHeroAlign = 'start' | 'center' | 'end'

export interface MHeroProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /**
     * Image URL or a node (e.g. `<MImage />`). Without `tilt` it fills the hero as a background;
     * with `tilt` it is shown as a tilted screenshot next to the content.
     */
    image?: string | ReactNode
    /** Alt text for a URL `image`. Default `''` (decorative). */
    imageAlt?: string
    /** How a background image fills the hero. Default `'cover'`. */
    imageFit?: MHeroImageFit
    /** Default `'none'`. Only applies to a background image (not to `tilt`). */
    scrim?: MHeroScrim
    /** Tilted screenshot on a gradient instead of a full-bleed background. Default `false`. */
    tilt?: boolean
    /** Gradient hue (when there is no background image). Default `'primary'`. */
    color?: MColor
    /** Minimum height (number = px). Default `420`. */
    minHeight?: number | string
    /** Vertical placement of `children`. Default `'center'`. */
    align?: MHeroAlign
    className?: string
    style?: CSSProperties
    children?: ReactNode
}
