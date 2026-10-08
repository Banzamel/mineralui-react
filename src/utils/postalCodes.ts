import type {ValidationResult} from './validators'
import {validationFailure} from './validationMessages'

export interface PostCodeRule {
    countryCode: string
    label: string
    placeholder: string
    example: string
    inputMode: 'text' | 'numeric'
    maxLength: number
    regex: RegExp
    sanitize: (value: string) => string
    format: (value: string) => string
    message: string
}

const OK_RESULT: ValidationResult = {valid: true}

// Reuse one sanitizer for countries that mix letters and digits.
function keepLettersAndDigits(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Apply the common Polish XX-XXX postcode shape.
function formatPlPostCode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 5)

    if (digits.length <= 2) {
        return digits
    }

    return `${digits.slice(0, 2)}-${digits.slice(2)}`
}

// Support ZIP and ZIP+4 with the same formatter.
function formatUsPostCode(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 9)

    if (digits.length <= 5) {
        return digits
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

// Clamp countries that only need a fixed number of digits.
function formatFixedDigits(value: string, maxLength: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength)
}

// Insert the standard center space used by Canadian post codes.
function formatCaPostCode(value: string): string {
    const clean = keepLettersAndDigits(value).slice(0, 6)
    const chars = clean.split('')

    return chars
        .map((char, index) => {
            if (index === 3) {
                return ` ${char}`
            }

            return char
        })
        .join('')
}

// Split the outward and inward parts of a UK postcode.
function formatGbPostCode(value: string): string {
    const clean = keepLettersAndDigits(value).slice(0, 7)

    if (clean.length <= 3) {
        return clean
    }

    return `${clean.slice(0, clean.length - 3)} ${clean.slice(-3)}`
}

// Split Dutch codes into four digits and two letters.
function formatNlPostCode(value: string): string {
    const clean = keepLettersAndDigits(value).slice(0, 6)

    if (clean.length <= 4) {
        return clean
    }

    return `${clean.slice(0, 4)} ${clean.slice(4)}`
}

export const postCodeRules: Record<string, PostCodeRule> = {
    PL: {
        countryCode: 'PL',
        label: 'Poland',
        placeholder: '12-345',
        example: '00-001',
        inputMode: 'numeric',
        maxLength: 6,
        regex: /^\d{2}-\d{3}$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 5),
        format: formatPlPostCode,
        message: 'Use the Polish format XX-XXX',
    },
    DE: {
        countryCode: 'DE',
        label: 'Germany',
        placeholder: '12345',
        example: '10115',
        inputMode: 'numeric',
        maxLength: 5,
        regex: /^\d{5}$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 5),
        format: (value) => formatFixedDigits(value, 5),
        message: 'Use a 5-digit German postal code',
    },
    FR: {
        countryCode: 'FR',
        label: 'France',
        placeholder: '75001',
        example: '75001',
        inputMode: 'numeric',
        maxLength: 5,
        regex: /^\d{5}$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 5),
        format: (value) => formatFixedDigits(value, 5),
        message: 'Use a 5-digit French postal code',
    },
    ES: {
        countryCode: 'ES',
        label: 'Spain',
        placeholder: '28013',
        example: '28013',
        inputMode: 'numeric',
        maxLength: 5,
        regex: /^\d{5}$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 5),
        format: (value) => formatFixedDigits(value, 5),
        message: 'Use a 5-digit Spanish postal code',
    },
    IT: {
        countryCode: 'IT',
        label: 'Italy',
        placeholder: '00184',
        example: '00184',
        inputMode: 'numeric',
        maxLength: 5,
        regex: /^\d{5}$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 5),
        format: (value) => formatFixedDigits(value, 5),
        message: 'Use a 5-digit Italian postal code',
    },
    US: {
        countryCode: 'US',
        label: 'United States',
        placeholder: '12345 or 12345-6789',
        example: '10001',
        inputMode: 'numeric',
        maxLength: 10,
        regex: /^\d{5}(?:-\d{4})?$/,
        sanitize: (value) => value.replace(/\D/g, '').slice(0, 9),
        format: formatUsPostCode,
        message: 'Use ZIP or ZIP+4 format',
    },
    CA: {
        countryCode: 'CA',
        label: 'Canada',
        placeholder: 'A1A 1A1',
        example: 'M5V 3L9',
        inputMode: 'text',
        maxLength: 7,
        regex: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
        sanitize: (value) => keepLettersAndDigits(value).slice(0, 6),
        format: formatCaPostCode,
        message: 'Use the Canadian format A1A 1A1',
    },
    GB: {
        countryCode: 'GB',
        label: 'United Kingdom',
        placeholder: 'SW1A 1AA',
        example: 'SW1A 1AA',
        inputMode: 'text',
        maxLength: 8,
        regex: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
        sanitize: (value) => keepLettersAndDigits(value).slice(0, 7),
        format: formatGbPostCode,
        message: 'Use a valid UK postcode',
    },
    NL: {
        countryCode: 'NL',
        label: 'Netherlands',
        placeholder: '1234 AB',
        example: '1012 AB',
        inputMode: 'text',
        maxLength: 7,
        regex: /^\d{4} [A-Z]{2}$/,
        sanitize: (value) => keepLettersAndDigits(value).slice(0, 6),
        format: formatNlPostCode,
        message: 'Use the Dutch format 1234 AB',
    },
}

export const postCodeCountries = Object.values(postCodeRules).map(({countryCode, label}) => ({
    value: countryCode,
    label,
}))

// Return the active postal rule or fall back to Poland for deterministic behavior.
export function getPostCodeRule(countryCode: string = 'PL'): PostCodeRule {
    return postCodeRules[countryCode.toUpperCase()] ?? postCodeRules.PL
}

// Keep postal input values aligned with the selected country format.
export function formatPostCode(value: string, countryCode: string = 'PL'): string {
    const rule = getPostCodeRule(countryCode)
    return rule.format(rule.sanitize(value))
}

// Validate the user-visible postal code against the selected country rule.
export function validatePostCode(value: string, countryCode: string = 'PL'): ValidationResult {
    if (!value) {
        return OK_RESULT
    }

    const rule = getPostCodeRule(countryCode)
    const formatted = rule.format(rule.sanitize(value))

    if (!rule.regex.test(formatted)) {
        return validationFailure(`postCode.${rule.countryCode}`, rule.message)
    }

    return OK_RESULT
}
