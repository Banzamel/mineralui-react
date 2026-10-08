import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import type {MTheme, MMode, MModePreference} from './MTheme.types'

const STORAGE_KEY = 'mineralui-theme'

// Apply DOM classes before paint on the client; no-op during SSR.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface MThemeInitScriptOptions {
    /** Mode used when nothing is persisted. Matches the `mode` prop of `MThemeProvider`. Default `'dark'`. */
    defaultMode?: MModePreference
    /** Read the persisted mode (`localStorage['mineralui-theme']`). Default `true`. */
    persist?: boolean
}

/**
 * Inline script that sets the `theme-light` class on `<html>` before the first paint, so SSR / static
 * pages do not flash the dark theme. Render it in `<head>`, e.g.
 * `<script dangerouslySetInnerHTML={{__html: getMThemeInitScript({defaultMode: 'light'})}} />`.
 * `MThemeProvider scope="body"` keeps the `<html>` class in sync afterwards.
 */
export function getMThemeInitScript({defaultMode = 'dark', persist = true}: MThemeInitScriptOptions = {}): string {
    const fallback = JSON.stringify(defaultMode === 'light' || defaultMode === 'system' ? defaultMode : 'dark')
    const read = persist ? `try{m=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}catch(e){}` : ''
    return (
        `(function(){try{var m=null;${read}` +
        `if(m!=='dark'&&m!=='light'&&m!=='system')m=${fallback};` +
        `if(m==='system')m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';` +
        `document.documentElement.classList.toggle('theme-light',m==='light')}catch(e){}})()`
    )
}

/** `getMThemeInitScript()` with the defaults (dark, persisted). */
export const M_THEME_INIT_SCRIPT = getMThemeInitScript()

