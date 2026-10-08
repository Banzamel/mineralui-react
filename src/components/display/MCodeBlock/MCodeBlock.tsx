import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import type {MCodeBlockProps} from './MCodeBlock.types'
import {MCard, MCardBody, MCardHeader} from '../../cards'
import {MButton} from '../../controls'
import {MBadge} from '../../feedback'
import {MInline} from '../../layout'
import {MText} from '../../typography'
import {MCopyIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import './MCodeBlock.css'
import type {HLJSApi, LanguageFn} from 'highlight.js'
import {useMCodeBlockTexts} from '../../../i18n/frameworkTexts'

// Layout effect in the browser (no flash of the full code before typing starts), plain effect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function prefersReducedMotion(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
}

const languageMap: Record<string, string> = {
    c: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    arduino: 'arduino',
    ino: 'arduino',
    ts: 'typescript',
    typescript: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    javascript: 'javascript',
    jsx: 'jsx',
    json: 'json',
    css: 'css',
    html: 'html',
    markup: 'html',
    bash: 'bash',
    shell: 'bash',
    shellscript: 'bash',
    php: 'php',
}

const languageLoaders: Record<string, () => Promise<{default: LanguageFn}>> = {
    xml: () => import('highlight.js/lib/languages/xml'),
    css: () => import('highlight.js/lib/languages/css'),
    javascript: () => import('highlight.js/lib/languages/javascript'),
    typescript: () => import('highlight.js/lib/languages/typescript'),
    json: () => import('highlight.js/lib/languages/json'),
    bash: () => import('highlight.js/lib/languages/bash'),
    c: () => import('highlight.js/lib/languages/c'),
    cpp: () => import('highlight.js/lib/languages/cpp'),
    arduino: () => import('highlight.js/lib/languages/arduino'),
    php: () => import('highlight.js/lib/languages/php'),
}

let highlightJsPromise: Promise<HLJSApi> | null = null
const codeBlockTypingSpeed = 42
const codeBlockTypingStartDelay = 200

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function resolveLanguage(language: string): string {
    return languageMap[language] ?? language
}

async function getHighlightJs(): Promise<HLJSApi> {
    if (!highlightJsPromise) {
        highlightJsPromise = (async () => {
            const highlightJsCore = (await import('highlight.js/lib/core')).default
            const highlightJs = highlightJsCore.newInstance()

            for (const [language, loadLanguage] of Object.entries(languageLoaders)) {
                const definition = await loadLanguage()
                highlightJs.registerLanguage(language, definition.default)
            }

            highlightJs.registerAliases(['shell', 'shellscript'], {languageName: 'bash'})
            highlightJs.registerAliases('markup', {languageName: 'xml'})

            return highlightJs
        })()
    }

    return highlightJsPromise
}

