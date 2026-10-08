import {useCallback, useLayoutEffect, useRef} from 'react'
import type * as React from 'react'

const SIGNIFICANT = /[0-9A-Za-z]/

// Count the characters that carry meaning, ignoring separators a formatter inserts.
function countSignificant(text: string): number {
    let count = 0
    for (const ch of text) {
        if (SIGNIFICANT.test(ch)) count++
    }
    return count
}

// Find the caret position right after the `count`-th significant character.
function caretAfterSignificant(text: string, count: number): number {
    if (count <= 0) return 0
    let seen = 0
    for (let i = 0; i < text.length; i++) {
        if (SIGNIFICANT.test(text[i])) {
            seen++
            if (seen === count) return i + 1
        }
    }
    return text.length
}

/**
 * Keeps the caret where the user left it when a formatted input rewrites its value
 * (inserting spaces or dashes). Call the returned function from `onChange` before the
 * formatted value is stored; the caret is restored after the next commit. Edits at the
 * end of the field are left alone — the browser already puts the caret there.
 */
export function useFormatCaret() {
    const pendingRef = useRef<{input: HTMLInputElement; count: number} | null>(null)

    useLayoutEffect(() => {
        const pending = pendingRef.current
        if (!pending) return
        pendingRef.current = null
        const {input, count} = pending
        if (input.ownerDocument.activeElement !== input) return
        const position = caretAfterSignificant(input.value, count)
        if (input.selectionStart !== position || input.selectionEnd !== position) {
            input.setSelectionRange(position, position)
        }
    })

    return useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target
        const caret = input.selectionStart
        if (caret === null || caret >= input.value.length) {
            pendingRef.current = null
            return
        }
        pendingRef.current = {input, count: countSignificant(input.value.slice(0, caret))}
    }, [])
}
