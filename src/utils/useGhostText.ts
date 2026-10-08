import {useState, useCallback, useMemo} from 'react'
import type * as React from 'react'

export interface GhostTextOptions<T = string> {
    options: T[]
    value: string
    minChars?: number
    getLabel?: (option: T) => string
    filter?: (options: T[], input: string) => T[]
}

export interface GhostTextReturn<T = string> {
    /** The ghost suffix to render after the typed text. */
    hint: string
    /** Accept the current hint and return the full value. */
    accept: () => {value: string; option: T | null}
    /** Cycle to the next matching option. */
    next: () => void
    /** Cycle to the previous matching option. */
    prev: () => void
    /** Reset the hint index (call on value change). */
    reset: () => void
    /** Number of matching options. */
    matchCount: number
    /** Handle keyboard events — Tab/Enter accept, arrows cycle (only while a hint is shown), Escape hides the hint
     *  until the value changes. */
    onKeyDown: (e: React.KeyboardEvent) => boolean
}

function defaultGetLabel<T>(option: T): string {
    return typeof option === 'string' ? option : String(option)
}

function defaultFilter<T>(options: T[], input: string, getLabel: (o: T) => string): T[] {
    if (!input) return []
    const lower = input.toLowerCase()
    return options.filter((o) => getLabel(o).toLowerCase().startsWith(lower))
}

// Manage inline ghost-text suggestions for any text input.
export function useGhostText<T = string>({
    options,
    value,
    minChars = 2,
    getLabel = defaultGetLabel,
    filter,
}: GhostTextOptions<T>): GhostTextReturn<T> {
    const [hintIndex, setHintIndex] = useState(0)
    // Value for which the user dismissed the hint with Escape; typing anything else shows hints again.
    const [dismissedFor, setDismissedFor] = useState<string | null>(null)

    const filtered = useMemo(() => {
        if (value.length < minChars) return []
        if (filter) return filter(options, value)
        return defaultFilter(options, value, getLabel)
    }, [options, value, minChars, filter, getLabel])

    const current = filtered.length > 0 ? filtered[hintIndex % filtered.length] : null
    const fullLabel = current ? getLabel(current) : ''
    const hint =
        dismissedFor !== value && fullLabel && fullLabel.toLowerCase().startsWith(value.toLowerCase())
            ? fullLabel.slice(value.length)
            : ''

    const accept = useCallback(() => {
        if (!hint || !current) return {value, option: null}
        return {value: value + hint, option: current}
    }, [hint, current, value])

    const next = useCallback(() => {
        if (filtered.length > 1) setHintIndex((i) => (i + 1) % filtered.length)
    }, [filtered.length])

    const prev = useCallback(() => {
        if (filtered.length > 1) setHintIndex((i) => (i - 1 + filtered.length) % filtered.length)
    }, [filtered.length])

    const reset = useCallback(() => {
        setHintIndex(0)
        setDismissedFor(null)
    }, [])

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent): boolean => {
            if ((e.key === 'Tab' || e.key === 'Enter') && hint) {
                e.preventDefault()
                return true // signal: caller should accept
            }
            if (e.key === 'Escape' && hint) {
                e.preventDefault()
                setDismissedFor(value)
                return false
            }
            // Arrows only cycle a visible hint; otherwise they keep moving the caret (e.g. in a textarea).
            if (e.key === 'ArrowDown' && hint && filtered.length > 1) {
                e.preventDefault()
                next()
                return false
            }
            if (e.key === 'ArrowUp' && hint && filtered.length > 1) {
                e.preventDefault()
                prev()
                return false
            }
            return false
        },
        [hint, value, filtered.length, next, prev]
    )

    return {hint, accept, next, prev, reset, matchCount: filtered.length, onKeyDown}
}
