import type {CSSProperties} from 'react'
import type {MSpinnerProps} from './MSpinner.types'
import {cn} from '../../../utils/cn'
import './MSpinner.css'
import {useMSpinnerTexts} from '../../../i18n/frameworkTexts'

// Render a minimal semantic loading indicator with token-aware sizing and color.
export function MSpinner({color = 'primary', size = 'md', label: labelProp, className, style, ...rest}: MSpinnerProps) {
    const texts = useMSpinnerTexts()
    const label = labelProp ?? texts.label
    const inlineStyle: CSSProperties =
        typeof size === 'number'
            ? {
                  width: `${size}px`,
                  height: `${size}px`,
                  ...style,
              }
            : style || {}

    return (
        <span
            className={cn('spinner', typeof size === 'string' && size, color && `color-${color}`, className)}
            style={inlineStyle}
            role="status"
            aria-label={label}
            {...rest}
        />
    )
}
