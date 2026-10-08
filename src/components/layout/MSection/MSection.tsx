import type React from 'react'
import type {MSectionProps} from './MSection.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import './MSection.css'

// Render a semantic page section with predefined spacing and tone.
export function MSection({
    as = 'section',
    spacing = 'lg',
    tone = 'default',
    hidden,
    hiddenAbove,
    className,
    style,
    children,
    ...rest
}: MSectionProps) {
    const Component = as

    return (
        <Component
            className={cn('section', spacing, tone, className)}
            style={style}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {children}
        </Component>
    )
}
