import {useState, useCallback, useEffect, useLayoutEffect, useRef, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputCurrencyProps} from './MInputCurrency.types'
import {MInput} from '../MInput'
import {cn} from '../../../utils/cn'
import {formatCurrency, parseCurrencyToNumber} from '../../../utils/formatters'
import './MInputCurrency.css'

// Extend the base input with currency formatting and numeric callbacks.
export const MInputCurrency = forwardRef<HTMLInputElement, MInputCurrencyProps>(function MInputCurrency(
    {
        currency,
        currencySymbol,
        currencyPosition = 'end',
        decimalSeparator = ',',
        thousandSeparator = ' ',
        precision = 2,
        min,
        max,
        allowNegative = false,
        onValueChange,
        value,
        defaultValue,
        onChange,
        onBlur,
        placeholder = '0,00',
        startIcon,
        endIcon,
        className,
        ...rest
    },
    ref
) {
    const symbol = currencySymbol ?? currency ?? ''

    // Turn anything the consumer may pass — a number, a machine string (`45.5`)
    // or an already formatted one (`1 234,50`) — into the display string.
    const toDisplay = useCallback(
        (input: string | number | null | undefined): string => {
            if (input === undefined || input === null || input === '') return ''
            const raw = typeof input === 'number' ? input.toFixed(precision) : String(input)
            const stripped = thousandSeparator ? raw.split(thousandSeparator).join('') : raw
            const num = parseCurrencyToNumber(stripped, '', decimalSeparator)
            if (num === null) return ''
            return formatCurrency(num.toFixed(precision), {decimalSeparator, thousandSeparator, precision})
        },
        [decimalSeparator, thousandSeparator, precision]
    )

    const toNumber = useCallback(
        (input: string | number | null | undefined): number | null => {
            if (input === undefined || input === null || input === '') return null
            if (typeof input === 'number') return Number.isNaN(input) ? null : input
            return parseCurrencyToNumber(input, thousandSeparator, decimalSeparator)
        },
        [thousandSeparator, decimalSeparator]
    )

    // The field keeps its own display buffer even when `value` is controlled.
    // Without it a half-typed amount (`45,`) round-trips through the consumer's
    // number state and comes back as `45`, which makes the decimals impossible
    // to type at all.
    const [display, setDisplay] = useState<string>(() => toDisplay(value !== undefined ? value : defaultValue))

    const inputRef = useRef<HTMLInputElement | null>(null)
    const caretRef = useRef<number | null>(null)

    const setRefs = useCallback(
        (node: HTMLInputElement | null) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node
        },
        [ref]
    )

    // Re-sync from a controlled `value` only when it disagrees numerically with
    // what is on screen, so typing is never interrupted by the round-trip.
    useEffect(() => {
        if (value === undefined) return
        if (toNumber(value) === toNumber(display)) return
        setDisplay(toDisplay(value))
    }, [value, display, toDisplay, toNumber])

    // Count the characters that carry meaning, ignoring the grouping separators
    // this component inserts — used to keep the caret where the user left it.
    const countSignificant = useCallback(
        (text: string, upTo: number): number => {
            let count = 0
            for (let i = 0; i < upTo && i < text.length; i++) {
                const ch = text[i]
                if ((ch >= '0' && ch <= '9') || ch === decimalSeparator || ch === '-') count++
            }
            return count
        },
        [decimalSeparator]
    )

    const caretForSignificant = useCallback(
        (text: string, significant: number): number => {
            if (significant <= 0) return 0
            let count = 0
            for (let i = 0; i < text.length; i++) {
                const ch = text[i]
                if ((ch >= '0' && ch <= '9') || ch === decimalSeparator || ch === '-') count++
                if (count === significant) return i + 1
            }
            return text.length
        },
        [decimalSeparator]
    )

    useLayoutEffect(() => {
        const caret = caretRef.current
        caretRef.current = null
        if (caret === null) return
        const node = inputRef.current
        if (!node || document.activeElement !== node) return
        node.setSelectionRange(caret, caret)
    }, [display])

    // Filter user input down to digits, one decimal separator and an optional
    // minus sign, then re-group it without swallowing what is still being typed.
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value
            const rawCaret = e.target.selectionStart ?? raw.length
            let filtered = ''
            let hasDecimal = false
            // A thousands separator that is also a decimal candidate (`.` or `,`) is
            // grouping — skip it so `1.234` + `5` stays `12.345`, not `1,2345`.
            const groupingChar = thousandSeparator && thousandSeparator !== decimalSeparator ? thousandSeparator : ''
            for (const ch of raw) {
                if (groupingChar && ch === groupingChar) {
                    continue
                }
                if (ch >= '0' && ch <= '9') {
                    filtered += ch
                } else if ((ch === ',' || ch === '.') && !hasDecimal && precision > 0) {
                    filtered += decimalSeparator
                    hasDecimal = true
                } else if (ch === '-' && allowNegative && filtered.length === 0) {
                    filtered += '-'
                }
            }

            const hasDigits = /\d/.test(filtered)
            let next: string
            if (!hasDigits) {
                // Keep the transient states the user needs to pass through
                // (empty field, a lone minus) instead of snapping them to `0`.
                next = filtered.startsWith('-') ? '-' : ''
            } else {
                next = formatCurrency(filtered, {decimalSeparator, thousandSeparator, precision})
                // `formatCurrency` drops an empty fractional part, which would
                // eat the separator on the keystroke that opens the decimals.
                if (filtered.endsWith(decimalSeparator) && !next.includes(decimalSeparator)) {
                    next += decimalSeparator
                }
            }

            caretRef.current = caretForSignificant(next, countSignificant(raw, rawCaret))
            setDisplay(next)
            onValueChange?.(parseCurrencyToNumber(next, thousandSeparator, decimalSeparator))
            onChange?.(e)
        },
        [
            onChange,
            decimalSeparator,
            thousandSeparator,
            precision,
            allowNegative,
            onValueChange,
            countSignificant,
            caretForSignificant,
        ]
    )

    // Clamp the numeric value on blur and snap it to the configured precision.
    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            let num = parseCurrencyToNumber(display, thousandSeparator, decimalSeparator)
            if (num !== null) {
                if (min !== undefined && num < min) num = min
                if (max !== undefined && num > max) num = max
                const formatted = toDisplay(num)
                if (formatted !== display) {
                    setDisplay(formatted)
                }
                onValueChange?.(num)
            } else if (display !== '') {
                setDisplay('')
                onValueChange?.(null)
            }
            onBlur?.(e)
        },
        [display, min, max, decimalSeparator, thousandSeparator, toDisplay, onValueChange, onBlur]
    )

    const symbolEl = symbol ? <span className="currency symbol">{symbol}</span> : undefined

    return (
        <MInput
            {...rest}
            ref={setRefs}
            type="text"
            inputMode="decimal"
            value={display}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            startIcon={currencyPosition === 'start' ? symbolEl : startIcon}
            endIcon={currencyPosition === 'end' ? symbolEl : endIcon}
            className={cn('currency input', className)}
        />
    )
})
