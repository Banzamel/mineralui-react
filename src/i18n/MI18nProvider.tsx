import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

const STORAGE_KEY = 'mineralui-locale'

// Set <html lang> before paint on the client; no-op during SSR.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Dict = Record<string, unknown>

// Replace `{name}` placeholders; a placeholder without a value is left untouched.
function interpolate(text: string, vars: MI18nVars): string {
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
        Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
    )
}

// Read the saved locale, but fall back cleanly in SSR or blocked storage.
function readStored(fallback: string): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? fallback
    } catch {
        return fallback
    }
}

// Resolve nested translation keys like "ui.actions.save".
function getByPath(obj: unknown, path: string): unknown {
    return path
        .split('.')
        .reduce<unknown>((cur, key) => (cur != null && typeof cur === 'object' ? (cur as Dict)[key] : undefined), obj)
}

/** Values interpolated into `{name}` placeholders by `t()` (since 2.7.0). */
export type MI18nVars = Record<string, string | number>

/**
 * Translate a dot-path key.
 *  - `t(key)` / `t(key, 'Fallback')` — as before: the fallback (or the key) when missing.
 *  - `t(key, {name: 'Ada'})` — interpolates `{name}` in the resolved text.
 *  - `t(key, 'Hi {name}', {name: 'Ada'})` — fallback and values together.
 * Placeholders are replaced only when values are passed; unknown placeholders stay as-is.
 */
export type MI18nTranslate = (key: string, fallbackOrVars?: string | MI18nVars, vars?: MI18nVars) => string

export interface MI18nContextValue<T extends Dict = Dict> {
    locale: string
    setLocale: (next: string) => void
    toggleLocale: () => void
    dict: T
    t: MI18nTranslate
}

const I18nContext = createContext<MI18nContextValue | null>(null)

export interface MI18nProviderProps<T extends Dict = Dict> {
    locales: Record<string, T>
    defaultLocale?: string
    /** Read and write the persisted locale. Defaults to `true` for the outermost provider and `false`
     *  for a nested one, so a local scope never overrides the user's global choice. */
    persist?: boolean
    /** Mirror the active locale to `<html lang>`. Defaults to `true` for the outermost provider and
     *  `false` for a nested one. */
    setDocumentLang?: boolean
    children: ReactNode
}

// Provide the active locale, dictionary and a tiny dot-path translator.
export function MI18nProvider<T extends Dict = Dict>({
    locales,
    defaultLocale,
    persist: persistProp,
    setDocumentLang: setDocumentLangProp,
    children,
}: MI18nProviderProps<T>) {
    const isNested = useContext(I18nContext) !== null
    const persist = persistProp ?? !isNested
    const setDocumentLang = setDocumentLangProp ?? !isNested
    const keys = useMemo(() => Object.keys(locales), [locales])
    const fallback = defaultLocale ?? keys[0] ?? 'en'

    const [locale, setLocaleState] = useState<string>(() => {
        if (persist) {
            const stored = readStored(fallback)
            if (stored in locales) return stored
        }
        return fallback
    })

    const setLocale = useCallback(
        (next: string) => {
            setLocaleState(next)
            if (persist) {
                try {
                    localStorage.setItem(STORAGE_KEY, next)
                } catch {
                    /* noop */
                }
            }
        },
        [persist]
    )

    const toggleLocale = useCallback(() => {
        const idx = keys.indexOf(locale)
        const next = keys[(idx + 1) % keys.length]
        setLocale(next)
    }, [keys, locale, setLocale])

    useIsomorphicLayoutEffect(() => {
        if (setDocumentLang) document.documentElement.lang = locale
    }, [locale, setDocumentLang])

    const dict = (locales[locale] ?? locales[fallback] ?? {}) as T

    const t = useCallback<MI18nTranslate>(
        (key, fallbackOrVars, varsArg) => {
            const fb = typeof fallbackOrVars === 'string' ? fallbackOrVars : undefined
            const vars = fallbackOrVars != null && typeof fallbackOrVars === 'object' ? fallbackOrVars : varsArg
            const resolve = (): string => {
                const val = getByPath(dict, key)
                if (typeof val === 'string') return val

                const docsVal =
                    dict != null && typeof dict === 'object' && typeof (dict as Dict).docsTranslations === 'object'
                        ? ((dict as Dict).docsTranslations as Dict)[key]
                        : undefined

                if (typeof docsVal === 'string') return docsVal

                return fb ?? key
            }

            const text = resolve()
            return vars ? interpolate(text, vars) : text
        },
        [dict]
    )

    const ctx = useMemo<MI18nContextValue<T>>(
        () => ({
            locale,
            setLocale,
            toggleLocale,
            dict,
            t,
        }),
        [locale, setLocale, toggleLocale, dict, t]
    )

    return <I18nContext.Provider value={ctx as MI18nContextValue}>{children}</I18nContext.Provider>
}

export function useMI18n<T extends Dict = Dict>(): MI18nContextValue<T> {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error('useMI18n must be used within MI18nProvider')
    return ctx as MI18nContextValue<T>
}

export function useOptionalMI18n<T extends Dict = Dict>(): MI18nContextValue<T> | null {
    const ctx = useContext(I18nContext)
    return ctx as MI18nContextValue<T> | null
}
