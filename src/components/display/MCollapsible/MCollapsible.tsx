import {useId, useState} from 'react'
import {MButton} from '../../controls'
import {MStack} from '../../layout'
import {cn} from '../../../utils/cn'
import type {MCollapsibleProps} from './MCollapsible.types'
import {MChevronDownIcon} from '../../../icons'
import './MCollapsible.css'

// MToggle a section of content with a built-in trigger and disclosure state.
export function MCollapsible({
    title,
    defaultOpen = false,
    open: controlledOpen,
    onToggle,
    color = 'primary',
    className,
    children,
    ...rest
}: MCollapsibleProps) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen)
    const open = controlledOpen ?? internalOpen
    const panelId = useId()

    const handleToggle = () => {
        const nextOpen = !open

        if (controlledOpen === undefined) {
            setInternalOpen(nextOpen)
        }

        onToggle?.(nextOpen)
    }

    const chevronIcon = (
        <span className={cn('chevron', open && 'open')} aria-hidden="true">
            <MChevronDownIcon />
        </span>
    )

    return (
        <div className={cn('collapsible', className)} {...rest}>
            <MButton
                variant="ghost"
                color={color}
                className="trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={handleToggle}
                endIcon={chevronIcon}
            >
                {title}
            </MButton>
            {/* A closed panel is inert: its content leaves the Tab order, not just the a11y tree. */}
            <div id={panelId} className={cn('content-wrap', open && 'open')} aria-hidden={!open} inert={!open}>
                {/* The clip row carries no padding, so the collapsed 0fr track really is 0px tall. */}
                <div className="collapsible-clip">
                    <MStack className="content">{children}</MStack>
                </div>
            </div>
        </div>
    )
}
