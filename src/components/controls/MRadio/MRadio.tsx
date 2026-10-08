import {forwardRef, useCallback} from 'react'
import type * as React from 'react'
import type {MRadioProps} from './MRadio.types'
import {useRadioGroup} from './RadioContext'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import './MRadio.css'

// Render a single radio that can work standalone or inside MRadioGroup.
export const MRadio = forwardRef<HTMLInputElement, MRadioProps>(function MRadio(
    {
        checked,
        defaultChecked,
        name,
        id,
        value,
        disabled = false,
        size,
        color,
        label,
        labelPosition = 'right',
        onChange,
        clickEffect = 'ripple',
        rippleColor,
        className,
        style,
    },
    ref
) {
    const group = useRadioGroup()

    const resolvedName = group?.name ?? name
    // The radio's own props win over the group; the group only fills in what the radio leaves out.
    const resolvedDisabled = disabled || Boolean(group?.disabled)
    const resolvedSize = size ?? group?.size ?? 'md'
    const resolvedColor = color ?? group?.color ?? 'primary'
    const resolvedChecked = group ? group.value === value : checked
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLSpanElement>({
        effect: clickEffect,
        disabled: resolvedDisabled,
        centered: true,
        color: rippleColor,
    })

    // Delegate selection back to the group when one is present.
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(event)
            if (group?.onChange && value) {
                group.onChange(value)
            }
        },
        [onChange, group, value]
    )

    return (
        <label
            className={cn(
                'radio',
                resolvedSize,
                labelPosition === 'left' && 'label-left',
                resolvedDisabled && 'disabled',
                className
            )}
            style={style}
        >
            <span className={cn('circle', `color-${resolvedColor}`, effectClassName)} onPointerDown={handlePointerDown}>
                {effectLayer}
                <input
                    ref={ref}
                    type="radio"
                    name={resolvedName}
                    id={id}
                    value={value}
                    checked={resolvedChecked}
                    defaultChecked={!group ? defaultChecked : undefined}
                    disabled={resolvedDisabled}
                    onChange={handleChange}
                    onKeyDown={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') {
                            triggerEffect(event.currentTarget.parentElement as HTMLSpanElement | null)
                        }
                    }}
                    className="input"
                />
            </span>
            {label && <span className="label-text">{label}</span>}
        </label>
    )
})
