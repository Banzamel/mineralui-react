import {useCallback, useEffect, useId, useRef, useState} from 'react'
import type * as React from 'react'
import type {MColorPickerProps} from './MColorPicker.types'
import {cn} from '../../../utils/cn'
import './MColorPicker.css'
import {formatMText, useMColorPickerTexts} from '../../../i18n/frameworkTexts'
import {getRadioGroupTarget, isRtlElement} from '../../../utils/radioGroupKeys'

function hsvToHex(h: number, s: number, v: number): string {
    const f = (n: number) => {
        const k = (n + h / 60) % 6
        return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
    }
    const r = Math.round(f(5) * 255)
    const g = Math.round(f(3) * 255)
    const b = Math.round(f(1) * 255)
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function hexToHsv(hex: string): [number, number, number] {
    const m = hex.replace('#', '').match(/.{2}/g)
    if (!m) return [0, 0, 1]
    const [r, g, b] = m.map((c) => parseInt(c, 16) / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    if (d !== 0) {
        if (max === r) h = ((g - b) / d + 6) % 6
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h *= 60
    }
    const s = max === 0 ? 0 : d / max
    return [h, s, max]
}

function hexToRgb(hex: string): string {
    const m = hex.replace('#', '').match(/.{2}/g)
    if (!m) return 'rgb(0, 0, 0)'
    const [r, g, b] = m.map((c) => parseInt(c, 16))
    return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex: string): string {
    const m = hex.replace('#', '').match(/.{2}/g)
    if (!m) return 'hsl(0, 0%, 0%)'
    const [r, g, b] = m.map((c) => parseInt(c, 16) / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0
    let s = 0
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = ((g - b) / d + 6) % 6
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h *= 60
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function formatOutput(hex: string, format: string): string {
    if (format === 'rgb') return hexToRgb(hex)
    if (format === 'hsl') return hexToHsl(hex)
    return hex
}

function toHexByte(value: number): string {
    return Math.round(Math.max(0, Math.min(255, value)))
        .toString(16)
        .padStart(2, '0')
}

function hslToHex(h: number, s: number, l: number): string {
    const hue = ((h % 360) + 360) % 360
    const sat = Math.max(0, Math.min(1, s))
    const light = Math.max(0, Math.min(1, l))
    const a = sat * Math.min(light, 1 - light)
    const f = (n: number) => {
        const k = (n + hue / 30) % 12
        return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    }
    return `#${toHexByte(f(0) * 255)}${toHexByte(f(8) * 255)}${toHexByte(f(4) * 255)}`
}

// Parse #rgb, #rrggbb, rgb() and hsl() into #rrggbb; null when the text is not a colour (yet).
function parseColor(value: string): string | null {
    const text = value.trim().toLowerCase()
    if (!text) return null

    const hexMatch = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)
    if (hexMatch) {
        const digits = hexMatch[1]
        return digits.length === 3
            ? `#${digits
                  .split('')
                  .map((c) => c + c)
                  .join('')}`
            : `#${digits}`
    }

    const rgbMatch = text.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/)
    if (rgbMatch) {
        const channels = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number)
        if (channels.some((c) => c > 255)) return null
        return `#${channels.map(toHexByte).join('')}`
    }

    const hslMatch = text.match(/^hsla?\(\s*(-?[\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+\s*)?\)$/)
    if (hslMatch) {
        const [h, s, l] = [hslMatch[1], hslMatch[2], hslMatch[3]].map(Number)
        if ([h, s, l].some((n) => !Number.isFinite(n)) || s > 100 || l > 100) return null
        return hslToHex(h, s / 100, l / 100)
    }

    return null
}

function normalizeToHex(value: string): string {
    return parseColor(value) ?? '#000000'
}

const DEFAULT_SWATCHES = [
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#000000',
    '#ffffff',
]

export function MColorPicker({
    value,
    onChange,
    swatches = DEFAULT_SWATCHES,
    format = 'hex',
    size = 'md',
    label,
    disabled = false,
    className,
    ...rest
}: MColorPickerProps) {
    const texts = useMColorPickerTexts()
    const inputId = useId()
    const hex = normalizeToHex(value ?? '#3b82f6')
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(hex))
    const [inputValue, setInputValue] = useState(formatOutput(hex, format))
    const areaRef = useRef<HTMLDivElement>(null)
    const hueRef = useRef<HTMLDivElement>(null)
    const swatchRefs = useRef<(HTMLButtonElement | null)[]>([])
    const dragging = useRef<'area' | 'hue' | null>(null)
    // Value this picker last sent through onChange, so its echo does not reset local state.
    const lastEmittedRef = useRef<string | null>(null)
    const formatRef = useRef(format)

    useEffect(() => {
        const formatChanged = formatRef.current !== format
        formatRef.current = format
        const newHex = normalizeToHex(value ?? '#3b82f6')
        // Black / greys carry no hue (s = 0 or v = 0): keep the current HSV when it already
        // produces this colour, otherwise the hue snaps back to 0 mid-drag.
        setHsv((prev) => (hsvToHex(prev[0], prev[1], prev[2]) === newHex ? prev : hexToHsv(newHex)))
        if (formatChanged || value !== lastEmittedRef.current) {
            setInputValue(formatOutput(newHex, format))
        }
    }, [value, format])

    const emit = useCallback(
        (h: number, s: number, v: number) => {
            const newHex = hsvToHex(h, s, v)
            const output = formatOutput(newHex, format)
            setHsv([h, s, v])
            setInputValue(output)
            lastEmittedRef.current = output
            onChange?.(output)
        },
        [onChange, format]
    )

    function handleAreaPointer(e: React.PointerEvent | PointerEvent) {
        const rect = areaRef.current?.getBoundingClientRect()
        if (!rect) return
        const s = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const v = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height))
        emit(hsv[0], s, v)
    }

    function handleHuePointer(e: React.PointerEvent | PointerEvent) {
        const rect = hueRef.current?.getBoundingClientRect()
        if (!rect) return
        const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360))
        emit(h, hsv[1], hsv[2])
    }

    useEffect(() => {
        function onMove(e: PointerEvent) {
            if (dragging.current === 'area') handleAreaPointer(e)
            else if (dragging.current === 'hue') handleHuePointer(e)
        }
        function onUp() {
            dragging.current = null
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        return () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
    })

    function handleInputChange(val: string) {
        setInputValue(val)
        const parsed = parseColor(val)
        // Incomplete text while typing is kept as-is and not emitted.
        if (parsed) {
            const output = formatOutput(parsed, format)
            setHsv((prev) => (hsvToHex(prev[0], prev[1], prev[2]) === parsed ? prev : hexToHsv(parsed)))
            lastEmittedRef.current = output
            onChange?.(output)
        }
    }

    const currentHex = hsvToHex(hsv[0], hsv[1], hsv[2])

    // Keyboard for the saturation / brightness area (2D slider): Left / Right change saturation,
    // Up / Down brightness, PageUp / PageDown brightness by 10 %, Home / End saturation 0 / 100 %.
    // Shift multiplies the arrow step by 10.
    function handleAreaKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (disabled) return
        const unit = e.shiftKey ? 0.1 : 0.01
        let s = hsv[1]
        let v = hsv[2]
        switch (e.key) {
            case 'ArrowRight':
                s += unit
                break
            case 'ArrowLeft':
                s -= unit
                break
            case 'ArrowUp':
                v += unit
                break
            case 'ArrowDown':
                v -= unit
                break
            case 'PageUp':
                v += 0.1
                break
            case 'PageDown':
                v -= 0.1
                break
            case 'Home':
                s = 0
                break
            case 'End':
                s = 1
                break
            default:
                return
        }
        e.preventDefault()
        const round = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 100) / 100
        emit(hsv[0], round(s), round(v))
    }

    // APG slider keys for the hue: arrows 1 degree, Shift + arrows / PageUp / PageDown 10, Home / End.
    function handleHueKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (disabled) return
        const unit = e.shiftKey ? 10 : 1
        let h = Math.round(hsv[0])
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                h += unit
                break
            case 'ArrowLeft':
            case 'ArrowDown':
                h -= unit
                break
            case 'PageUp':
                h += 10
                break
            case 'PageDown':
                h -= 10
                break
            case 'Home':
                h = 0
                break
            case 'End':
                h = 360
                break
            default:
                return
        }
        e.preventDefault()
        emit(Math.max(0, Math.min(360, h)), hsv[1], hsv[2])
    }

    const selectedSwatch = swatches.findIndex((swatch) => currentHex.toLowerCase() === swatch.toLowerCase())
    const tabbableSwatch = selectedSwatch >= 0 ? selectedSwatch : 0

    function selectSwatch(swatch: string) {
        if (disabled) return
        const [h, s, v] = hexToHsv(swatch)
        emit(h, s, v)
    }

    // APG radio group: arrows move focus and select, wrapping; Home / End jump to the ends.
    function handleSwatchesKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (disabled || e.altKey || e.ctrlKey || e.metaKey) return
        const current = swatchRefs.current.findIndex((el) => el === e.target)
        if (current < 0) return
        const target = getRadioGroupTarget(e.key, current, swatches.length, isRtlElement(e.currentTarget))
        if (target === null) return
        e.preventDefault()
        swatchRefs.current[target]?.focus()
        selectSwatch(swatches[target])
    }

    const saturationPercent = Math.round(hsv[1] * 100)
    const brightnessPercent = Math.round(hsv[2] * 100)
    const hueDegrees = Math.round(hsv[0])

    return (
        <div className={cn('color-picker', size, disabled && 'disabled', className)} {...rest}>
            {label && (
                <label className="label" htmlFor={inputId}>
                    {label}
                </label>
            )}

            <div
                ref={areaRef}
                className="area"
                style={{background: `hsl(${hsv[0]}, 100%, 50%)`}}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={texts.area}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={saturationPercent}
                aria-valuetext={formatMText(texts.areaValue, {
                    saturation: saturationPercent,
                    brightness: brightnessPercent,
                })}
                aria-disabled={disabled || undefined}
                onKeyDown={handleAreaKeyDown}
                onPointerDown={(e) => {
                    if (disabled) return
                    // Pointer presses focus the area so the keyboard continues from there.
                    e.currentTarget.focus({preventScroll: true})
                    dragging.current = 'area'
                    handleAreaPointer(e)
                }}
            >
                <div className="white" />
                <div className="black" />
                <div
                    className="cursor"
                    style={{
                        left: `${hsv[1] * 100}%`,
                        top: `${(1 - hsv[2]) * 100}%`,
                        background: currentHex,
                    }}
                />
            </div>

            <div
                ref={hueRef}
                className="hue"
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={texts.hue}
                aria-valuemin={0}
                aria-valuemax={360}
                aria-valuenow={hueDegrees}
                aria-valuetext={formatMText(texts.hueValue, {value: hueDegrees})}
                aria-orientation="horizontal"
                aria-disabled={disabled || undefined}
                onKeyDown={handleHueKeyDown}
                onPointerDown={(e) => {
                    if (disabled) return
                    e.currentTarget.focus({preventScroll: true})
                    dragging.current = 'hue'
                    handleHuePointer(e)
                }}
            >
                <div className="hue-thumb" style={{left: `${(hsv[0] / 360) * 100}%`}} />
            </div>

            <div className="controls">
                <div className="preview" style={{background: currentHex}} />
                <input
                    id={inputId}
                    type="text"
                    aria-label={label ? undefined : texts.input}
                    className="input"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    disabled={disabled}
                />
            </div>

            {swatches.length > 0 && (
                <div
                    className="swatches"
                    role="radiogroup"
                    aria-label={texts.swatches}
                    aria-disabled={disabled || undefined}
                    onKeyDown={handleSwatchesKeyDown}
                >
                    {swatches.map((swatch, index) => (
                        <button
                            key={swatch}
                            ref={(el) => {
                                swatchRefs.current[index] = el
                            }}
                            type="button"
                            role="radio"
                            className={cn('swatch', index === selectedSwatch && 'active')}
                            style={{background: swatch}}
                            aria-label={formatMText(texts.swatch, {color: swatch})}
                            aria-checked={index === selectedSwatch}
                            tabIndex={!disabled && index === tabbableSwatch ? 0 : -1}
                            onClick={() => selectSwatch(swatch)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
