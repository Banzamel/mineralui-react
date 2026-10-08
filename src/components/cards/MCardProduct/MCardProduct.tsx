import type {MCardProductProps} from './MCardProduct.types'
import {SharedServiceCard} from '../ServiceCardsShared/ServiceCardsShared'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

export function MCardProduct(props: MCardProductProps) {
    const texts = useMCardTexts().serviceCard
    const {addToCartLabel, ...rest} = props

    return <SharedServiceCard variant="product" actionLabel={addToCartLabel ?? texts.addToCart} {...rest} />
}
