import {forwardRef, useId, useState} from 'react'
import type {CSSProperties} from 'react'
import {MButton} from '../../controls'
import {MChevronLeftIcon, MChevronRightIcon} from '../../../icons'
import {useMFloatingPanelTexts} from '../../../i18n/frameworkTexts'
import {cn} from '../../../utils/cn'
import type {MFloatingPanelProps} from './MFloatingPanel.types'
import './MFloatingPanel.css'

function toLength(value: number | string): string {
    return typeof value === 'number' ? `${value}px` : value
}

// Non-modal panel floating over a scene (map, canvas, editor): no focus trap, no scroll lock.
export const MFloatingPanel = forwardRef<HTMLElement, MFloatingPanelProps>(function MFloatingPanel(
    {
        side = 'left',
        width = 320,
        offset = 16,
        position = 'absolute',
        backdropBlur = true,
        collapsible = false,
        collapsed: collapsedProp,
        defaultCollapsed = false,
        onCollapsedChange,
        title,
        actions,
        className,
        style,
        children,
        'aria-label': ariaLabel,
        ...rest
    },
    ref
) {
    const texts = useMFloatingPanelTexts()
    const contentId = useId()
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
    const collapsed = collapsible && (collapsedProp ?? internalCollapsed)

    const toggle = () => {
        const next = !collapsed
        if (collapsedProp === undefined) setInternalCollapsed(next)
        onCollapsedChange?.(next)
    }

    const blur = backdropBlur === true ? 12 : backdropBlur === false ? 0 : backdropBlur
    const panelStyle = {
        '--floating-panel-width': toLength(width),
        '--floating-panel-offset': toLength(offset),
        '--floating-panel-blur': `${blur}px`,
        ...style,
    } as CSSProperties

    // The chevron points to where the panel goes: towards its edge to hide, away to show.
    const towardsEdge = side === 'left' ? <MChevronLeftIcon /> : <MChevronRightIcon />
    const awayFromEdge = side === 'left' ? <MChevronRightIcon /> : <MChevronLeftIcon />
    const hasHeader = title != null || actions != null || collapsible

    return (
        <section
            ref={ref}
            className={cn('floating-panel', side, position, blur > 0 && 'blurred', collapsed && 'collapsed', className)}
            style={panelStyle}
            aria-label={ariaLabel ?? (typeof title === 'string' ? title : texts.label)}
            {...rest}
        >
            {hasHeader && (
                <div className="floating-panel-header">
                    {title != null && !collapsed && <div className="floating-panel-title">{title}</div>}
                    {actions != null && !collapsed && <div className="floating-panel-actions">{actions}</div>}
                    {collapsible && (
                        <MButton
                            variant="ghost"
                            color="neutral"
                            size="sm"
                            iconOnly
                            className="floating-panel-toggle"
                            aria-expanded={!collapsed}
                            aria-controls={contentId}
                            aria-label={collapsed ? texts.expand : texts.collapse}
                            onClick={toggle}
                        >
                            {collapsed ? awayFromEdge : towardsEdge}
                        </MButton>
                    )}
                </div>
            )}
            <div id={contentId} className="floating-panel-content" hidden={collapsed || undefined}>
                {children}
            </div>
        </section>
    )
})
