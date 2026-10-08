import type {CSSProperties, ChangeEvent, ReactNode} from 'react'
import type {MColor, MSize} from '../../../theme'
import type {MClickEffect} from '../../../utils/useInteractionEffect'

export interface MCheckboxProps {
    checked?: boolean
    defaultChecked?: boolean
    indeterminate?: boolean
    name?: string
    id?: string
    value?: string
    disabled?: boolean
    size?: MSize
    color?: MColor
    label?: ReactNode
    labelPosition?: 'right' | 'left'
    error?: boolean
    errorText?: string
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    /** Called with `false` when a click clears the indeterminate state, so a controlled parent can sync it. */
    onIndeterminateChange?: (indeterminate: boolean) => void
    clickEffect?: MClickEffect
    rippleColor?: string
    /** Accessible name for the native input, for checkboxes without a visible `label`. */
    'aria-label'?: string
    /** Id of the element that names the native input. */
    'aria-labelledby'?: string
    className?: string
    style?: CSSProperties
}
