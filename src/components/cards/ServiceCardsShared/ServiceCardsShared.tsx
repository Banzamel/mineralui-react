import {useEffect, useState} from 'react'
import type {SharedServiceCardProps} from './ServiceCardsShared.types'
import {cn} from '../../../utils/cn'
import {MClockIcon, MEllipsisVerticalIcon, MHeartFillIcon, MHeartIcon, MMinusIcon, MPlusIcon} from '../../../icons'
import {MButton} from '../../controls'
import {MBadge} from '../../feedback'
import {MAvatar} from '../../media'
import {MRating} from '../../display'
import {MDropdownItem, MDropdownMenu} from '../../overlays'
import './ServiceCardsShared.css'
import {useMCardTexts, useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'
import {useOptionalMI18n} from '../../../i18n/MI18nProvider'

function pad2(value: number) {
    return String(value).padStart(2, '0')
}

// Short month in the active MI18nProvider locale; English without a provider or for an unknown tag.
function formatShortMonth(date: Date, locale?: string) {
    try {
        return date.toLocaleString(locale ?? 'en', {month: 'short'}).toUpperCase()
    } catch {
        return date.toLocaleString('en', {month: 'short'}).toUpperCase()
    }
}

export function SharedServiceCard({
    variant,
    title,
    description,
    price,
    currency = 'PLN',
    duration,
    available,
    image,
    gallery,
    galleryAutoPlay = false,
    rating,
    reviewCount,
    favorite,
    onFavorite,
    menuItems,
    onAddToCart,
    actionLabel,
    icon,
    color = 'primary',
    leader,
    participants,
    maxParticipants,
    quantity: controlledQty,
    onQuantityChange,
    showQuantity = true,
    date,
    location,
    status,
    className,
    ...rest
}: SharedServiceCardProps) {
    const texts = useMCommonTexts()
    const favoriteTexts = useMCardTexts()
    const cardTexts = favoriteTexts.serviceCard
    const locale = useOptionalMI18n()?.locale
    const [galleryIdx, setGalleryIdx] = useState(0)
    const [isGalleryTransitioning, setIsGalleryTransitioning] = useState(false)
    const [internalQty, setInternalQty] = useState(1)

    const qty = controlledQty ?? internalQty
    const images = gallery && gallery.length > 0 ? gallery : image ? [image] : []

    useEffect(() => {
        if (galleryIdx >= images.length) {
            setGalleryIdx(0)
        }
    }, [galleryIdx, images.length])

    useEffect(() => {
        if (!isGalleryTransitioning) {
            return
        }

        const transitionId = window.setTimeout(() => {
            setIsGalleryTransitioning(false)
        }, 220)

        return () => window.clearTimeout(transitionId)
    }, [galleryIdx, isGalleryTransitioning])

    function changeGallery(nextIdx: number) {
        if (nextIdx === galleryIdx || nextIdx < 0 || nextIdx >= images.length) {
            return
        }

        if (images.length > 1) {
            setIsGalleryTransitioning(true)
        }

        setGalleryIdx(nextIdx)
    }

    useEffect(() => {
        if (!galleryAutoPlay || images.length <= 1) {
            return
        }

        const intervalId = window.setInterval(() => {
            setIsGalleryTransitioning(true)
            setGalleryIdx((current) => (current + 1) % images.length)
        }, 3500)

        return () => window.clearInterval(intervalId)
    }, [galleryAutoPlay, images.length])

    function changeQty(next: number) {
        const val = Math.max(1, next)
        if (onQuantityChange) onQuantityChange(val)
        else setInternalQty(val)
    }

    const availLabel =
        available === true
            ? cardTexts.available
            : available === false
              ? cardTexts.unavailable
              : typeof available === 'number'
                ? formatMText(cardTexts.spots, {count: available})
                : null

    const rawDate = date ? (date instanceof Date ? date : new Date(date)) : null
    const parsedDate = rawDate && !Number.isNaN(rawDate.getTime()) ? rawDate : null
    const dateDay = parsedDate ? parsedDate.getDate() : null
    const dateMonth = parsedDate ? formatShortMonth(parsedDate, locale) : null
    const dateTime = parsedDate
        ? `${parsedDate.getFullYear()}-${pad2(parsedDate.getMonth() + 1)}-${pad2(parsedDate.getDate())}`
        : undefined
    const ratingLabel =
        rating !== undefined
            ? reviewCount !== undefined
                ? formatMText(cardTexts.ratingWithReviews, {value: rating.toFixed(1), count: reviewCount})
                : formatMText(cardTexts.rating, {value: rating.toFixed(1)})
            : undefined

    return (
        <div className={cn('card-service', variant, `color-${color}`, className)} {...rest}>
            {images.length > 0 && (
                <div className="cs-gallery">
                    {/* Decorative: the title is already the card heading, so it is not read twice. */}
                    <img
                        src={images[galleryIdx]}
                        alt={''}
                        className={cn('cs-image', isGalleryTransitioning && 'is-transitioning')}
                    />
                    {images.length > 1 && (
                        <div className="cs-gallery-dots">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className={cn('cs-dot', i === galleryIdx && 'active')}
                                    onClick={() => changeGallery(i)}
                                    aria-label={formatMText(texts.imageNumber, {index: i + 1})}
                                    aria-current={i === galleryIdx ? 'true' : undefined}
                                />
                            ))}
                        </div>
                    )}

                    {(onFavorite || (menuItems && menuItems.length > 0)) && (
                        <div className="cs-gallery-actions">
                            {menuItems && menuItems.length > 0 && (
                                <MDropdownMenu
                                    className="cs-menu-wrap"
                                    trigger={
                                        <MButton
                                            variant="ghost"
                                            iconOnly
                                            shape="circle"
                                            aria-label={texts.moreOptions}
                                            className="cs-overlay-btn"
                                        >
                                            <MEllipsisVerticalIcon />
                                        </MButton>
                                    }
                                    placement="bottom-end"
                                >
                                    {menuItems.map((item, i) => (
                                        <MDropdownItem
                                            key={i}
                                            icon={item.icon}
                                            color={item.danger ? 'error' : undefined}
                                            label={item.label}
                                            onClick={item.onClick}
                                        />
                                    ))}
                                </MDropdownMenu>
                            )}
                            {onFavorite && (
                                <MButton
                                    variant="ghost"
                                    iconOnly
                                    shape="circle"
                                    onClick={onFavorite}
                                    aria-label={
                                        favorite ? favoriteTexts.removeFromFavorites : favoriteTexts.addToFavorites
                                    }
                                    className={cn('cs-overlay-btn', favorite && 'cs-fav-active')}
                                >
                                    {favorite ? <MHeartFillIcon /> : <MHeartIcon />}
                                </MButton>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="cs-body">
                {variant === 'event' && parsedDate && (
                    <div className="cs-event-header">
                        <time className="cs-date-block" dateTime={dateTime}>
                            <span className="cs-date-day">{dateDay}</span>
                            <span className="cs-date-month">{dateMonth}</span>
                        </time>
                        <div className="cs-event-info">
                            <h3 className="cs-title">{title}</h3>
                            {description && <p className="cs-desc">{description}</p>}
                        </div>
                    </div>
                )}

                {variant !== 'event' && (
                    <>
                        <div className="cs-top">
                            {icon && <span className="cs-icon">{icon}</span>}
                            <h3 className="cs-title">{title}</h3>
                        </div>
                        {description && <p className="cs-desc">{description}</p>}
                    </>
                )}

                {variant === 'event' && !parsedDate && (
                    <>
                        <div className="cs-top">
                            {icon && <span className="cs-icon">{icon}</span>}
                            <h3 className="cs-title">{title}</h3>
                        </div>
                        {description && <p className="cs-desc">{description}</p>}
                    </>
                )}

                {rating !== undefined && (
                    <div className="cs-rating" role="img" aria-label={ratingLabel}>
                        <MRating value={Math.round(rating)} size="sm" color="warning" readOnly className="cs-stars" />
                        <span className="cs-rating-value">{rating.toFixed(1)}</span>
                        {reviewCount !== undefined && <span className="cs-review-count">({reviewCount})</span>}
                    </div>
                )}

                {leader && (
                    <div className="cs-leader">
                        <MAvatar src={leader.avatar} name={leader.name} size={28} color={color} />
                        <span className="cs-leader-name">{leader.name}</span>
                    </div>
                )}

                {variant === 'course' && participants && (
                    <div className="cs-participants">
                        <div className="cs-participants-avatars">
                            {participants.slice(0, 4).map((participant, index) => (
                                <MAvatar
                                    key={`${participant.name}-${index}`}
                                    src={participant.avatar}
                                    name={participant.name}
                                    size={28}
                                    color={color}
                                    className="cs-participant-avatar"
                                />
                            ))}
                        </div>
                        {maxParticipants && (
                            <span
                                className="cs-spots"
                                role="img"
                                aria-label={formatMText(cardTexts.participants, {
                                    count: participants.length,
                                    max: maxParticipants,
                                })}
                            >
                                {participants.length}/{maxParticipants}
                            </span>
                        )}
                    </div>
                )}

                <div className="cs-meta">
                    {variant === 'event' && location && (
                        <MBadge size="xs" color={color}>
                            {location}
                        </MBadge>
                    )}
                    {duration && (
                        <MBadge size="xs" color={color} icon={<MClockIcon />}>
                            {duration}
                        </MBadge>
                    )}
                    {variant === 'event' && status && (
                        <MBadge size="xs" color={status.toLowerCase() === 'sold out' ? 'error' : color}>
                            {status}
                        </MBadge>
                    )}
                    {availLabel && variant !== 'event' && (
                        <MBadge size="xs" color={available === false ? 'error' : color}>
                            {availLabel}
                        </MBadge>
                    )}
                </div>
            </div>

            <div className="cs-footer">
                {price !== undefined && (
                    <span className="cs-price">
                        {typeof price === 'number' ? price.toFixed(2) : price}{' '}
                        <span className="cs-currency">{currency}</span>
                    </span>
                )}

                <div className="cs-actions">
                    {variant === 'product' && onAddToCart && showQuantity && (
                        <div className="cs-qty">
                            <MButton
                                variant="ghost"
                                iconOnly
                                size="sm"
                                onClick={() => changeQty(qty - 1)}
                                aria-label={texts.decrease}
                                className="cs-qty-btn"
                            >
                                <MMinusIcon />
                            </MButton>
                            <span className="cs-qty-value">{qty}</span>
                            <MButton
                                variant="ghost"
                                iconOnly
                                size="sm"
                                onClick={() => changeQty(qty + 1)}
                                aria-label={texts.increase}
                                className="cs-qty-btn"
                            >
                                <MPlusIcon />
                            </MButton>
                        </div>
                    )}
                    {onAddToCart && (
                        <MButton
                            variant="filled"
                            size="sm"
                            color={color}
                            onClick={() => onAddToCart(qty)}
                            disabled={available === false}
                            className="cs-cart-btn"
                        >
                            {actionLabel ?? (variant === 'event' ? cardTexts.register : cardTexts.addToCart)}
                        </MButton>
                    )}
                </div>
            </div>
        </div>
    )
}
