import {forwardRef} from 'react'
import type {CSSProperties} from 'react'
import {cn} from '../../../utils/cn'
import type {MHeroProps} from './MHero.types'
import './MHero.css'

// Landing-page hero: gradient, full-bleed background image with scrim, or a tilted screenshot.
export const MHero = forwardRef<HTMLElement, MHeroProps>(function MHero(
    {
        image,
        imageAlt = '',
        imageFit = 'cover',
        scrim = 'none',
        tilt = false,
        color = 'primary',
        minHeight = 420,
        align = 'center',
        className,
        style,
        children,
        ...rest
    },
    ref
) {
    const hasImage = image != null && image !== false && image !== ''
    const background = hasImage && !tilt
    const media =
        typeof image === 'string' ? (
            <img src={image} alt={imageAlt} className="mineral-hero-image" decoding="async" />
        ) : (
            image
        )

    const heroStyle = {
        '--hero-min-height': typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        ...style,
    } as CSSProperties

    return (
        <section
            ref={ref}
            className={cn(
                'mineral-hero',
                `color-${color}`,
                `align-${align}`,
                background ? `background fit-${imageFit}` : 'gradient',
                background && scrim !== 'none' && `scrim-${scrim}`,
                tilt && hasImage && 'tilt',
                className
            )}
            style={heroStyle}
            {...rest}
        >
            {background && <div className="mineral-hero-media">{media}</div>}
            <div className="mineral-hero-content">{children}</div>
            {tilt && hasImage && (
                <div className="mineral-hero-shot">
                    <div className="mineral-hero-shot-frame">{media}</div>
                </div>
            )}
        </section>
    )
})
