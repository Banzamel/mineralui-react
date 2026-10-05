import {useState, useCallback, useRef, useMemo, useEffect, forwardRef} from 'react'
import type * as React from 'react'
import type {MInputFileProps, MInputFileCropOptions} from './MInputFile.types'
import {MCropEditor} from './MCropEditor'
import {cn} from '../../../utils/cn'
import {
    MCloseIcon,
    MFileArchiveIcon,
    MFileCodeIcon,
    MFileDocsIcon,
    MFileExeIcon,
    MFileIcon,
    MFileImageIcon,
    MFileJsonIcon,
    MFileMdIcon,
    MFileMp3Icon,
    MFileMp4Icon,
    MFileOdtIcon,
    MFilePdfIcon,
    MFileTextIcon,
    MFileXlsIcon,
    MFileZipIcon,
    MUploadIcon,
} from '../../../icons'
import './MInputFile.css'
import {useMCommonTexts, formatMText} from '../../../i18n/frameworkTexts'

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExtension(name: string): string {
    const dot = name.lastIndexOf('.')
    return dot >= 0 ? name.slice(dot + 1).toUpperCase() : ''
}

function isImage(file: File): boolean {
    return file.type.startsWith('image/')
}

function FileTypeIcon({ext}: {ext: string}) {
    const name = ext.toLowerCase()

    if (name === 'pdf') return <MFilePdfIcon className="file type icon" aria-hidden="true" />
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(name)) {
        return <MFileImageIcon className="file type icon" aria-hidden="true" />
    }
    if (['json'].includes(name)) return <MFileJsonIcon className="file type icon" aria-hidden="true" />
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'php', 'xml'].includes(name)) {
        return <MFileCodeIcon className="file type icon" aria-hidden="true" />
    }
    if (['txt'].includes(name)) return <MFileTextIcon className="file type icon" aria-hidden="true" />
    if (['md'].includes(name)) return <MFileMdIcon className="file type icon" aria-hidden="true" />
    if (['docs', 'doc', 'docx'].includes(name)) return <MFileDocsIcon className="file type icon" aria-hidden="true" />
    if (['odt'].includes(name)) return <MFileOdtIcon className="file type icon" aria-hidden="true" />
    if (['csv', 'xls', 'xlsx'].includes(name)) return <MFileXlsIcon className="file type icon" aria-hidden="true" />
    if (['zip'].includes(name)) return <MFileZipIcon className="file type icon" aria-hidden="true" />
    if (['rar', '7z', 'tar', 'gz'].includes(name))
        return <MFileArchiveIcon className="file type icon" aria-hidden="true" />
    if (['mp3', 'wav', 'ogg'].includes(name)) return <MFileMp3Icon className="file type icon" aria-hidden="true" />
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(name)) {
        return <MFileMp4Icon className="file type icon" aria-hidden="true" />
    }
    if (['exe', 'msi', 'bat'].includes(name)) return <MFileExeIcon className="file type icon" aria-hidden="true" />

    return <MFileIcon className="file type icon" aria-hidden="true" />
}

