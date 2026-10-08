import type {ChangeEvent, CSSProperties, FocusEvent, InputHTMLAttributes, KeyboardEvent, ReactNode} from 'react'
import type {MColor, MSize} from '../../../theme'
import type {MClickEffect} from '../../../utils/useInteractionEffect'

export type MInputVariant = 'outlined' | 'filled' | 'underlined'

export interface MInputProps {
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time'
    value?: string | number
    defaultValue?: string | number
    name?: string
    id?: string
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    autoFocus?: boolean
    autoComplete?: string
    inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
    variant?: MInputVariant
    size?: MSize
    color?: MColor
    fullWidth?: boolean
    rounded?: boolean
    label?: string
    helperText?: string
    errorText?: string
    startIcon?: ReactNode
    endIcon?: ReactNode
    clearable?: boolean
    error?: boolean
    success?: boolean
    maxLength?: number
    showCharCount?: boolean
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
    onClear?: () => void
    ghostOptions?: string[]
    ghostMinChars?: number
    onGhostAccept?: (value: string) => void
    loading?: boolean
    clickEffect?: MClickEffect
    rippleColor?: string
    className?: string
    style?: CSSProperties
    inputClassName?: string
    labelClassName?: string
    /**
     * Extra attributes for the native `<input>` (ARIA such as `role="combobox"`,
     * `aria-activedescendant`, `aria-label`, `data-*`). The component's own props win on conflict.
     */
    inputProps?: InputHTMLAttributes<HTMLInputElement> & Record<`data-${string}`, string | undefined>
}
