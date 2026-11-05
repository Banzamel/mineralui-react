import {isValidElement, useEffect, useRef} from 'react'
import type {MouseEvent, ReactNode} from 'react'
import type {MCardTileProps, MCardTileRibbon} from './MCardTile.types'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {MEllipsisVerticalIcon, MHeartFillIcon, MHeartIcon} from '../../../icons'
import {MButton} from '../../controls'
import {MDropdownItem, MDropdownMenu} from '../../overlays'
import {resolveMCardAction} from '../shared'
import './MCardTile.css'
import '../shared/MCardShared.css'
import {useMCardTexts, useMCommonTexts} from '../../../i18n/frameworkTexts'

function isRibbonDescriptor(ribbon: unknown): ribbon is MCardTileRibbon {
    return ribbon != null && typeof ribbon === 'object' && !isValidElement(ribbon) && 'label' in ribbon
}

// Tile card: whole surface acts as a link/button, media can fill the card with text overlay.
// Media can be an image URL, a video URL, an MIllustration element, or a live camera stream.
export function MCardTile({
    component,
    title,
    description,
    icon,
    color = 'primary',
    to,
    href,
    target,
    rel,
    onClick,
    interactive = false,
    clickEffect,
    rippleColor,
    image,
    video,
    illustration,
    camera,
    mediaFill = false,
    overlayPosition = 'bottom',
    favorite,
    onFavorite,
    menuItems,
    variant = 'default',
    ratio,
    badge,
    ribbon,
    className,
    ...rest
}: MCardTileProps) {
    const texts = useMCommonTexts()
    const cardTexts = useMCardTexts()
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (!camera) {
            return
        }

        const node = videoRef.current
        if (!node || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            return
        }

        let activeStream: MediaStream | null = null
        let cancelled = false
        const constraints: MediaStreamConstraints = camera === true ? {video: true} : camera

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop())
                    return
                }
                activeStream = stream
                node.srcObject = stream
                void node.play().catch(() => undefined)
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
            if (activeStream) {
                activeStream.getTracks().forEach((track) => track.stop())
            }
            node.srcObject = null
        }
    }, [camera])

    const hasMedia = Boolean(image || video || illustration || camera)
    const {
        component: OverlayComponent,
        href: resolvedHref,
        to: resolvedTo,
        isInteractive,
        isLink,
    } = resolveMCardAction({
        component,
        href,
        to,
        interactive,
        hasClickHandler: Boolean(onClick),
        fallbackComponent: 'button',
    })
    const fillMedia = mediaFill && hasMedia
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect ?? (isInteractive ? 'ripple' : 'none'),
        disabled: !isInteractive,
        color: rippleColor,
    })

    function stopBubble(event: MouseEvent) {
        event.stopPropagation()
    }

    function handleOverlayClick(event: MouseEvent<HTMLElement>) {
        if (onClick) {
            event.preventDefault()
            onClick()
        }
    }

    function renderMedia() {
        if (!hasMedia) {
            return null
        }

        return (
            <div
                className={cn('tile-media', fillMedia && 'fill')}
                style={ratio ? {aspectRatio: ratio.replace(':', ' / ')} : undefined}
            >
                {image && <img src={image} alt={title} className="tile-image" />}
                {video && (
                    <video src={video} className="tile-video" autoPlay muted loop playsInline aria-label={title} />
                )}
                {camera && (
                    <video ref={videoRef} className="tile-video" autoPlay muted playsInline aria-label={title} />
                )}
                {illustration && <div className="tile-illustration">{illustration}</div>}
                {fillMedia && <div className={cn('tile-scrim', `scrim-${overlayPosition}`)} />}
                {renderDecorations()}
            </div>
        )
    }

    // Ribbon + badge live inside the media frame (clipped by its radius), or on the card itself without media.
    function renderDecorations(): ReactNode {
        if (ribbon == null && badge == null) {
            return null
        }

        const ribbonDescriptor = isRibbonDescriptor(ribbon) ? ribbon : null
        const ribbonLabel = ribbonDescriptor ? ribbonDescriptor.label : ribbon
        const badgeIsText = typeof badge === 'string' || typeof badge === 'number'

        return (
            <>
                {ribbonLabel != null && ribbonLabel !== false && (
                    <span className={cn('tile-ribbon', ribbonDescriptor?.color && `color-${ribbonDescriptor.color}`)}>
                        {ribbonLabel as ReactNode}
                    </span>
                )}
                {badge != null && badge !== false && (
                    <span className={cn('tile-badge', badgeIsText && 'text')}>{badge}</span>
                )}
            </>
        )
    }

    function renderBody() {
        return (
            <div className={cn('tile-body', fillMedia && 'overlay', fillMedia && `pos-${overlayPosition}`)}>
                <div className="tile-top">
                    {icon && <span className="tile-icon">{icon}</span>}
                    <h3 className="tile-title">{title}</h3>
                </div>
                {description && <p className="tile-desc">{description}</p>}
            </div>
        )
    }

    const hasActions = onFavorite || (menuItems && menuItems.length > 0)

    return (
        <div
            className={cn(
                'card-tile',
                `color-${color}`,
                variant === 'media' && 'variant-media',
                fillMedia && 'media-fill',
                isInteractive && 'interactive',
                effectClassName,
                className
            )}
            onPointerDown={handlePointerDown}
            {...rest}
        >
            {effectLayer}
            {isLink && (
                <OverlayComponent
                    href={OverlayComponent === 'a' || component ? resolvedHref : undefined}
                    to={resolvedTo}
                    target={target}
                    rel={rel}
                    className="tile-link"
                    aria-label={title}
                    onClick={onClick ? handleOverlayClick : undefined}
                />
            )}
            {!isLink && onClick && (
                <OverlayComponent type="button" className="tile-link" aria-label={title} onClick={onClick} />
            )}

            {renderMedia()}
            {!hasMedia && renderDecorations()}
            {renderBody()}

            {hasActions && (
                <div className="tile-actions" onClick={stopBubble} onPointerDown={stopBubble}>
                    {menuItems && menuItems.length > 0 && (
                        <MDropdownMenu
                            className="tile-menu-wrap"
                            trigger={
                                <MButton
                                    variant="ghost"
                                    iconOnly
                                    shape="circle"
                                    aria-label={texts.moreOptions}
                                    className="tile-overlay-btn"
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
                            aria-label={favorite ? cardTexts.removeFromFavorites : cardTexts.addToFavorites}
                            className={cn('tile-overlay-btn', favorite && 'tile-fav-active')}
                        >
                            {favorite ? <MHeartFillIcon /> : <MHeartIcon />}
                        </MButton>
                    )}
                </div>
            )}
        </div>
    )
}
