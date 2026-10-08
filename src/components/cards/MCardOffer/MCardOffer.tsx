import type {MCardOfferProps} from './MCardOffer.types'
import {SharedServiceCard} from '../ServiceCardsShared/ServiceCardsShared'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

export function MCardOffer(props: MCardOfferProps) {
    const texts = useMCardTexts().serviceCard
    const {onAction, actionLabel, ...rest} = props

    return (
        <SharedServiceCard
            variant="service"
            onAddToCart={onAction ? () => onAction() : undefined}
            actionLabel={actionLabel ?? texts.bookNow}
            {...rest}
        />
    )
}
