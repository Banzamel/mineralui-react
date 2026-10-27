import type {ReactNode} from 'react'
import {
    MFileCodeIcon,
    MFileCsvIcon,
    MFileCssIcon,
    MFileExeIcon,
    MFileGifIcon,
    MFileHtmlIcon,
    MFileIcon,
    MFileImageIcon,
    MFileJpgIcon,
    MFileJsIcon,
    MFileJsonIcon,
    MFileMdIcon,
    MFileMp3Icon,
    MFileMp4Icon,
    MFileOdtIcon,
    MFilePdfIcon,
    MFilePhpIcon,
    MFilePngIcon,
    MFilePptIcon,
    MFileRarIcon,
    MFileSvgIcon,
    MFileTextIcon,
    MFileTsIcon,
    MFileTsxIcon,
    MFileTxtIcon,
    MFileWebpIcon,
    MFileXlsIcon,
    MFileXmlIcon,
    MFileZipIcon,
} from '../../icons'

// File-type glyphs and size labels shared by MFileManager and MChat attachments.
const fileTypeMap: Record<string, ReactNode> = {
    pdf: <MFilePdfIcon />,
    ts: <MFileTsIcon />,
    tsx: <MFileTsxIcon />,
    js: <MFileJsIcon />,
    jsx: <MFileCodeIcon />,
    css: <MFileCssIcon />,
    scss: <MFileCssIcon />,
    html: <MFileHtmlIcon />,
    json: <MFileJsonIcon />,
    md: <MFileMdIcon />,
    txt: <MFileTxtIcon />,
    csv: <MFileCsvIcon />,
    zip: <MFileZipIcon />,
    rar: <MFileRarIcon />,
    svg: <MFileSvgIcon />,
    png: <MFilePngIcon />,
    jpg: <MFileJpgIcon />,
    jpeg: <MFileImageIcon />,
    gif: <MFileGifIcon />,
    webp: <MFileWebpIcon />,
    php: <MFilePhpIcon />,
    xml: <MFileXmlIcon />,
    xls: <MFileXlsIcon />,
    ppt: <MFilePptIcon />,
    odt: <MFileOdtIcon />,
    exe: <MFileExeIcon />,
    mp3: <MFileMp3Icon />,
    mp4: <MFileMp4Icon />,
}

export function getFileExtension(label: string): string | null {
    const dot = label.lastIndexOf('.')
    if (dot < 1) return null
    return label.slice(dot + 1).toLowerCase()
}

export function getFileIcon(label: string): ReactNode {
    const ext = getFileExtension(label)
    if (!ext) return <MFileIcon />

    return fileTypeMap[ext] ?? <MFileTextIcon />
}

export function formatBytes(value?: number) {
    if (!value || value < 1) return null

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let current = value
    let index = 0

    while (current >= 1024 && index < units.length - 1) {
        current /= 1024
        index += 1
    }

    const digits = current >= 100 || index === 0 ? 0 : 1
    return `${current.toFixed(digits)} ${units[index]}`
}
