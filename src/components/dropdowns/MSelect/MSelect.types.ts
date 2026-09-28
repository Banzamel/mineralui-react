import type {ReactNode, CSSProperties} from 'react'
import type {MColor, MSize} from '../../../theme'

export type MSelectVariant = 'outlined' | 'filled' | 'underlined'

export interface MSelectOption {
    value: string
    label: string
    disabled?: boolean
    group?: string
}

export interface MSelectProps {
    options: MSelectOption[]
    value?: string | string[]
    defaultValue?: string | string[]
    onChange?: (value: string | string[]) => void
    multiple?: boolean
    searchable?: boolean
    placeholder?: string
    disabled?: boolean
    name?: string
    id?: string
    variant?: MSelectVariant
    size?: MSize
    color?: MColor
    fullWidth?: boolean
    label?: string
    helperText?: string
    errorText?: string
    error?: boolean
    required?: boolean
    loading?: boolean
    clearable?: boolean
    maxHeight?: number
    noOptionsText?: string
    /** Placeholder of the search field (`searchable`). Default 'Search...'. */
    searchPlaceholder?: string
    renderOption?: (option: MSelectOption, isActive: boolean, isSelected: boolean) => ReactNode
    renderValue?: (selected: MSelectOption | MSelectOption[]) => ReactNode
    className?: string
    style?: CSSProperties
}