// Resolve the final mode once 'system' is allowed.
function resolveMode(pref: MModePreference): MMode {
    if (pref !== 'system') return pref
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Read a persisted mode safely when storage is available.
function readStored(): MModePreference | null {
    try {
        const v = localStorage.getItem(STORAGE_KEY)
        if (v === 'dark' || v === 'light' || v === 'system') return v
    } catch {
        /* SSR / blocked storage */
    }
    return null
}

export interface MThemeContextValue {
    theme: MTheme
    mode: MModePreference
    resolvedMode: MMode
    setMode: (next: MModePreference) => void
    toggleMode: () => void
}

const ThemeContext = createContext<MThemeContextValue>({
    theme: {},
    mode: 'dark',
    resolvedMode: 'dark',
    setMode: () => {},
    toggleMode: () => {},
})

// Map JS theme keys to CSS custom properties.
const varMap: Record<keyof MTheme, string> = {
    primaryRgb: '--mineral-primary-rgb',
    primary: '--mineral-primary',
    primaryDark: '--mineral-primary-dark',
    primaryLight: '--mineral-primary-light',
    neutralRgb: '--mineral-neutral-rgb',
    neutral: '--mineral-neutral',
    dark: '--mineral-dark',
    darkLight: '--mineral-dark-light',
    surface: '--mineral-surface',
    surfaceContrast: '--mineral-surface-contrast',
    pageBg: '--mineral-page-bg',
    pageText: '--mineral-page-text',
    text: '--mineral-text',
    textSecondary: '--mineral-text-secondary',
    textHeading: '--mineral-text-heading',
    border: '--mineral-border',
    borderHover: '--mineral-border-hover',
    borderFocus: '--mineral-border-focus',
    successRgb: '--mineral-success-rgb',
    success: '--mineral-success',
    errorRgb: '--mineral-error-rgb',
    error: '--mineral-error',
    warningRgb: '--mineral-warning-rgb',
    warning: '--mineral-warning',
    infoRgb: '--mineral-info-rgb',
    info: '--mineral-info',
    fontFamily: '--mineral-font-family-sans',
    fontFamilySans: '--mineral-font-family-sans',
    fontFamilyMono: '--mineral-font-family-mono',
    fontFamilyHeading: '--mineral-font-family-heading',
    fontColorDefault: '--mineral-fcolor-default',
    fontColorMuted: '--mineral-fcolor-muted',
    fontColorHeading: '--mineral-fcolor-heading',
    fontColorInverted: '--mineral-fcolor-inverted',
    fontColorPrimary: '--mineral-fcolor-primary',
    fontColorNeutral: '--mineral-fcolor-neutral',
    fontColorSuccess: '--mineral-fcolor-success',
    fontColorError: '--mineral-fcolor-error',
    fontColorWarning: '--mineral-fcolor-warning',
    fontColorInfo: '--mineral-fcolor-info',
    radiusSm: '--mineral-radius-sm',
    radiusMd: '--mineral-radius-md',
    radiusLg: '--mineral-radius-lg',
}

export type MThemeScope = 'body' | 'wrapper'

export interface MThemeProviderProps {
    theme?: MTheme
    mode?: MModePreference
    /** Read and write the persisted mode. Defaults to `true` for `scope="body"` and `false` for
     *  `scope="wrapper"`, so a local preview never overrides the user's global choice. */
    persist?: boolean
    scope?: MThemeScope
    children: ReactNode
}

// Sync theme tokens and mode classes with either the body or a local wrapper.
export function MThemeProvider({
    theme,
    mode: modeProp = 'dark',
    persist: persistProp,
    scope = 'body',
    children,
}: MThemeProviderProps) {
    const persist = persistProp ?? scope === 'body'
    const ref = useRef<HTMLDivElement>(null)
    const safeTheme = useMemo(() => theme ?? {}, [theme])

    const [mode, setModeState] = useState<MModePreference>(() => {
        if (persist) {
            const stored = readStored()
            if (stored) return stored
        }
        return modeProp
    })

    // Follow later changes of the `mode` prop (the persisted value only wins on mount).
    const lastModeProp = useRef(modeProp)
    useEffect(() => {
        if (lastModeProp.current === modeProp) return
        lastModeProp.current = modeProp
        setModeState(modeProp)
    }, [modeProp])

    // Re-render on OS colour-scheme changes; resolveMode reads matchMedia during render.
    const [, refreshSystemMode] = useReducer((tick: number) => tick + 1, 0)

    const resolved = resolveMode(mode)

    const setMode = useCallback(
        (next: MModePreference) => {
            setModeState(next)
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

    const toggleMode = useCallback(() => {
        setMode(resolved === 'dark' ? 'light' : 'dark')
    }, [resolved, setMode])

    // Listen for system theme changes when mode is 'system'.
    useEffect(() => {
        if (mode !== 'system') return
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = () => refreshSystemMode()
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [mode])

    // Apply token overrides and light/dark class before paint.
    useIsomorphicLayoutEffect(() => {
        const target = scope === 'body' ? document.body : ref.current
        if (!target) return

        // Body scope: keep <html> in sync too, so the class set by getMThemeInitScript() never goes stale.
        // Wrapper scope: the wrapper's className (theme-light / theme-dark) is rendered by React.
        const classTargets = scope === 'body' ? [target, document.documentElement] : []
        for (const node of classTargets) node.classList.toggle('theme-light', resolved === 'light')

        for (const [key, value] of Object.entries(safeTheme)) {
            const cssVar = varMap[key as keyof MTheme]
            if (cssVar && value) {
                target.style.setProperty(cssVar, value)
                if (cssVar === '--mineral-font-family-sans') {
                    target.style.setProperty('--mineral-font-family', value)
                }
            }
        }

        return () => {
            for (const key of Object.keys(safeTheme)) {
                const cssVar = varMap[key as keyof MTheme]
                if (cssVar) {
                    target.style.removeProperty(cssVar)
                    if (cssVar === '--mineral-font-family-sans') {
                        target.style.removeProperty('--mineral-font-family')
                    }
                }
            }
            for (const node of classTargets) node.classList.remove('theme-light')
        }
    }, [resolved, safeTheme, scope])

    const ctx = useMemo<MThemeContextValue>(
        () => ({
            theme: safeTheme,
            mode,
            resolvedMode: resolved,
            setMode,
            toggleMode,
        }),
        [safeTheme, mode, resolved, setMode, toggleMode]
    )

    return (
        <ThemeContext.Provider value={ctx}>
            {scope === 'wrapper' ? (
                <div ref={ref} className={resolved === 'light' ? 'theme-light' : 'theme-dark'}>
                    {children}
                </div>
            ) : (
                children
            )}
        </ThemeContext.Provider>
    )
}

export function useMTheme(): MThemeContextValue {
    return useContext(ThemeContext)
}
