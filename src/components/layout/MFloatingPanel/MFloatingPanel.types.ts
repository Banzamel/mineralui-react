import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'

export type MFloatingPanelSide = 'left' | 'right'
/** `'absolute'` pins the panel to the nearest positioned container (a map / canvas scene). */
export type MFloatingPanelPosition = 'absolute' | 'fixed'

export interface MFloatingPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    /** Edge the panel floats against. Default `'left'`. */
    side?: MFloatingPanelSide
    /** Panel width (number = px). Default `320`. Capped at the container width minus the offsets. */
    width?: number | string
    /** Distance from the container edges (number = px). Default `16`. */
    offset?: number | string
    /** Default `'absolute'`. */
    position?: MFloatingPanelPosition
    /** Frosted glass background (`backdrop-filter: blur`). `true` = 12px, a number = px. Default `true`. */
    backdropBlur?: boolean | number
    /** Shows the hide / show toggle (with `aria-expanded`). Default `false`. */
    collapsible?: boolean
    /** Controlled collapsed state. */
    collapsed?: boolean
    /** Initial collapsed state when uncontrolled. Default `false`. */
    defaultCollapsed?: boolean
    onCollapsedChange?: (collapsed: boolean) => void
    /** Header title; a string also names the region. */
    title?: ReactNode
    /** Extra header content (actions) next to the toggle. */
    actions?: ReactNode
    className?: string
    style?: CSSProperties
    children?: ReactNode
}
