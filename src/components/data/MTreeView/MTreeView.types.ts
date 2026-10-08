import type {DragEvent, HTMLAttributes, MouseEvent, ReactNode} from 'react'
import type {MColor} from '../../../theme'

export interface MTreeNode {
    id: string
    label: string
    kind?: 'file' | 'folder'
    children?: MTreeNode[]
    icon?: ReactNode
    disabled?: boolean
}

export interface MTreeViewContextMenuItem {
    id: string
    label: ReactNode
    icon?: ReactNode
    color?: MColor
    disabled?: boolean
}

export interface MTreeViewMoveEvent {
    draggedId: string
    draggedNode: MTreeNode
    targetId: string
    targetNode: MTreeNode
}

export interface MTreeViewProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultChecked'> {
    items: MTreeNode[]
    color?: MColor
    expandable?: boolean
    selectable?: boolean
    defaultExpanded?: string[]
    expanded?: string[]
    onExpandChange?: (ids: string[]) => void
    selected?: string | null
    onSelect?: (id: string, node: MTreeNode) => void
    checkable?: boolean
    defaultChecked?: string[]
    checked?: string[]
    onCheckedChange?: (ids: string[]) => void
    indent?: number
    showLines?: boolean
    fileIcons?: boolean
    draggable?: boolean
    canDrop?: (draggedNode: MTreeNode, targetNode: MTreeNode) => boolean
    onMove?: (event: MTreeViewMoveEvent) => void
    /**
     * Alternative to dragging (WCAG 2.5.7) while `draggable` and `onMove` are set: Ctrl+X cuts the
     * focused node, Ctrl+V moves it into the focused folder, Escape cancels; the context menu gets
     * built-in Cut / Move here / Cancel move actions. Default `true`.
     */
    keyboardMove?: boolean
    contextMenuItems?: (node: MTreeNode) => MTreeViewContextMenuItem[]
    onContextMenuAction?: (actionId: string, node: MTreeNode) => void
}

export interface MTreeItemProps {
    node: MTreeNode
    color: MColor
    level: number
    expandable?: boolean
    selectable?: boolean
    expandedIds: Set<string>
    selectedId?: string | null
    draggedId?: string | null
    dropTargetId?: string | null
    onToggle: (id: string) => void
    onSelect?: (id: string, node: MTreeNode) => void
    checkable?: boolean
    checkedIds?: Set<string>
    indeterminateIds?: Set<string>
    onCheck?: (id: string) => void
    indent: number
    showLines?: boolean
    fileIcons?: boolean
    draggable?: boolean
    canDropOnNode?: (node: MTreeNode) => boolean
    onContextMenu?: (event: MouseEvent<HTMLDivElement>, node: MTreeNode) => void
    onDragStart?: (event: DragEvent<HTMLDivElement>, node: MTreeNode) => void
    onDragOver?: (event: DragEvent<HTMLDivElement>, node: MTreeNode) => void
    onDrop?: (event: DragEvent<HTMLDivElement>, node: MTreeNode) => void
    onDragEnd?: () => void
}
