import type {CSSProperties, HTMLAttributes, ReactNode} from 'react'

export interface MStickyPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onMouseDown'> {
    children?: ReactNode

    /** Distance from viewport top where the panel sticks (CSS `top` on the
     *  sticky element, in px). Default 16. */
    top?: number

    /** Reserved space below the panel relative to viewport bottom, in px.
     *  Resulting height = `calc(100vh - top - bottomGap)`. Default 16. */
    bottomGap?: number

    /** Hide the native scrollbar (panel is still scrollable via wheel,
     *  keyboard and drag). Default true. */
    hideScrollbar?: boolean

    /** Click-and-drag scrolling. Drag is suppressed when the user clicks an
     *  interactive descendant (matches `button, a, [role="button"]`) so
     *  action buttons remain clickable. Default true. */
    draggable?: boolean

    /** Accessible name. When set, the panel is exposed as a named `region`
     *  landmark. The panel is always keyboard-focusable (`tabIndex={0}`) so its
     *  content can be scrolled from the keyboard; pass `tabIndex={-1}` to opt out. */
    label?: string

    className?: string
    style?: CSSProperties
}
