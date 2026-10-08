import {useState, useRef, useCallback, useMemo} from 'react'
import type * as React from 'react'
import type {MFormProps, MFieldRegistration, MFormContextValue, MFormHelpers} from './MForm.types'
import {FormContext} from './FormContext'
import {validateRequired} from '../../../utils/validators'
import type {ValidationResult} from '../../../utils/validators'
import {useMValidationMessage} from '../../../i18n/frameworkTexts'
import './MForm.css'

// Coordinate form values, validation state and submit helpers through context.
export function MForm({
    initialValues = {},
    onSubmit,
    onChange,
    validationMode = 'onBlur',
    children,
    className,
    style,
    noValidate = true,
    ...rest
}: MFormProps) {
    const [values, setValues] = useState<Record<string, unknown>>({...initialValues})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fieldsRef = useRef<Map<string, MFieldRegistration>>(new Map())
    // Latest values outside the render cycle, so validation never reads a stale closure.
    const valuesRef = useRef<Record<string, unknown>>(values)

    // Track mounted fields so validation stays aligned with active inputs.
    const registerField = useCallback((reg: MFieldRegistration) => {
        fieldsRef.current.set(reg.name, reg)
    }, [])

    const unregisterField = useCallback((name: string) => {
        fieldsRef.current.delete(name)
    }, [])

    const translateValidation = useMValidationMessage()

    // Run required and custom validators without mutating visible error state yet.
    const validateFieldInternal = useCallback(
        (name: string, val?: unknown): ValidationResult => {
            const reg = fieldsRef.current.get(name)
            if (!reg) return {valid: true}

            const fieldValue = val !== undefined ? val : valuesRef.current[name]
            const strValue = fieldValue != null ? String(fieldValue) : ''

            // Required check
            if (reg.required) {
                const reqResult = translateValidation(validateRequired(strValue))
                if (!reqResult.valid) return reqResult
            }

            // Custom validators
            if (reg.validate) {
                for (const validator of reg.validate) {
                    const result = validator(strValue)
                    if (!result.valid) return result
                }
            }

            return {valid: true}
        },
        [translateValidation]
    )

    // Persist the latest validation result for a single field.
    const validateField = useCallback(
        (name: string, val?: unknown): ValidationResult => {
            const result = validateFieldInternal(name, val)
            setErrors((prev) => {
                if (result.valid) {
                    const next = {...prev}
                    delete next[name]
                    return next
                }
                return {...prev, [name]: result.error!}
            })
            return result
        },
        [validateFieldInternal]
    )

    // Validate every registered field before submit.
    const validateAll = useCallback((): boolean => {
        let allValid = true
        const newErrors: Record<string, string> = {}

        for (const [name] of fieldsRef.current) {
            const result = validateFieldInternal(name)
            if (!result.valid) {
                allValid = false
                newErrors[name] = result.error!
            }
        }

        setErrors(newErrors)
        // Mark all as touched
        const allTouched: Record<string, boolean> = {}
        for (const [name] of fieldsRef.current) {
            allTouched[name] = true
        }
        setTouched(allTouched)

        return allValid
    }, [validateFieldInternal])

    // Update field values and trigger onChange or validation according to mode.
    const setFieldValue = useCallback(
        (name: string, val: unknown) => {
            const next = {...valuesRef.current, [name]: val}
            valuesRef.current = next
            setValues(next)
            onChange?.(next)

            if (validationMode === 'onChange' && touched[name]) {
                validateField(name, val)
            }
        },
        [onChange, validationMode, touched, validateField]
    )

    const setFieldError = useCallback((name: string, error: string) => {
        setErrors((prev) => ({...prev, [name]: error}))
    }, [])

    // Mark fields as touched so blur validation can start surfacing errors.
    const setFieldTouched = useCallback(
        (name: string, isTouched: boolean) => {
            setTouched((prev) => ({...prev, [name]: isTouched}))
            if (validationMode === 'onBlur' && isTouched) {
                validateField(name)
            }
        },
        [validationMode, validateField]
    )

    const resetForm = useCallback(() => {
        valuesRef.current = {...initialValues}
        setValues(valuesRef.current)
        setErrors({})
        setTouched({})
        setIsSubmitting(false)
    }, [initialValues])

    // Guard submit flow with validation and a single in-flight submission state.
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (isSubmitting) return

            const valid = validateAll()
            if (!valid) return

            setIsSubmitting(true)
            const helpers: MFormHelpers = {
                setSubmitting: setIsSubmitting,
                resetForm,
                setFieldError,
            }

            try {
                await onSubmit?.(valuesRef.current, helpers)
            } finally {
                setIsSubmitting(false)
            }
        },
        [isSubmitting, validateAll, onSubmit, resetForm, setFieldError]
    )

    // Memoize the public form context to limit downstream re-renders.
    const ctx = useMemo<MFormContextValue>(
        () => ({
            values,
            errors,
            touched,
            registerField,
            unregisterField,
            setFieldValue,
            setFieldError,
            setFieldTouched,
            validateField,
            validateAll,
            resetForm,
            isSubmitting,
        }),
        [
            values,
            errors,
            touched,
            registerField,
            unregisterField,
            setFieldValue,
            setFieldError,
            setFieldTouched,
            validateField,
            validateAll,
            resetForm,
            isSubmitting,
        ]
    )

    return (
        <FormContext.Provider value={ctx}>
            <form
                onSubmit={handleSubmit}
                noValidate={noValidate}
                className={`form${className ? ` ${className}` : ''}`}
                style={style}
                {...rest}
            >
                {typeof children === 'function' ? children(ctx) : children}
            </form>
        </FormContext.Provider>
    )
}
