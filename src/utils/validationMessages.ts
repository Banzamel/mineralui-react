import type {ValidationResult} from './validators'

export type ValidationMessageParams = Record<string, string | number>

/** Translation info behind a failed built-in validator result. */
export interface ValidationMessageInfo {
    /** Key below `mineralui.validation.` (e.g. `email`, `minLength`, `postCode.PL`). */
    key: string
    /** English template with `{param}` placeholders; `error` is this template filled with `params`. */
    template: string
    params: ValidationMessageParams
}

// Results stay plain {valid, error} objects (backward compatible); the i18n info lives on the side.
const messageInfo = new WeakMap<ValidationResult, ValidationMessageInfo>()

export function fillValidationTemplate(template: string, params: ValidationMessageParams): string {
    return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match))
}

/** Build a failed result whose English message can later be translated via `mineralui.validation.<key>`. */
export function validationFailure(
    key: string,
    template: string,
    params: ValidationMessageParams = {}
): ValidationResult {
    const result: ValidationResult = {valid: false, error: fillValidationTemplate(template, params)}
    messageInfo.set(result, {key, template, params})
    return result
}

/** Translation info for a result returned by a built-in `validate*` function, if any. */
export function getValidationMessageInfo(result: ValidationResult): ValidationMessageInfo | undefined {
    return messageInfo.get(result)
}
