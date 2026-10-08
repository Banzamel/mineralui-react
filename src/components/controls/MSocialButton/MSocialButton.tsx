import {forwardRef} from 'react'
import type {MSocialButtonProps} from './MSocialButton.types'
import {getHiddenProps} from '../../../theme'
import {
    SocialAppleMark,
    SocialFacebookMark,
    SocialGoogleMark,
    SocialLinkedInMark,
    SocialMicrosoftMark,
    SocialPinterestMark,
} from './MSocialButton.icons'
import {MSpinner} from '../../feedback'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import './MSocialButton.css'
import {formatMText, useMSocialButtonTexts} from '../../../i18n/frameworkTexts'

const socialButtonConfig = {
    google: {
        label: 'Sign in with Google',
        iconLabel: 'Google',
        mode: 'google',
        Icon: SocialGoogleMark,
    },
    facebook: {
        label: 'Sign in with Facebook',
        iconLabel: 'Facebook',
        mode: 'outline',
        Icon: SocialFacebookMark,
    },
    apple: {
        label: 'Sign in with Apple',
        iconLabel: 'Apple',
        mode: 'brand',
        Icon: SocialAppleMark,
    },
    microsoft: {
        label: 'Sign in with Microsoft',
        iconLabel: 'Microsoft',
        mode: 'brand',
        Icon: SocialMicrosoftMark,
    },
    pinterest: {
        label: 'Sign in with Pinterest',
        iconLabel: 'Pinterest',
        mode: 'brand',
        Icon: SocialPinterestMark,
    },
    linkedin: {
        label: 'Sign in with LinkedIn',
        iconLabel: 'LinkedIn',
        mode: 'brand',
        Icon: SocialLinkedInMark,
    },
} as const

export const MSocialButton = forwardRef<HTMLButtonElement, MSocialButtonProps>(function MSocialButton(
    {
        platform = 'google',
        variant = 'outline',
        size = 'md',
        iconOnly = false,
        iconShape = 'circle',
        hidden,
        fullWidth = false,
        loading = false,
        active = false,
        pulsing = false,
        clickEffect = 'ripple',
        rippleColor,
        className,
        style,
        children,
        disabled = false,
        type = 'button',
        onPointerDown,
        onKeyDown,
        'aria-label': ariaLabel,
        ...rest
    },
    ref
) {
    const texts = useMSocialButtonTexts()
    const config = socialButtonConfig[platform]
    const Icon = config.Icon
    const signInLabel = formatMText(texts.signIn, {platform: config.iconLabel})
    const label = children ?? signInLabel
    // An icon-only button names the action ("Sign in with Google"), not just the brand (WCAG 2.4.6).
    const resolvedAriaLabel =
        ariaLabel ??
        (iconOnly ? (typeof children === 'string' && children.trim() !== '' ? children : signInLabel) : undefined)
    const resolvedVariant = config.mode === 'google' ? variant : config.mode
    const isDisabled = disabled || loading
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLButtonElement>({
        effect: clickEffect,
        disabled: isDisabled,
        centered: iconOnly,
        color: rippleColor,
    })

    return (
        <button
            ref={ref}
            type={type}
            className={cn(
                'social-button-root',
                platform,
                resolvedVariant,
                size,
                fullWidth && 'full-width',
                iconOnly && 'icon-only',
                iconOnly && `icon-shape-${iconShape}`,
                loading && 'loading',
                active && 'active',
                pulsing && 'pulsing',
                isDisabled && 'disabled',
                effectClassName,
                className
            )}
            style={style}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            aria-label={resolvedAriaLabel}
            onPointerDown={(event) => {
                handlePointerDown(event)
                onPointerDown?.(event)
            }}
            onKeyDown={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    triggerEffect(event.currentTarget)
                }

                onKeyDown?.(event)
            }}
            {...getHiddenProps(hidden)}
            {...rest}
        >
            {effectLayer}
            {loading && <MSpinner size="sm" color="inherit" className="social-button-spinner" aria-hidden="true" />}
            <span className="social-button-brand" aria-hidden="true">
                <Icon className="social-button-mark" />
            </span>
            {!iconOnly && <span className="social-button-label">{label}</span>}
        </button>
    )
})
