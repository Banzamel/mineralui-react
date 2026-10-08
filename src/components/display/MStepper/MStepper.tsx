import {Children, isValidElement, useId} from 'react'
import type {MStepperProps, MStepProps} from './MStepper.types'
import type {MSize} from '../../../theme'
import {cn} from '../../../utils/cn'
import {MCheckIcon} from '../../../icons'
import './MStepper.css'
import {useMStepperTexts} from '../../../i18n/frameworkTexts'

const CHECK_SIZE: Record<MSize, number> = {xs: 10, sm: 14, md: 18, lg: 22, xl: 28}

export function MStep(_props: MStepProps) {
    return null
}

export function MStepper({
    activeStep,
    variant = 'horizontal',
    color = 'primary',
    size = 'md',
    clickable = false,
    onChange,
    className,
    children,
    ...rest
}: MStepperProps) {
    const texts = useMStepperTexts()
    const baseId = useId()
    const steps = Children.toArray(children).filter((child) => isValidElement(child) && (child.type as any) === MStep)

    return (
        <div className={cn('stepper', variant, `color-${color}`, size, className)} role="list" {...rest}>
            {steps.map((child, index) => {
                if (!isValidElement<MStepProps>(child)) return null
                const {id, title, description, icon, disabled, optional, error} = child.props
                const isActive = index === activeStep
                const isCompleted = index < activeStep
                const isClickable = clickable && !disabled

                const handleClick = () => {
                    if (isClickable && onChange) {
                        onChange(index)
                    }
                }

                // State is spoken as text, not only shown as a ✓ / ! glyph.
                const stateText = error ? texts.error : isCompleted ? texts.completed : null
                const titleId = `${baseId}-${index}-title`
                const stateId = `${baseId}-${index}-state`
                const indicatorContent = error
                    ? '!'
                    : isCompleted
                      ? (icon ?? <MCheckIcon size={CHECK_SIZE[size]} />)
                      : (icon ?? index + 1)

                return (
                    <div
                        key={id}
                        className={cn(
                            'stepper-step',
                            isActive && 'active',
                            isCompleted && 'completed',
                            disabled && 'disabled',
                            error && 'error',
                            isClickable && 'clickable'
                        )}
                        role="listitem"
                        aria-current={isActive ? 'step' : undefined}
                    >
                        {isClickable ? (
                            <button
                                type="button"
                                className="stepper-indicator"
                                onClick={handleClick}
                                aria-labelledby={stateText ? `${titleId} ${stateId}` : titleId}
                                aria-current={isActive ? 'step' : undefined}
                            >
                                <span className="stepper-indicator-content" aria-hidden="true">
                                    {indicatorContent}
                                </span>
                            </button>
                        ) : (
                            <div className="stepper-indicator" aria-hidden={error || isCompleted ? true : undefined}>
                                {indicatorContent}
                            </div>
                        )}
                        <div className="stepper-content">
                            <span id={titleId} className="stepper-title">
                                {title}
                            </span>
                            {stateText && (
                                <span id={stateId} className="stepper-state">
                                    {stateText}
                                </span>
                            )}
                            {description && <span className="stepper-description">{description}</span>}
                            {optional && <span className="stepper-optional">{texts.optional}</span>}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
