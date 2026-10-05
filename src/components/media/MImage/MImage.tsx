import {useEffect, useId, useMemo, useState} from 'react'
import type * as React from 'react'
import type {CSSProperties} from 'react'
import type {MImageProps, MImageSize} from './MImage.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {MSkeleton} from '../../feedback'
import {MMediaLightbox} from '../MMediaLightbox/MMediaLightbox'
import {getMediaPreviewGroupItems, registerMediaPreviewItem} from '../mediaPreviewRegistry'
import {usesHoverDim, usesHoverZoom} from '../mediaInteraction'
import './MImage.css'
import {useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'

const RATIO_MAP: Record<string, string> = {
    '1:1': '1 / 1',
    '4:3': '4 / 3',
    '16:9': '16 / 9',
    '21:9': '21 / 9',
}

function toCssSize(value: MImageSize | undefined): string | undefined {
    if (value == null) return undefined
    return typeof value === 'number' ? `${value}px` : value
}

// Render a styled image with aspect ratio, fit, and optional fallback.
export function MImage({
    src,
    fit = 'cover',
    ratio = 'auto',
    width,
    height,
    hidden,
    rounded = false,
    bordered = false,
    shadow = false,
    preview = false,
    previewGroup,
    hoverEffect = 'none',
    clickEffect = 'none',
    fallback,
    skeleton = false,
    className,
    style,
    alt,
    onError,
    ...rest
}: MImageProps) {
    const texts = useMCommonTexts()
    const [errored, setErrored] = useState(false)
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewItems, setPreviewItems] = useState<Array<{src: string; alt?: string; caption?: string}>>([])
    const [previewIndex, setPreviewIndex] = useState(0)
    const previewId = useId()
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLElement>({
        effect: skeleton ? 'none' : clickEffect,
    })

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (fallback && !errored) {
            setErrored(true)
            e.currentTarget.src = fallback
        }
        onError?.(e)
    }

    const widthValue = toCssSize(width)
    const heightValue = toCssSize(height)
    const hasExplicitSize = widthValue != null || heightValue != null
    const hasFixedRatio = ratio !== 'auto' && !!RATIO_MAP[ratio]
    const sizeStyle: CSSProperties = {}
    if (widthValue != null) sizeStyle.width = widthValue
    if (heightValue != null) sizeStyle.height = heightValue
    const ratioStyle: CSSProperties = {
        ...style,
        ...(hasFixedRatio ? {aspectRatio: RATIO_MAP[ratio]} : null),
        ...sizeStyle,
    }
    const resolvedSrc = errored && fallback ? fallback : src
    const previewItem = useMemo(
        () => ({
            src: resolvedSrc || '',
            alt: alt ?? '',
            caption: typeof rest.title === 'string' ? rest.title : undefined,
        }),
        [alt, resolvedSrc, rest.title]
    )

    useEffect(() => {
        if (!preview || !previewGroup || !resolvedSrc) {
            return
        }

        return registerMediaPreviewItem(previewGroup, previewId, previewItem)
    }, [preview, previewGroup, previewId, previewItem, resolvedSrc])

    // Skeleton placeholder
    if (skeleton) {
        return (
            <MSkeleton
                variant="rectangle"
                animate="pulse"
                className={cn('image-skeleton', rounded && 'rounded', bordered && 'bordered', className)}
                style={ratioStyle}
                aria-label={texts.loading}
                {...getHiddenProps(hidden)}
            />
        )
    }

    const openPreview = () => {
        if (!preview || !resolvedSrc) {
            return
        }

        if (previewGroup) {
            const groupItems = getMediaPreviewGroupItems(previewGroup)
            const currentIndex = groupItems.findIndex((item) => item.id === previewId)

            if (groupItems.length > 0 && currentIndex >= 0) {
                setPreviewItems(groupItems.map(({id, ...item}) => item))
                setPreviewIndex(currentIndex)
                setPreviewOpen(true)
                return
            }
        }

        setPreviewItems([previewItem])
        setPreviewIndex(0)
        setPreviewOpen(true)
    }

    const imgClassName = cn(
        'image',
        fit,
        !effectLayer && rounded && 'rounded',
        !effectLayer && bordered && 'bordered',
        !effectLayer && shadow && 'shadow'
    )
    const usesWrapper = hasFixedRatio || hasExplicitSize || Boolean(effectLayer) || preview || hoverEffect !== 'none'
    const wrapperClassName = cn(
        'image-wrap',
        hasFixedRatio && 'has-ratio',
        hasExplicitSize && 'has-size',
        rounded && 'rounded',
        bordered && 'bordered',
        shadow && 'shadow',
        preview && 'preview',
        usesHoverZoom(hoverEffect) && 'effect-zoom',
        usesHoverDim(hoverEffect) && 'effect-dim',
        effectClassName,
        className
    )
    const imageNode = <img className={imgClassName} onError={handleError} src={resolvedSrc} {...rest} alt={alt ?? ''} />

    if (usesWrapper) {
        return (
            <>
                {preview ? (
                    <button
                        type="button"
                        className={cn(wrapperClassName, 'image-button')}
                        aria-label={formatMText(texts.previewItem, {name: alt || texts.image})}
                        onClick={openPreview}
                        onPointerDown={effectLayer ? handlePointerDown : undefined}
                        disabled={!resolvedSrc}
                        {...getHiddenProps(hidden)}
                        style={ratioStyle}
                    >
                        {effectLayer}
                        {imageNode}
                    </button>
                ) : (
                    <span
                        className={wrapperClassName}
                        onPointerDown={effectLayer ? handlePointerDown : undefined}
                        {...getHiddenProps(hidden)}
                        style={ratioStyle}
                    >
                        {effectLayer}
                        {imageNode}
                    </span>
                )}

                <MMediaLightbox
                    open={previewOpen}
                    items={previewItems}
                    activeIndex={previewIndex}
                    onActiveIndexChange={setPreviewIndex}
                    onClose={() => setPreviewOpen(false)}
                />
            </>
        )
    }

    return (
        <>
            <img
                className={cn(imgClassName, className)}
                style={ratioStyle}
                onError={handleError}
                src={resolvedSrc}
                {...getHiddenProps(hidden)}
                {...rest}
                alt={alt ?? ''}
            />

            <MMediaLightbox
                open={previewOpen}
                items={previewItems}
                activeIndex={previewIndex}
                onActiveIndexChange={setPreviewIndex}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    )
}
