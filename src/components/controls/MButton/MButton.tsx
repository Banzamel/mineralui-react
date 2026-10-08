import {forwardRef} from 'react'
import type {KeyboardEvent, MouseEvent, PointerEvent} from 'react'
import type {MButtonProps} from './MButton.types'
import {getHiddenProps} from '../../../theme'
import {useButtonGroup} from '../MButtonGroup/MButtonGroupContext'
import {MSpinner} from '../../feedback'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {renderOverlayBadge} from '../../../utils/overlayBadge'
import './MButton.css'

// Render the main action primitive with semantic variants and built-in click feedback.
export const MButton = forwardRef<HTMLElement, MButtonProps>(function MButton(
    {
        component,
        to,
        href,
        target,
        rel,
        variant: variantProp,
        size: sizeProp,
        color: colorProp,
        hidden,
        fullWidth = false,
        rounded = false,
        shape,
        iconOnly = false,
        loading = false,
        active = false,
        pulsing = false,
        badge,
        badgeColor,
        badgePulsing = false,
        startIcon,
        endIcon,
        clickEffect = 'ripple',
        rippleColor,
        className,
        style,
        children,
        disabled = false,
        type = 'button',
        onClick,
        onClickCapture,
        onPointerDown,
        onKeyDown,
        ...rest
    },
    ref
) {
    const Component = component ?? 'button'
    const isNativeButton = !component || Component === 'button'
    const group = useButtonGroup()
    const variant = variantProp ?? group?.variant ?? 'filled'
    const size = sizeProp ?? group?.size ?? 'md'
    const color = colorProp ?? group?.color ?? 'primary'

    const isDisabled = disabled || loading
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLElement>({
        effect: clickEffect,
        disabled: isDisabled,
        centered: iconOnly,
        color: rippleColor,
    })

    function handleClick(event: MouseEvent<HTMLElement>) {
        if (isDisabled && !isNativeButton) {
            event.preventDefault()
            return
        }

        onClick?.(event as never)
    }

    return (
        <Component
            ref={ref}
            type={isNativeButton ? type : undefined}
            // A disabled link keeps its href so it stays in the accessibility tree and is
            // announced as disabled (aria-disabled); activation is blocked in the capture phase.
            to={component ? to : undefined}
            href={component ? href : undefined}
            target={component ? target : undefined}
            rel={component ? rel : undefined}
            className={cn(
                'button',
                variant,
                size,
                `color-${color}`,
                fullWidth && 'full-width',
                rounded && 'rounded',
                shape === 'circle' && 'circle',
                iconOnly && 'icon-only',
                loading && 'loading',
                active && 'active',
                pulsing && 'pulsing',
                isDisabled && 'disabled',
                effectClassName,
                className
            )}
            style={style}
            disabled={isNativeButton ? isDisabled : undefined}
            aria-busy={loading || undefined}
            aria-disabled={!isNativeButton && isDisabled ? true : undefined}
            onClick={handleClick}
            onClickCapture={(event: MouseEvent<HTMLElement>) => {
                if (isDisabled && !isNativeButton) {
                    event.preventDefault()
                    event.stopPropagation()
                    return
                }

                onClickCapture?.(event as never)
            }}
            onPointerDown={(event: PointerEvent<HTMLElement>) => {
                handlePointerDown(event as never)
                onPointerDown?.(event as never)
            }}
            onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    triggerEffect(event.currentTarget as HTMLElement)
                }

                onKeyDown?.(event as never)
            }}
            {...getHiddenProps(hidden)}
            {...rest}
        >
            {effectLayer}
            {renderOverlayBadge({badge, badgeColor, badgePulsing})}
            {loading && <MSpinner size="sm" color="inherit" aria-hidden="true" />}
            {startIcon && <span className="icon start">{startIcon}</span>}
            {children && <span className="content">{children}</span>}
            {endIcon && <span className="icon end">{endIcon}</span>}
        </Component>
    )
})
