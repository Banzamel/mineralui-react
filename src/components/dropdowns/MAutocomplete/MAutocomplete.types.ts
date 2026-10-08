import type {ReactNode, CSSProperties} from 'react'
import type {MColor, MSize} from '../../../theme'

export type MAutocompleteVariant = 'outlined' | 'filled' | 'underlined'

export interface MAutocompleteProps<T = string> {
    options: T[]
    /** `null` (single) or `[]` (multiple) means "nothing selected". */
    value?: T | T[] | null
    /**
     * Called with the new selection. Clearing emits `null` in single mode and `[]` in
     * multiple mode. Declared as a method so existing `(value: T | T[]) => void`
     * handlers stay assignable.
     */
    onChange?(value: T | T[] | null): void
    getOptionLabel?: (option: T) => string
    getOptionValue?: (option: T) => string
    filterOptions?: (options: T[], inputValue: string) => T[]
    multiple?: boolean
    debounceMs?: number
    onInputChange?: (value: string) => void
    loading?: boolean
    loadingText?: string
    noOptionsText?: string
    placeholder?: string
    disabled?: boolean
    name?: string
    id?: string
    variant?: MAutocompleteVariant
    size?: MSize
    color?: MColor
    fullWidth?: boolean
    label?: string
    helperText?: string
    errorText?: string
    error?: boolean
    required?: boolean
    clearable?: boolean
    maxHeight?: number
    renderOption?: (option: T, isActive: boolean) => ReactNode
    renderTags?: (selected: T[], onRemove: (index: number) => void) => ReactNode
    className?: string
    style?: CSSProperties
}
