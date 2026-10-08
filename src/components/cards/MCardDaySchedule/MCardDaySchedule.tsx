import type {MCardDayScheduleProps} from './MCardDaySchedule.types'
import {MCard, MCardBody, MCardFooter, MCardHeader} from '../MCard'
import {MDetailList} from '../../display'
import {MGrid, MInline, MStack, MTabs} from '../../layout'
import {MHeading, MText} from '../../typography'
import {tintCardChildren} from '../shared'
import './MCardDaySchedule.css'
import {useMCardTexts} from '../../../i18n/frameworkTexts'

export function MCardDaySchedule({
    title: titleProp,
    description,
    color = 'primary',
    workdayStart,
    workdayEnd,
    timeline,
    summary,
    tabs = [],
    footer,
    emptyTimeline: emptyTimelineProp,
    ...rest
}: MCardDayScheduleProps) {
    const texts = useMCardTexts().daySchedule
    const title = titleProp === undefined ? texts.title : titleProp
    const emptyTimeline =
        emptyTimelineProp === undefined ? <MText tone={'muted'}>{texts.emptyTimeline}</MText> : emptyTimelineProp
    const workdayLabel =
        workdayStart && workdayEnd ? `${workdayStart}-${workdayEnd}` : (workdayStart ?? workdayEnd ?? undefined)

    const populatedTabs = tabs.filter((tab) => tab.items.length > 0)

    return (
        <MCard color={color} {...rest}>
            <MCardHeader>
                <MStack>
                    <MHeading level={4}>{title}</MHeading>
                    {(description || workdayLabel) && (
                        <MText size={'sm'} tone={'muted'}>
                            {description}
                            {description && workdayLabel ? ' ' : null}
                            {workdayLabel}
                        </MText>
                    )}
                </MStack>
            </MCardHeader>
            <MCardBody>
                <MGrid type={'row'} align={'start'}>
                    <MGrid type={'col'} xl={7} sm={12}>
                        {timeline.length ? (
                            <MStack className="day-schedule-card-timeline">
                                {timeline.map((item) => (
                                    <MInline key={item.id} align={'start'} className="day-schedule-card-entry">
                                        <span className="day-schedule-card-time">{item.time}</span>
                                        <div className="day-schedule-card-dot" data-color={item.color ?? color}>
                                            {tintCardChildren(item.icon, item.color ?? color)}
                                        </div>
                                        <div className="day-schedule-card-copy">
                                            <MText as={'strong'}>{item.title}</MText>
                                            {item.description && (
                                                <MText size={'sm'} tone={'muted'}>
                                                    {item.description}
                                                </MText>
                                            )}
                                        </div>
                                    </MInline>
                                ))}
                            </MStack>
                        ) : (
                            emptyTimeline
                        )}
                    </MGrid>

                    <MGrid type={'col'} xl={5} sm={12}>
                        <MStack className="day-schedule-card-side">
                            {summary}

                            {populatedTabs.length > 0 && (
                                <MTabs
                                    variant={'underline'}
                                    size={'sm'}
                                    fullWidth
                                    defaultValue={populatedTabs[0].type}
                                    items={populatedTabs.map((tab) => ({
                                        value: tab.type,
                                        label: (
                                            <span className="day-schedule-card-tab-label">
                                                <span>{tab.title}</span>
                                                <span className="day-schedule-card-tab-count">{tab.items.length}</span>
                                            </span>
                                        ),
                                        content: <MDetailList items={tab.items} />,
                                    }))}
                                />
                            )}
                        </MStack>
                    </MGrid>
                </MGrid>
            </MCardBody>
            {footer && <MCardFooter>{tintCardChildren(footer, color)}</MCardFooter>}
        </MCard>
    )
}
