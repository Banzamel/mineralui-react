import type {MGalleryProps} from './MGallery.types'
import {useState} from 'react'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {MMediaLightbox} from '../MMediaLightbox/MMediaLightbox'
import {usesHoverDim, usesHoverZoom} from '../mediaInteraction'
import './MGallery.css'
import {useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'

// Render a responsive image grid gallery.
export function MGallery({
    items,
    columns = 3,
    rounded = true,
    preview = false,
    hoverEffect = 'zoom',
    clickEffect = 'ripple',
    className,
    ...rest
}: MGalleryProps) {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(0)

    return (
        <>
            <div className={cn('gallery', `columns-${columns}`, className)} {...rest}>
                {items.map((item, i) => (
                    <GalleryFigure
                        key={i}
                        item={item}
                        rounded={rounded}
                        preview={preview}
                        hoverEffect={hoverEffect}
                        clickEffect={clickEffect}
                        onOpen={() => {
                            setPreviewIndex(i)
                            setPreviewOpen(true)
                        }}
                    />
                ))}
            </div>

            <MMediaLightbox
                open={previewOpen}
                items={items}
                activeIndex={previewIndex}
                onActiveIndexChange={setPreviewIndex}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    )
}

function GalleryFigure({
    item,
    rounded,
    preview,
    hoverEffect,
    clickEffect,
    onOpen,
}: {
    item: {src: string; thumbnail?: string; alt?: string; caption?: string}
    rounded: boolean
    preview: boolean
    hoverEffect: 'none' | 'zoom' | 'dim' | 'zoom-dim'
    clickEffect: 'none' | 'ripple'
    onOpen: () => void
}) {
    const texts = useMCommonTexts()
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLElement>({
        effect: clickEffect,
    })
    return (
        <figure className={cn('gallery-item', rounded && 'rounded')}>
            {preview ? (
                <button
                    type="button"
                    className={cn(
                        'gallery-trigger',
                        rounded && 'rounded',
                        'gallery-button',
                        usesHoverZoom(hoverEffect) && 'effect-zoom',
                        usesHoverDim(hoverEffect) && 'effect-dim',
                        effectClassName
                    )}
                    onClick={onOpen}
                    onPointerDown={handlePointerDown}
                    aria-label={formatMText(texts.previewItem, {name: item.alt || texts.image})}
                >
                    <img
                        className="gallery-image"
                        src={item.thumbnail || item.src}
                        alt={item.alt || ''}
                        loading="lazy"
                    />
                    {item.caption && <span className="gallery-caption">{item.caption}</span>}
                    {effectLayer}
                </button>
            ) : (
                <div
                    className={cn(
                        'gallery-trigger',
                        rounded && 'rounded',
                        usesHoverZoom(hoverEffect) && 'effect-zoom',
                        usesHoverDim(hoverEffect) && 'effect-dim',
                        effectClassName
                    )}
                    onPointerDown={handlePointerDown}
                >
                    <img
                        className="gallery-image"
                        src={item.thumbnail || item.src}
                        alt={item.alt || ''}
                        loading="lazy"
                    />
                    {item.caption && <span className="gallery-caption">{item.caption}</span>}
                    {effectLayer}
                </div>
            )}
        </figure>
    )
}
