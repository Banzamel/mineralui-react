import type {ValidationResult} from './validators'
import {validationFailure} from './validationMessages'

export type CreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'maestro' | 'unknown'

export interface CreditCardBrandDetails {
    brand: CreditCardBrand
    label: string
    iconLabel: string
    maxLength: number
    formatGroups: number[]
    regex: RegExp
    prefixRegex: RegExp
}

const OK_RESULT: ValidationResult = {valid: true}

// Card brand rules also drive formatting and visible brand badges.
const creditCardBrands: CreditCardBrandDetails[] = [
    {
        brand: 'visa',
        label: 'Visa',
        iconLabel: 'VISA',
        maxLength: 16,
        formatGroups: [4, 4, 4, 4],
        regex: /^4\d{12}(?:\d{3})?$/,
        prefixRegex: /^4/,
    },
    {
        brand: 'mastercard',
        label: 'Mastercard',
        iconLabel: 'MC',
        maxLength: 16,
        formatGroups: [4, 4, 4, 4],
        regex: /^(5[1-5]\d{14}|2(?:2[2-9]|[3-6]\d|7[01])\d{12}|2720\d{12})$/,
        prefixRegex: /^(5[1-5]|2(2[2-9]|[3-6]|7[01])|2720)/,
    },
    {
        brand: 'amex',
        label: 'American Express',
        iconLabel: 'AMEX',
        maxLength: 15,
        formatGroups: [4, 6, 5],
        regex: /^3[47]\d{13}$/,
        prefixRegex: /^3[47]/,
    },
    {
        brand: 'discover',
        label: 'Discover',
        iconLabel: 'DISC',
        maxLength: 16,
        formatGroups: [4, 4, 4, 4],
        regex: /^(6011\d{12}|65\d{14}|64[4-9]\d{13})$/,
        prefixRegex: /^(6011|65|64[4-9])/,
    },
    {
        brand: 'maestro',
        label: 'Maestro',
        iconLabel: 'MAES',
        maxLength: 19,
        formatGroups: [4, 4, 4, 4, 3],
        regex: /^(5[06789]\d{0,17}|6\d{0,18})$/,
        prefixRegex: /^(5[06789]|6)/,
    },
]

// Fall back to a generic brand so formatting still works for unknown prefixes.
function fallbackBrand(digits: string): CreditCardBrandDetails {
    return {
        brand: 'unknown',
        label: 'Card',
        iconLabel: 'CARD',
        maxLength: Math.min(Math.max(digits.length || 16, 16), 19),
        formatGroups: [4, 4, 4, 4, 3],
        regex: /^\d{12,19}$/,
        prefixRegex: /^\d/,
    }
}

// Remove every separator so card validation can work on raw digits.
export function stripCardNumber(value: string): string {
    return value.replace(/\D/g, '')
}

// Detect the best matching payment brand from the visible card prefix.
// Uses prefixRegex so the right brand (and its maxLength) is locked in while typing.
export function detectCardBrand(value: string): CreditCardBrandDetails {
    const digits = stripCardNumber(value)

    if (!digits) {
        return fallbackBrand(digits)
    }

    return (
        creditCardBrands.find((rule) => rule.regex.test(digits)) ??
        creditCardBrands.find((rule) => rule.prefixRegex.test(digits)) ??
        fallbackBrand(digits)
    )
}

// Group card digits according to the detected payment brand.
export function formatCardNumber(value: string): string {
    const digits = stripCardNumber(value)
    const rule = detectCardBrand(digits)
    const trimmedDigits = digits.slice(0, rule.maxLength)
    const parts: string[] = []
    let offset = 0

    for (const length of rule.formatGroups) {
        if (offset >= trimmedDigits.length) {
            break
        }

        parts.push(trimmedDigits.slice(offset, offset + length))
        offset += length
    }

    if (offset < trimmedDigits.length) {
        parts.push(trimmedDigits.slice(offset))
    }

    return parts.join(' ')
}

// Run the Luhn checksum used by most card numbers.
function passesLuhn(value: string): boolean {
    let sum = 0
    let shouldDouble = false

    for (let index = value.length - 1; index >= 0; index -= 1) {
        let digit = parseInt(value[index], 10)

        if (Number.isNaN(digit)) {
            return false
        }

        if (shouldDouble) {
            digit *= 2
            if (digit > 9) {
                digit -= 9
            }
        }

        sum += digit
        shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
}

// Validate the detected card brand and Luhn checksum without third-party runtime dependencies.
export function validateCardNumber(value: string): ValidationResult {
    if (!value) {
        return OK_RESULT
    }

    const digits = stripCardNumber(value)
    const rule = detectCardBrand(digits)

    if (digits.length < 12) {
        return validationFailure('cardTooShort', 'Card number is too short')
    }

    if (digits.length > rule.maxLength) {
        return rule.brand === 'unknown'
            ? validationFailure('cardTooLong', 'Card number is too long')
            : validationFailure('cardBrandTooLong', '{brand} card number is too long', {brand: rule.label})
    }

    if (rule.brand !== 'unknown' && !rule.regex.test(digits)) {
        return validationFailure('cardBrandInvalid', 'Invalid {brand} card number', {brand: rule.label})
    }

    if (!passesLuhn(digits)) {
        return validationFailure('cardChecksum', 'Invalid card checksum')
    }

    return OK_RESULT
}

export {creditCardBrands}