// Render a syntax-highlighted code block with optional card header and copy action.
export function MCodeBlock({
    code,
    language = 'tsx',
    title,
    showHeader = true,
    showLanguage = true,
    showCopyButton = true,
    copyLabel: copyLabelProp,
    copiedLabel: copiedLabelProp,
    maxHeight,
    stretch = false,
    animated = false,
    lineNumbers = false,
    className,
    ...rest
}: MCodeBlockProps) {
    const texts = useMCodeBlockTexts()
    const copyLabel = copyLabelProp ?? texts.copy
    const copiedLabel = copiedLabelProp ?? texts.copied
    const normalizedLanguage = useMemo(() => resolveLanguage(language.trim().toLowerCase()), [language])
    // The server (and the first client render) always gets the full code; typing starts in the browser.
    const [visibleLength, setVisibleLength] = useState(() => code.length)
    const [typing, setTyping] = useState(false)
    const renderedCode = typing ? code.slice(0, visibleLength) : code
    const [highlightedCode, setHighlightedCode] = useState(() => escapeHtml(renderedCode))
    const [copied, setCopied] = useState(false)
    const copyTimeoutRef = useRef<number | null>(null)
    const typingTimeoutRef = useRef<number | null>(null)
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const canCopy = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function'
    const hasHeader = showHeader && (Boolean(title) || showLanguage || showCopyButton)
    const lineCount = useMemo(() => Math.max(1, renderedCode.split('\n').length), [renderedCode])

    useIsomorphicLayoutEffect(() => {
        if (typingTimeoutRef.current !== null) {
            window.clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = null
        }

        // Reduced motion shows the finished code straight away.
        const shouldType = animated && !prefersReducedMotion()
        setTyping(shouldType)
        setVisibleLength(shouldType ? 0 : code.length)
        if (shouldType) {
            setHighlightedCode('')
        }
    }, [animated, code])

    useEffect(() => {
        if (!typing || code.length === 0) {
            return
        }

        if (visibleLength < code.length) {
            typingTimeoutRef.current = window.setTimeout(
                () => {
                    setVisibleLength((current) => Math.min(current + 1, code.length))
                    typingTimeoutRef.current = null
                },
                visibleLength === 0 ? codeBlockTypingStartDelay : codeBlockTypingSpeed
            )
        }

        return () => {
            if (typingTimeoutRef.current !== null) {
                window.clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = null
            }
        }
    }, [typing, code.length, visibleLength])

    useEffect(() => {
        let active = true

        async function highlightCode() {
            try {
                const highlightJs = await getHighlightJs()
                const languageDefinition = highlightJs.getLanguage(normalizedLanguage)
                const html = languageDefinition
                    ? highlightJs.highlight(renderedCode, {
                          language: normalizedLanguage,
                          ignoreIllegals: true,
                      }).value
                    : escapeHtml(renderedCode)

                if (active) {
                    setHighlightedCode(html)
                }
            } catch {
                if (active) {
                    setHighlightedCode(escapeHtml(renderedCode))
                }
            }
        }

        void highlightCode()

        return () => {
            active = false
        }
    }, [normalizedLanguage, renderedCode])

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current)
            }

            if (typingTimeoutRef.current !== null) {
                window.clearTimeout(typingTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!typing || !scrollRef.current) {
            return
        }

        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [typing, visibleLength])

    async function handleCopy() {
        if (!canCopy) {
            return
        }

        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)

            if (copyTimeoutRef.current !== null) {
                window.clearTimeout(copyTimeoutRef.current)
            }

            copyTimeoutRef.current = window.setTimeout(() => {
                setCopied(false)
                copyTimeoutRef.current = null
            }, 1200)
        } catch {
            setCopied(false)
        }
    }

    return (
        <MCard className={cn('code-block-card', className)} {...rest} padded={false} stretch={stretch}>
            {hasHeader && (
                <MCardHeader className="code-block-header">
                    <MInline
                        className="code-block-header-layout"
                        align="center"
                        justify="between"
                        wrap="nowrap"
                        px="lg"
                        py="md"
                    >
                        <MInline className="code-block-header-meta" align="center" wrap="wrap">
                            {title && (
                                <MText as="span" className="code-block-title" size="sm" weight="semibold">
                                    {title}
                                </MText>
                            )}
                            {showLanguage && language && (
                                <MBadge color="info" size="sm">
                                    {language}
                                </MBadge>
                            )}
                        </MInline>
                        {showCopyButton && (
                            <MButton
                                variant="ghost"
                                size="sm"
                                color="neutral"
                                startIcon={<MCopyIcon size="sm" aria-hidden="true" />}
                                onClick={handleCopy}
                                disabled={!canCopy}
                            >
                                {copied ? copiedLabel : copyLabel}
                            </MButton>
                        )}
                        {showCopyButton && (
                            <span className="code-block-status" role="status">
                                {copied ? copiedLabel : ''}
                            </span>
                        )}
                    </MInline>
                </MCardHeader>
            )}

            <MCardBody className="code-block-body">
                {/* Scrollable region: focusable so keyboard users can scroll it (WCAG 2.1.1). */}
                <div
                    ref={scrollRef}
                    className="code-block-scroll"
                    style={maxHeight ? {maxHeight, overflowY: 'auto'} : undefined}
                    role="region"
                    tabIndex={0}
                    aria-label={typeof title === 'string' && title.trim() !== '' ? title : texts.label}
                >
                    <pre
                        className={cn(
                            'code-block-pre',
                            lineNumbers && 'with-line-numbers',
                            `language-${normalizedLanguage}`
                        )}
                    >
                        {lineNumbers && (
                            <span className="code-block-line-numbers" aria-hidden="true">
                                {Array.from({length: lineCount}, (_, index) => (
                                    <span key={index + 1} className="code-block-line-number">
                                        {index + 1}
                                    </span>
                                ))}
                            </span>
                        )}
                        <span className="code-block-code-shell">
                            <code
                                className={cn('code-block-code', 'hljs', `language-${normalizedLanguage}`)}
                                dangerouslySetInnerHTML={{__html: highlightedCode}}
                            />
                        </span>
                    </pre>
                </div>
            </MCardBody>
        </MCard>
    )
}
