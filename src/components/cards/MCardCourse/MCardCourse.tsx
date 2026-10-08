import type {MCardCourseProps} from './MCardCourse.types'
import {SharedServiceCard} from '../ServiceCardsShared/ServiceCardsShared'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

export function MCardCourse(props: MCardCourseProps) {
    const texts = useMCardTexts().serviceCard
    const {onAction, actionLabel, ...rest} = props

    return (
        <SharedServiceCard
            variant="course"
            onAddToCart={onAction ? () => onAction() : undefined}
            actionLabel={actionLabel ?? texts.joinCourse}
            {...rest}
        />
    )
}
