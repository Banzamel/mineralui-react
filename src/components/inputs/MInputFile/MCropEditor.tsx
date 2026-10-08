import {useState, useRef, useCallback, useEffect, useId} from 'react'
import type * as React from 'react'
import type {MInputFileCropShape} from './MInputFile.types'
import {MButton, MSlider} from '../../controls'
import {MZoomInIcon} from '../../../icons'
import './MCropEditor.css'
import {useMInputFileTexts} from '../../../i18n/frameworkTexts'

// Zoom range shared by the mouse wheel and the slider.
const MIN_SCALE = 0.1
const MAX_SCALE = 5
// Keyboard pan distance in px (Shift multiplies it) and zoom factor per +/- press.
const PAN_STEP = 10
const PAN_STEP_FAST = 50
const KEY_ZOOM_FACTOR = 1.1
const CONTAINER_SIZE = 280

interface MCropEditorProps {
    file: File
    shape: MInputFileCropShape
    outputSize: number
    quality: number
    onCrop: (cropped: File) => void
    onCancel: () => void
}

export function MCropEditor({file, shape, outputSize, quality, onCrop, onCancel}: MCropEditorProps) {
    const texts = useMInputFileTexts()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)
    const [imgSrc, setImgSrc] = useState('')
    const [scale, setScale] = useState(1)
    const [offset, setOffset] = useState({x: 0, y: 0})
    const [dragging, setDragging] = useState(false)
    const dragStart = useRef({x: 0, y: 0, ox: 0, oy: 0})
    const baseId = useId()
    const hintId = `${baseId}-hint`
    const keyboardHintId = `${baseId}-keys`

    useEffect(() => {
        const url = URL.createObjectURL(file)
        setImgSrc(url)
        return () => URL.revokeObjectURL(url)
    }, [file])

    useEffect(() => {
        if (!imgSrc) return
        const img = new Image()
        img.onload = () => {
            imgRef.current = img
            const minDim = Math.min(img.width, img.height)
            const containerSize = CONTAINER_SIZE
            const initialScale = containerSize / minDim
            setScale(initialScale)
            setOffset({
                x: (containerSize - img.width * initialScale) / 2,
                y: (containerSize - img.height * initialScale) / 2,
            })
        }
        img.src = imgSrc
    }, [imgSrc])

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault()
            setDragging(true)
            dragStart.current = {x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y}
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        },
        [offset]
    )

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragging) return
            setOffset({
                x: dragStart.current.ox + (e.clientX - dragStart.current.x),
                y: dragStart.current.oy + (e.clientY - dragStart.current.y),
            })
        },
        [dragging]
    )

    const handlePointerUp = useCallback(() => {
        setDragging(false)
    }, [])

    // Zoom around the viewport centre so the visible middle of the image stays put.
    const zoomTo = useCallback(
        (requested: number) => {
            const newScale = Math.max(MIN_SCALE, Math.min(requested, MAX_SCALE))
            const cx = CONTAINER_SIZE / 2
            const cy = CONTAINER_SIZE / 2

            setOffset({
                x: cx - (cx - offset.x) * (newScale / scale),
                y: cy - (cy - offset.y) * (newScale / scale),
            })
            setScale(newScale)
        },
        [scale, offset]
    )

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault()
            zoomTo(scale * (e.deltaY > 0 ? 0.95 : 1.05))
        },
        [scale, zoomTo]
    )

    const handleSliderChange = zoomTo

    // Keyboard alternative to dragging and the wheel: arrows pan, + / - zoom.
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.altKey || e.ctrlKey || e.metaKey) return
            const distance = e.shiftKey ? PAN_STEP_FAST : PAN_STEP
            const pan: Record<string, [number, number]> = {
                ArrowLeft: [-distance, 0],
                ArrowRight: [distance, 0],
                ArrowUp: [0, -distance],
                ArrowDown: [0, distance],
            }

            if (pan[e.key]) {
                e.preventDefault()
                const [dx, dy] = pan[e.key]
                setOffset((prev) => ({x: prev.x + dx, y: prev.y + dy}))
            } else if (e.key === '+' || e.key === '=' || e.key === 'Add') {
                e.preventDefault()
                zoomTo(scale * KEY_ZOOM_FACTOR)
            } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
                e.preventDefault()
                zoomTo(scale / KEY_ZOOM_FACTOR)
            }
        },
        [scale, zoomTo]
    )

    const exportCrop = useCallback(() => {
        const img = imgRef.current
        const canvas = canvasRef.current
        if (!img || !canvas) return

        const containerSize = CONTAINER_SIZE
        canvas.width = outputSize
        canvas.height = outputSize
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const ratio = outputSize / containerSize

        if (shape === 'circle') {
            ctx.beginPath()
            ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
        }

        ctx.drawImage(img, offset.x * ratio, offset.y * ratio, img.width * scale * ratio, img.height * scale * ratio)

        canvas.toBlob(
            (blob) => {
                if (!blob) return
                const ext = file.name.replace(/.*\./, '')
                const name = file.name.replace(/\.[^.]+$/, '') + '_cropped.' + ext
                const cropped = new File([blob], name, {type: blob.type})
                onCrop(cropped)
            },
            file.type.startsWith('image/png') ? 'image/png' : 'image/jpeg',
            quality
        )
    }, [file, offset, scale, outputSize, quality, shape, onCrop])

    // Convert scale to 0-100 range for MSlider and back
    const sliderValue = Math.round(((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100)

    const handleSliderValueChange = useCallback(
        (value: number) => {
            const newScale = MIN_SCALE + (value / 100) * (MAX_SCALE - MIN_SCALE)
            handleSliderChange(newScale)
        },
        [handleSliderChange]
    )

    const [hintBefore, ...hintRest] = texts.cropHint.split('{apply}')

    return (
        <div className="crop editor">
            <div id={hintId} className="crop hint" role="note">
                {hintBefore}
                {hintRest.length > 0 && (
                    <>
                        <strong>{texts.cropApply}</strong>
                        {hintRest.join('{apply}')}
                    </>
                )}
            </div>
            <div
                ref={containerRef}
                className={`crop viewport ${shape}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                role="application"
                tabIndex={0}
                aria-label={texts.cropArea}
                aria-describedby={`${keyboardHintId} ${hintId}`}
            >
                <span id={keyboardHintId} className="crop sr-only">
                    {texts.cropKeyboardHint}
                </span>
                {imgSrc && (
                    <img
                        src={imgSrc}
                        alt=""
                        className="crop image"
                        draggable={false}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                            transformOrigin: '0 0',
                        }}
                    />
                )}
                <div className={`crop overlay ${shape}`} />
            </div>

            <div className="crop zoom">
                <MZoomInIcon className="crop zoom icon" aria-hidden="true" />
                <MSlider
                    min={0}
                    max={100}
                    step={1}
                    value={sliderValue}
                    onChange={handleSliderValueChange}
                    color="primary"
                    className="crop zoom slider"
                    aria-label={texts.cropZoom}
                />
            </div>

            <div className="crop actions">
                <MButton variant="ghost" size="sm" color="neutral" onClick={onCancel}>
                    {texts.cropCancel}
                </MButton>
                <MButton variant="filled" size="sm" color="primary" onClick={exportCrop}>
                    {texts.cropApply}
                </MButton>
            </div>

            <canvas ref={canvasRef} style={{display: 'none'}} />
        </div>
    )
}