export const MInputFile = forwardRef<HTMLDivElement, MInputFileProps>(function MInputFile(
    {
        accept,
        multiple = false,
        maxSize,
        maxFiles,
        onChange,
        label,
        helperText,
        errorText,
        error = false,
        disabled = false,
        color = 'primary',
        size = 'md',
        preview = true,
        clearable = false,
        icon,
        placeholder = 'Drop files here or click to browse',
        dropText = 'Drop files here',
        fullWidth = false,
        crop,
        onClear,
        className,
        ...rest
    },
    ref
) {
    const texts = useMCommonTexts()
    const [dragging, setDragging] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [fileError, setFileError] = useState('')
    const [cropFile, setCropFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const dragCounter = useRef(0)

    const cropOptions: MInputFileCropOptions | null = crop
        ? typeof crop === 'boolean'
            ? {shape: 'square', outputSize: 256, quality: 0.92}
            : {shape: crop.shape ?? 'square', outputSize: crop.outputSize ?? 256, quality: crop.quality ?? 0.92}
        : null

    const objectUrls = useMemo(() => {
        return files.map((f) => (isImage(f) ? URL.createObjectURL(f) : null))
    }, [files])

    useEffect(() => {
        return () => {
            objectUrls.forEach((url) => {
                if (url) URL.revokeObjectURL(url)
            })
        }
    }, [objectUrls])

    const processFiles = useCallback(
        (incoming: FileList | File[]) => {
            let accepted = Array.from(incoming)

            if (accept) {
                const patterns = accept.split(',').map((s) => s.trim().toLowerCase())
                accepted = accepted.filter((f) => {
                    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
                    const mime = f.type.toLowerCase()
                    return patterns.some(
                        (p) => p === ext || p === mime || (p.endsWith('/*') && mime.startsWith(p.slice(0, -1)))
                    )
                })
            }

            if (maxSize) {
                const oversized = accepted.filter((f) => f.size > maxSize)
                if (oversized.length) {
                    setFileError(`Max file size: ${formatSize(maxSize)}`)
                    return
                }
            }

            if (maxFiles && accepted.length > maxFiles) {
                setFileError(`Max ${maxFiles} file${maxFiles > 1 ? 's' : ''}`)
                return
            }

            setFileError('')

            if (cropOptions && accepted.length === 1 && isImage(accepted[0])) {
                setCropFile(accepted[0])
                return
            }

            setFiles(accepted)
            onChange?.(accepted)
        },
        [accept, maxSize, maxFiles, onChange, cropOptions]
    )

    const handleCropDone = useCallback(
        (cropped: File) => {
            setCropFile(null)
            setFiles([cropped])
            onChange?.([cropped])
        },
        [onChange]
    )

    const handleCropCancel = useCallback(() => {
        setCropFile(null)
    }, [])

    const handleDragEnter = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (disabled) return
            dragCounter.current++
            setDragging(true)
        },
        [disabled]
    )

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current--
        if (dragCounter.current <= 0) {
            dragCounter.current = 0
            setDragging(false)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragCounter.current = 0
            setDragging(false)
            if (disabled) return
            if (e.dataTransfer.files.length) {
                processFiles(e.dataTransfer.files)
            }
        },
        [disabled, processFiles]
    )

    const handleClick = useCallback(() => {
        if (!disabled) inputRef.current?.click()
    }, [disabled])

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files?.length) {
                processFiles(e.target.files)
            }
        },
        [processFiles]
    )

    const removeFile = useCallback(
        (index: number) => {
            const url = objectUrls[index]
            if (url) URL.revokeObjectURL(url)
            const next = files.filter((_, i) => i !== index)
            setFiles(next)
            onChange?.(next)
        },
        [files, objectUrls, onChange]
    )

    const clearFiles = useCallback(() => {
        objectUrls.forEach((url) => {
            if (url) URL.revokeObjectURL(url)
        })
        setCropFile(null)
        setFiles([])
        setFileError('')
        if (inputRef.current) {
            inputRef.current.value = ''
        }
        onChange?.([])
        onClear?.()
    }, [objectUrls, onChange, onClear])

    const displayError = errorText || fileError
    const hasError = error || !!fileError
    const resolvedColorClass = hasError ? 'color-error' : `color-${color}`

    return (
        <div
            ref={ref}
            className={cn(
                'file input',
                resolvedColorClass,
                size,
                fullWidth && 'full-width',
                disabled && 'disabled',
                className
            )}
            {...rest}
        >
            {(label || (clearable && files.length > 0 && !disabled)) && (
                <div className="file header">
                    {label && <div className="file label">{label}</div>}
                    {clearable && files.length > 0 && !disabled && (
                        <button
                            type="button"
                            className="file clear clear-btn-base"
                            onClick={clearFiles}
                            aria-label={texts.clearFiles}
                        >
                            <MCloseIcon aria-hidden="true" />
                        </button>
                    )}
                </div>
            )}

            <div
                className={cn('file dropzone', dragging && 'dragging', hasError && 'error')}
                onClick={handleClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleClick()
                    }
                }}
                aria-label={label || placeholder}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    tabIndex={-1}
                    className="file hidden"
                />

                <div className="file content">
                    {icon && <div className="file icon">{icon}</div>}
                    {!icon && <MUploadIcon className="file icon default" aria-hidden="true" />}
                    <div className="file text">{dragging ? dropText : placeholder}</div>
                    {accept && <div className="file accept">{accept}</div>}
                </div>
            </div>

            {cropFile && cropOptions && (
                <MCropEditor
                    file={cropFile}
                    shape={cropOptions.shape!}
                    outputSize={cropOptions.outputSize!}
                    quality={cropOptions.quality!}
                    onCrop={handleCropDone}
                    onCancel={handleCropCancel}
                />
            )}

            {helperText && !hasError && <div className="file helper">{helperText}</div>}
            {hasError && displayError && <div className="file error">{displayError}</div>}

            {preview && files.length > 0 && !cropFile && (
                <div className="file preview">
                    {files.map((file, i) => (
                        <div key={`${file.name}-${i}`} className="file item">
                            <div className="file thumb">
                                {objectUrls[i] ? (
                                    <img src={objectUrls[i]!} alt={file.name} className="file image" />
                                ) : (
                                    <FileTypeIcon ext={fileExtension(file.name)} />
                                )}
                            </div>
                            <div className="file info">
                                <span className="file name">{file.name}</span>
                                <span className="file size">{formatSize(file.size)}</span>
                            </div>
                            <button
                                type="button"
                                className="file remove"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(i)
                                }}
                                aria-label={formatMText(texts.removeItem, {name: file.name})}
                            >
                                <MCloseIcon aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
})
