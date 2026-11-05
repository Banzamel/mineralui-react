import type {HTMLAttributes} from 'react'
import type {MClickEffect} from '../../../utils/useInteractionEffect'
import type {MMediaHoverEffect} from '../mediaInteraction'

export type MGalleryColumns = 2 | 3 | 4 | 5 | 6
/** Thumbnail frame ratio. `'auto'` keeps each image's own proportions. */
export type MGalleryRatio = '1:1' | 'auto' | '16:9' | '9:16' | '4:3' | '3:2'
/** How the image fills its frame: `'cover'` crops, `'contain'` shows the whole image. */
export type MGalleryFit = 'cover' | 'contain'

export interface MGalleryItem {
    src: string
    /**
     * Optional small-size variant rendered in the grid `<img>`. The lightbox preview always
     * loads the full `src`. When omitted the grid falls back to `src`.
     */
    thumbnail?: string
    alt?: string
    caption?: string
}

export interface MGalleryProps extends HTMLAttributes<HTMLDivElement> {
    items: MGalleryItem[]
    columns?: MGalleryColumns
    /** Thumbnail ratio. Default `'1:1'` (square, as before 2.7.0). */
    ratio?: MGalleryRatio
    /** Thumbnail fit. Default `'cover'`. */
    fit?: MGalleryFit
    rounded?: boolean
    preview?: boolean
    hoverEffect?: MMediaHoverEffect
    clickEffect?: MClickEffect
}
