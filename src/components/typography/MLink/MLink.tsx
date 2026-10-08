import {forwardRef} from 'react'
import type {MouseEvent} from 'react'
import type {MLinkProps} from './MLink.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import './MLink.css'

// Render a semantic link that can target anchors or router link components.
export const MLink = forwardRef<HTMLElement, MLinkProps>(function MLink(
    {
        component,
        to,
        tone = 'default',
        underline = 'hover',
        hidden,
        hiddenAbove,
        current = false,
        block = false,
        disabled = false,
        className,
        children,
        href,
        onClick,
        ...rest
    },
    ref
) {
    const Component = component ?? 'a'

    // Prevent disabled links from navigating while still exposing their content.
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (disabled) {
            event.preventDefault()
            return
        }

        onClick?.(event)
    }

    return (
        <Component
            ref={ref}
            href={component ? undefined : disabled ? undefined : href}
            to={component ? to : undefined}
            className={cn(
                'link',
                tone,
                underline,
                current && 'current',
                block && 'block',
                disabled && 'disabled',
                className
            )}
            aria-current={current ? 'page' : undefined}
            aria-disabled={disabled || undefined}
            onClick={handleClick}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {children}
        </Component>
    )
})
