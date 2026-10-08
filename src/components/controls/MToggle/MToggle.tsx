import {forwardRef} from 'react'
import type {MToggleProps} from './MToggle.types'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import './MToggle.css'

// Render a switch-style boolean control with the same API shape as MCheckbox.
export const MToggle = forwardRef<HTMLInputElement, MToggleProps>(function MToggle(
    {
        checked,
        defaultChecked,
        name,
        id,
        disabled = false,
        size = 'md',
        color = 'primary',
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
    const {effectClassName, effectLayer, handlePointerDown, triggerEffect} = useInteractionEffect<HTMLSpanElement>({
        effect: clickEffect,
        disabled,
        centered: true,
        color: rippleColor,
    })

    return (
        <label
            className={cn('toggle', size, labelPosition === 'left' && 'label-left', disabled && 'disabled', className)}
            style={style}
        >
            <span className={cn('track', `color-${color}`, effectClassName)} onPointerDown={handlePointerDown}>
                {effectLayer}
                <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    defaultChecked={defaultChecked}
                    name={name}
                    id={id}
                    disabled={disabled}
                    onChange={onChange}
                    onKeyDown={(event) => {
                        if (event.key === ' ' || event.key === 'Enter') {
                            triggerEffect(event.currentTarget.parentElement as HTMLSpanElement | null)
                        }
                    }}
                    className="input"
                    // The native checked state is exposed as the switch state; aria-checked on a
                    // checkbox input is not allowed and was undefined when uncontrolled.
                    role="switch"
                />
                <span className="knob" />
            </span>
            {label && <span className="label-text">{label}</span>}
        </label>
    )
})
