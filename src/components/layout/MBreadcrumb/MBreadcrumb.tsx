import {useEffect, useMemo, useRef, useState} from 'react'
import {cn} from '../../../utils/cn'
import type {MBreadcrumbProps} from './MBreadcrumb.types'
import {formatMText, useMLayoutTexts} from '../../../i18n/frameworkTexts'
import './MBreadcrumb.css'

// Render a compact path and collapse the middle when needed.
export function MBreadcrumb({items, separator = '/', maxItems, className, ...rest}: MBreadcrumbProps) {
    const texts = useMLayoutTexts()
    // The ellipsis is a disclosure button: once pressed, the whole path is shown.
    const [expanded, setExpanded] = useState(false)
    const focusRevealedRef = useRef(false)
    const revealedRef = useRef<HTMLLIElement | null>(null)

    // A new path (or a new limit) starts collapsed again.
    useEffect(() => {
        setExpanded(false)
    }, [items.length, maxItems])

    // Keep the current page visible while shortening deep paths.
    const visible = useMemo(() => {
        if (expanded || !maxItems || maxItems >= items.length) return items
        if (maxItems < 2) return [items[items.length - 1]]
        const head = items.slice(0, 1)
        const tail = items.slice(-(maxItems - 1))
        return [...head, null, ...tail]
    }, [items, maxItems, expanded])

    const hiddenCount = visible.includes(null) ? items.length - (visible.length - 1) : 0
    // Index (in the full list) of the first crumb the ellipsis was hiding.
    const firstRevealedIndex = maxItems && maxItems >= 2 ? 1 : -1

    // Move focus onto the first revealed crumb so keyboard users do not lose their place.
    useEffect(() => {
        if (!expanded || !focusRevealedRef.current) return
        focusRevealedRef.current = false
        const li = revealedRef.current
        if (!li) return
        const target = li.querySelector<HTMLElement>('a[href], button:not([disabled])')
        if (target) {
            target.focus()
        } else {
            li.tabIndex = -1
            li.focus()
        }
    }, [expanded])

    return (
        <nav aria-label={texts.breadcrumbLabel} className={cn('breadcrumb', className)} {...rest}>
            <ol className={cn('trail', expanded && 'expanded')}>
                {visible.map((item, i) => {
                    if (item === null) {
                        return (
                            <li key="ellipsis" className="crumb dots">
                                <span className="sep" aria-hidden="true">
                                    {separator}
                                </span>
                                <button
                                    type="button"
                                    className="link btn dots-toggle"
                                    aria-expanded={false}
                                    aria-label={formatMText(texts.breadcrumbShowHidden, {count: hiddenCount})}
                                    onClick={() => {
                                        focusRevealedRef.current = true
                                        setExpanded(true)
                                    }}
                                >
                                    <span aria-hidden="true">&#8230;</span>
                                </button>
                            </li>
                        )
                    }

                    const isLast = i === visible.length - 1

                    return (
                        <li
                            key={i}
                            ref={expanded && i === firstRevealedIndex ? revealedRef : undefined}
                            className={cn('crumb', isLast && 'active')}
                        >
                            {i > 0 && (
                                <span className="sep" aria-hidden="true">
                                    {separator}
                                </span>
                            )}
                            {item.href && !isLast ? (
                                <a href={item.href} className="link" onClick={item.onClick}>
                                    {item.label}
                                </a>
                            ) : item.onClick && !isLast ? (
                                <button type="button" className="link btn" onClick={item.onClick}>
                                    {item.label}
                                </button>
                            ) : (
                                <span className="current" aria-current={isLast ? 'page' : undefined}>
                                    {item.label}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
