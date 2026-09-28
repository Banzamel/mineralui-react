import {useCallback, useRef, useState} from 'react'

/**
 * Generic controlled/uncontrolled state. The value is controlled when `value !== undefined`
 * (React convention). `onChange` fires for every requested change, controlled or not.
 */
export function useControllableState<T>(
    value: T | undefined,
    defaultValue: T | (() => T),
    onChange?: (next: T) => void
): [T, (next: T) => void] {
    const [inner, setInner] = useState<T>(defaultValue)
    const controlled = value !== undefined
    const current = controlled ? (value as T) : inner
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const currentRef = useRef(current)
    currentRef.current = current

    const setValue = useCallback(
        (next: T) => {
            if (!controlled) {
                setInner(next)
            }
            if (!Object.is(next, currentRef.current)) {
                onChangeRef.current?.(next)
            }
        },
        [controlled]
    )

    return [current, setValue]
}
