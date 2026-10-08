import type {PointerEvent} from 'react'
import type {MCardPaymentProps} from './MCardPayment.types'
import {cn} from '../../../utils/cn'
import {creditCardBrands, detectCardBrand} from '../../../utils/creditCards'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {resolveMCardAction} from '../shared'
import './MCardPayment.css'
import '../shared/MCardShared.css'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

function maskNumber(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (digits.length <= 4) return digits
    const last4 = digits.slice(-4)
    return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${last4}`
}

// Display-only payment card with balance, masked number, holder name and brand badge.
export function MCardPayment({
    component,
    to,
    href,
    target,
    rel,
    holder,
    number,
    expiry,
    brand,
    brandIcon,
    balance,
    balanceLabel,
    holderLabel,
    expiryLabel,
    color,
    interactive = false,
    clickEffect,
    rippleColor,
    className,
    onPointerDown,
    ...rest
}: MCardPaymentProps) {
    const texts = useMCardTexts().cardPayment
    const detectedDetails = detectCardBrand(number)
    const detected = brand ?? detectedDetails.brand
    const brandDetails = creditCardBrands.find((rule) => rule.brand === detected) ?? detectedDetails
    const masked = maskNumber(number)
    const brandLabel = brandDetails.iconLabel
    const {
        component: Component,
        href: resolvedHref,
        to: resolvedTo,
        isInteractive,
    } = resolveMCardAction({
        component,
        href,
        to,
        interactive,
        hasClickHandler: Boolean(rest.onClick),
        hasPointerHandler: Boolean(onPointerDown),
    })
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect ?? (isInteractive ? 'ripple' : 'none'),
        disabled: !isInteractive,
        color: rippleColor,
    })

    return (
        <Component
            href={Component === 'a' || component ? resolvedHref : undefined}
            to={resolvedTo}
            target={target}
            rel={rel}
            className={cn(
                'card-payment',
                color || 'primary',
                isInteractive && 'interactive',
                effectClassName,
                className
            )}
            onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
                handlePointerDown(event)
                onPointerDown?.(event)
            }}
            {...rest}
        >
            {effectLayer}
            {balance !== undefined && (
                <div>
                    <p className="cp-balance-label">{balanceLabel ?? texts.currentBalance}</p>
                    <p className="cp-balance">{balance}</p>
                </div>
            )}

            <div className="cp-row">
                <span className={cn('cp-brand', !brandIcon && detected)}>{brandIcon ?? brandLabel}</span>
                <span className="cp-number">{masked}</span>
            </div>

            <div className="cp-details">
                <div>
                    <p className="cp-field-label">{holderLabel ?? texts.cardHolder}</p>
                    <p className="cp-field-value">{holder}</p>
                </div>
                <div>
                    <p className="cp-field-label">{expiryLabel ?? texts.expirationDate}</p>
                    <p className="cp-field-value">{expiry}</p>
                </div>
            </div>
        </Component>
    )
}
