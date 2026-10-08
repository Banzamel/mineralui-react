import type {CSSProperties} from 'react'
import type {MAvatarPresence, MAvatarProps} from './MAvatar.types'
import type {MColor} from '../../../theme'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {renderOverlayBadge} from '../../../utils/overlayBadge'
import './MAvatar.css'
import {formatMText, useMCommonTexts, useMMediaTexts} from '../../../i18n/frameworkTexts'

function getFallbackInitials(name?: string, initials?: string) {
    if (initials) return initials.slice(0, 2).toUpperCase()
    if (!name) return '?'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const PRESENCE_BADGE_COLOR: Record<MAvatarPresence, MColor> = {
    online: 'success',
    offline: 'neutral',
    away: 'warning',
    busy: 'error',
}

// Render user or entity identity as an image with initials fallback.
export function MAvatar({
    src,
    alt,
    name,
    initials,
    size = 'md',
    shape = 'circle',
    hidden,
    hiddenAbove,
    color,
    badge,
    badgeColor,
    badgePulsing,
    presence,
    backgroundColor,
    clickEffect,
    rippleColor,
    skeleton = false,
    className,
    style,
    onPointerDown,
    href,
    target,
    rel,
    ...rest
}: MAvatarProps) {
    const commonTexts = useMCommonTexts()
    const mediaTexts = useMMediaTexts()
    const fallbackInitials = getFallbackInitials(name, initials)
    // A clickable avatar is a real control: a link with `href`, otherwise a native button. A hand-made
    // `role` / `tabIndex` keeps the legacy span so callers' own key handling is not doubled.
    const manualControl = rest.role !== undefined || rest.tabIndex !== undefined
    const element: 'a' | 'button' | 'span' =
        href !== undefined && !skeleton
            ? 'a'
            : typeof rest.onClick === 'function' && !manualControl && !skeleton
              ? 'button'
              : 'span'
    const isInteractive =
        element !== 'span' ||
        typeof rest.onClick === 'function' ||
        rest.role === 'button' ||
        rest.tabIndex !== undefined
    const resolvedBadge = badge !== undefined ? badge : presence !== undefined ? true : undefined
    const resolvedBadgeColor = badgeColor ?? (presence !== undefined ? PRESENCE_BADGE_COLOR[presence] : undefined)
    const resolvedBadgePulsing = badgePulsing ?? (presence !== undefined ? true : false)
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLElement>({
        effect: clickEffect ?? (isInteractive ? 'ripple' : 'none'),
        disabled: !isInteractive || skeleton,
        color: rippleColor,
    })
    const baseLabel = alt ?? name ?? mediaTexts.avatar
    // Presence must not rely on the dot colour alone (WCAG 1.4.1), so it joins the accessible name.
    const accessibleLabel = skeleton
        ? commonTexts.loading
        : presence !== undefined
          ? formatMText(mediaTexts.avatarPresence, {name: baseLabel, presence: mediaTexts.presence[presence]})
          : baseLabel
    const inlineStyle: CSSProperties =
        typeof size === 'number'
            ? {
                  width: `${size}px`,
                  height: `${size}px`,
                  ...style,
                  ...(backgroundColor && !skeleton ? {backgroundColor} : {}),
              }
            : {
                  ...style,
                  ...(backgroundColor && !skeleton ? {backgroundColor} : {}),
              }

    const Component = element as 'span'
    const elementProps =
        element === 'a'
            ? {href, target, rel: rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
            : element === 'button'
              ? {type: 'button' as const}
              : {}

    return (
        <Component
            {...elementProps}
            className={cn(
                'avatar',
                typeof size === 'string' && size,
                shape,
                skeleton && 'skeleton animate',
                isInteractive && !skeleton && 'interactive',
                effectClassName,
                !skeleton && color && `color-${color}`,
                className
            )}
            style={inlineStyle}
            role={isInteractive ? undefined : 'img'}
            aria-label={accessibleLabel}
            onPointerDown={(event) => {
                handlePointerDown(event)
                onPointerDown?.(event)
            }}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {effectLayer}
            {renderOverlayBadge({
                badge: resolvedBadge,
                badgeColor: resolvedBadgeColor,
                badgePulsing: resolvedBadgePulsing,
            })}
            {skeleton ? null : src ? (
                <img src={src} alt={alt ?? name ?? ''} className={'image'} />
            ) : (
                <span className={'fallback'}>{fallbackInitials}</span>
            )}
        </Component>
    )
}
