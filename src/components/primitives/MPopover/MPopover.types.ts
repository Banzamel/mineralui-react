import type {AriaRole, ReactNode, CSSProperties, RefObject} from 'react'

export type MPopoverPlacement =
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start'
    | 'top-end'
    | 'right-start'
    | 'right-end'
    | 'left-start'
    | 'left-end'

export interface MPopoverProps {
    open: boolean
    anchorRef: RefObject<HTMLElement | null>
    onClose: () => void
    placement?: MPopoverPlacement
    matchWidth?: boolean
    offset?: number
    zIndex?: number | string
    children: ReactNode
    className?: string
    style?: CSSProperties
    /**
     * ARIA role of the floating layer. Defaults to `'listbox'` for backward compatibility;
     * pass `'dialog'` for forms / confirmations, `'menu'` for menus, or `null` when the
     * content brings its own role (e.g. an inner `role="listbox"`).
     */
    role?: AriaRole | null
    /** Accessible name of the layer (useful with `role="dialog"`). */
    'aria-label'?: string
    /** Id(s) of the element(s) naming the layer. */
    'aria-labelledby'?: string
    /** Id(s) of the element(s) describing the layer. */
    'aria-describedby'?: string
    /** Id of the layer element (e.g. for `aria-controls` on the anchor). */
    id?: string
    /**
     * Where focus goes once the popover is open and positioned:
     * `'first'` — the first tabbable element inside (falls back to the layer itself),
     * `'container'` — the layer itself, or a ref to a specific element.
     * Omit to leave focus where it is (the default).
     */
    initialFocus?: 'first' | 'container' | RefObject<HTMLElement | null>
    /**
     * When the popover closes while focus is inside it, move focus back to the anchor
     * (or the first focusable element inside the anchor). Defaults to `true`.
     */
    restoreFocus?: boolean
    /**
     * Close the popover when Tab / Shift+Tab moves focus out of it. Focus returns to the
     * anchor first, so Tab continues from there in document order. Defaults to `false`.
     */
    closeOnTabOut?: boolean
}
