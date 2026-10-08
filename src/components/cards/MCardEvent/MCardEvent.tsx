import type {MCardEventProps} from './MCardEvent.types'
import {SharedServiceCard} from '../ServiceCardsShared/ServiceCardsShared'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

export function MCardEvent(props: MCardEventProps) {
    const texts = useMCardTexts().serviceCard
    const {onRegister, registerLabel, ...rest} = props

    return (
        <SharedServiceCard
            variant="event"
            onAddToCart={onRegister ? () => onRegister() : undefined}
            actionLabel={registerLabel ?? texts.register}
            {...rest}
        />
    )
}
