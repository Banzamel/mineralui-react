import type {MCardPaymentMethodProps} from './MCardPaymentMethod.types'
import {cn} from '../../../utils/cn'
import {creditCardBrands} from '../../../utils/creditCards'
import {MArrowRightIcon} from '../../../icons'
import {MBadge} from '../../feedback'
import {MInline} from '../../layout'
import {MLink, MText} from '../../typography'
import {MInputExpDate} from '../../inputs/MInputExpDate'
import {MInputCVC} from '../../inputs/MInputCVC'
import './MCardPaymentMethod.css'
import {formatMText, useMCardTexts} from '../../../i18n/frameworkTexts'

function resolveBrandLabel(brand: NonNullable<MCardPaymentMethodProps['brand']>) {
    return creditCardBrands.find((item) => item.brand === brand)?.iconLabel ?? 'CARD'
}

export function MCardPaymentMethod({
    title: titleProp,
    actionLabel: actionLabelProp,
    actionHref = '#',
    onAction,
    brand = 'visa',
    brandIcon,
    last4,
    badgeLabel,
    summary,
    helperText: helperTextProp,
    expiryLabel: expiryLabelProp,
    cvcLabel: cvcLabelProp,
    expiryProps,
    cvcProps,
    color,
    className,
    ...rest
}: MCardPaymentMethodProps) {
    const texts = useMCardTexts().cardPaymentMethod
    const title = titleProp === undefined ? texts.title : titleProp
    const actionLabel = actionLabelProp === undefined ? texts.change : actionLabelProp
    const helperText = helperTextProp === undefined ? texts.helperText : helperTextProp
    const expiryLabel = expiryLabelProp === undefined ? texts.expirationDate : expiryLabelProp
    const cvcLabel = cvcLabelProp === undefined ? texts.securityCode : cvcLabelProp
    const expirySummary = expiryProps?.value ?? expiryProps?.defaultValue
    const resolvedBadgeLabel = badgeLabel === undefined ? texts.defaultBadge : badgeLabel
    const derivedSummary = expirySummary
        ? formatMText(texts.creditCardExpires, {date: String(expirySummary).replace('/', '.')})
        : texts.creditCard
    const resolvedSummary = summary === undefined ? derivedSummary : summary
    const brandLabel = resolveBrandLabel(brand)
    const resolvedExpiryProps = {
        clearable: true,
        ...expiryProps,
    }

    return (
        <div className={cn('card-payment-method', color || 'primary', className)} {...rest}>
            <div className={'cpm-header'}>
                <h3 className={'cpm-title'}>{title}</h3>
                <MLink
                    href={actionHref}
                    tone={'accent'}
                    underline={'none'}
                    className={'cpm-action'}
                    onClick={(event) => {
                        if (onAction) {
                            event.preventDefault()
                            onAction()
                        }
                    }}
                >
                    {actionLabel}
                    <MArrowRightIcon />
                </MLink>
            </div>

            <div className={'cpm-surface'}>
                <div className={'cpm-method'}>
                    <MInline align={'center'} className={'cpm-method-row'}>
                        <span className={cn('cpm-brand', !brandIcon && brand)}>{brandIcon ?? brandLabel}</span>
                        <span className={'cpm-last4'}>{`\u2022\u2022\u2022\u2022 ${last4}`}</span>
                        {resolvedBadgeLabel && <MBadge color={'info'}>{resolvedBadgeLabel}</MBadge>}
                    </MInline>
                    {resolvedSummary && (
                        <MText tone={'muted'} className={'cpm-summary'}>
                            {resolvedSummary}
                        </MText>
                    )}
                </div>

                {helperText && (
                    <MText tone={'muted'} size={'sm'} className={'cpm-helper'}>
                        {helperText}
                    </MText>
                )}

                <div className={'cpm-fields'}>
                    <MInputExpDate label={expiryLabel} placeholder={'MM/YYYY'} fullWidth {...resolvedExpiryProps} />
                    <MInputCVC label={cvcLabel} placeholder={'123'} fullWidth {...cvcProps} />
                </div>
            </div>
        </div>
    )
}
