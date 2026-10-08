import {useCallback, useId, useRef} from 'react'
import type {KeyboardEvent as ReactKeyboardEvent} from 'react'
import type {MPopconfirmProps} from './MPopconfirm.types'
import {MPopover} from '../../primitives'
import {MButton} from '../../controls'
import {cn} from '../../../utils/cn'
import {getTabbable} from '../../../utils/useModalLayer'
import {useMPopconfirmTexts} from '../../../i18n/frameworkTexts'
import './MPopconfirm.css'

export function MPopconfirm({
    title,
    description,
    onConfirm,
    onCancel,
    confirmText: confirmTextProp,
    cancelText: cancelTextProp,
    color = 'warning',
    icon,
    placement = 'top-start',
    open,
    onOpenChange,
    anchorRef,
    className,
}: MPopconfirmProps) {
    const texts = useMPopconfirmTexts()
    const confirmText = confirmTextProp ?? texts.confirm
    const cancelText = cancelTextProp ?? texts.cancel
    const baseId = useId()
    const titleId = `${baseId}-title`
    const descriptionId = `${baseId}-description`
    // APG alertdialog: focus starts on the least destructive action.
    const cancelRef = useRef<HTMLElement>(null)

    const handleCancel = useCallback(() => {
        onOpenChange(false)
        onCancel?.()
    }, [onOpenChange, onCancel])

    const handleConfirm = useCallback(() => {
        onOpenChange(false)
        onConfirm()
    }, [onOpenChange, onConfirm])

    // Keep Tab / Shift+Tab cycling inside the confirmation while it is open.
    const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Tab') return
        const layer = e.currentTarget.closest<HTMLElement>('.popconfirm')
        if (!layer) return
        const focusable = getTabbable(layer)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || active === layer)) {
            e.preventDefault()
            last.focus()
        } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
        }
    }, [])

    return (
        <MPopover
            open={open}
            anchorRef={anchorRef}
            onClose={handleCancel}
            placement={placement}
            className={cn('popconfirm', `color-${color}`, className)}
            role="alertdialog"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            initialFocus={cancelRef}
        >
            <div className="body" onKeyDown={handleKeyDown}>
                {icon && <div className="icon">{icon}</div>}
                <div className="content">
                    <div id={titleId} className="title">
                        {title}
                    </div>
                    {description && (
                        <div id={descriptionId} className="description">
                            {description}
                        </div>
                    )}
                </div>
            </div>
            <div className="actions" onKeyDown={handleKeyDown}>
                <MButton ref={cancelRef} variant="ghost" size="sm" color="neutral" onClick={handleCancel}>
                    {cancelText}
                </MButton>
                <MButton variant="ghost" size="sm" color={color} onClick={handleConfirm}>
                    {confirmText}
                </MButton>
            </div>
        </MPopover>
    )
}
