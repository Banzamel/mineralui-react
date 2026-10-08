import {createContext, useContext, useEffect, useRef, useState} from 'react'
import type {CSSProperties, DragEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent, ReactNode} from 'react'
import type {
    MTreeViewProps,
    MTreeItemProps,
    MTreeNode,
    MTreeViewContextMenuItem,
    MTreeViewMoveEvent,
} from './MTreeView.types'
import {cn} from '../../../utils/cn'
import {formatMText, useMTreeViewTexts} from '../../../i18n/frameworkTexts'
import {MCheckbox} from '../../controls'
import {MPortal} from '../../primitives'
import {useKeyboardNav} from '../../../utils/useKeyboardNav'
import {isRtlElement} from '../../../utils/radioGroupKeys'
import {
    MChevronRightIcon,
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
    MFolderIcon,
    MFolderOpenIcon,
} from '../../../icons'
import './MTreeView.css'
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

// Read the file extension once so icon logic stays predictable.
function getFileExtension(label: string): string | null {
    const dot = label.lastIndexOf('.')
    if (dot < 1) return null
    return label.slice(dot + 1).toLowerCase()
}

// Treat explicit folders and nodes with children as directory-like.
function isFolderNode(node: MTreeNode) {
    return node.kind === 'folder' || Boolean(node.children?.length)
}

// Resolve the proper file icon by extension.
function getFileIcon(label: string): ReactNode {
    const ext = getFileExtension(label)
    if (!ext) return <MFileIcon />

    return fileTypeMap[ext] ?? <MFileTextIcon />
}

// Prefer custom icons first, then fall back to folder or file visuals.
function getDefaultIcon(node: MTreeNode, isExpanded: boolean, fileIcons: boolean) {
    if (node.icon) return node.icon
    if (!fileIcons) return null

    if (isFolderNode(node)) return isExpanded ? <MFolderOpenIcon /> : <MFolderIcon />

    return getFileIcon(node.label)
}

// Cache nodes and descendants so drag-drop validation stays fast.
function buildTreeLookup(items: MTreeNode[]) {
    const nodeMap = new Map<string, MTreeNode>()
    const descendants = new Map<string, Set<string>>()
    const parentMap = new Map<string, string>()

    function walk(node: MTreeNode) {
        nodeMap.set(node.id, node)

        const childIds = new Set<string>()

        for (const child of node.children ?? []) {
            parentMap.set(child.id, node.id)
            childIds.add(child.id)

            const nestedIds = walk(child)
            nestedIds.forEach((id) => childIds.add(id))
        }

        descendants.set(node.id, childIds)
        return childIds
    }

    items.forEach(walk)

    return {nodeMap, descendants, parentMap}
}

// Compute indeterminate ids: a node where some but not all leaf descendants are checked.
function computeIndeterminate(items: MTreeNode[], checked: Set<string>): Set<string> {
    const indeterminate = new Set<string>()

    function walk(node: MTreeNode): {checked: number; total: number} {
        if (!node.children?.length) {
            return checked.has(node.id) ? {checked: 1, total: 1} : {checked: 0, total: 1}
        }

        let c = 0
        let t = 0

        for (const child of node.children) {
            const r = walk(child)
            c += r.checked
            t += r.total
        }

        if (c > 0 && c < t) indeterminate.add(node.id)
        return {checked: c, total: t}
    }

    items.forEach(walk)
    return indeterminate
}

// Keep the context menu inside the viewport.
function clampMenuPosition(x: number, y: number) {
    if (typeof window === 'undefined') {
        return {x, y}
    }

    return {
        x: Math.max(8, Math.min(x, window.innerWidth - 220)),
        y: Math.max(8, Math.min(y, window.innerHeight - 16)),
    }
}

// Built-in context-menu actions (keyboard / single-pointer alternative to dragging, WCAG 2.5.7).
const CUT_ACTION = '__mineral-tree-cut'
const MOVE_HERE_ACTION = '__mineral-tree-move-here'
const CANCEL_MOVE_ACTION = '__mineral-tree-cancel-move'
const BUILT_IN_ACTIONS = new Set([CUT_ACTION, MOVE_HERE_ACTION, CANCEL_MOVE_ACTION])

interface VisibleNode {
    node: MTreeNode
    parentId: string | null
}

// Visible nodes in document order (the rows a keyboard user walks through).
function flattenVisible(items: MTreeNode[], expandedIds: Set<string>): VisibleNode[] {
    const result: VisibleNode[] = []

    function walk(nodes: MTreeNode[], parentId: string | null) {
        for (const node of nodes) {
            result.push({node, parentId})
            if (isFolderNode(node) && expandedIds.has(node.id)) walk(node.children ?? [], node.id)
        }
    }

    walk(items, null)
    return result
}

// Roving-focus state shared with every row (APG tree: one tab stop, focus moves with the arrows).
interface TreeNavState {
    tabbableId: string | null
    cutId: string | null
    registerItem: (id: string, element: HTMLLIElement | null) => void
    onItemFocus: (id: string) => void
}

const TreeNavContext = createContext<TreeNavState | null>(null)

// Render one visible row and recurse into children when expanded.
function TreeItem({
    node,
    color,
    level,
    expandable,
    selectable,
    expandedIds,
    selectedId,
    draggedId,
    dropTargetId,
    onToggle,
    onSelect,
    checkable,
    checkedIds,
    indeterminateIds,
    onCheck,
    indent,
    showLines,
    fileIcons,
    draggable,
    canDropOnNode,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}: MTreeItemProps) {
    const nav = useContext(TreeNavContext)
    const hasChildren = isFolderNode(node)
    const isExpanded = expandedIds.has(node.id)
    const isSelected = selectedId === node.id
    const isDragging = draggedId === node.id
    const isDropTarget = dropTargetId === node.id
    const canDrop = canDropOnNode?.(node)
    const icon = getDefaultIcon(node, isExpanded, !!fileIcons)
    const isChecked = checkedIds?.has(node.id) ?? false
    const isIndeterminate = indeterminateIds?.has(node.id) ?? false
    const isCut = nav?.cutId === node.id

    return (
        <li
            ref={nav ? (element) => nav.registerItem(node.id, element) : undefined}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={selectable ? isSelected : undefined}
            aria-checked={checkable ? (isIndeterminate ? 'mixed' : isChecked) : undefined}
            aria-disabled={node.disabled || undefined}
            aria-level={level + 1}
            // Name the row by its own label, not by the text of its whole subtree.
            aria-label={node.label}
            tabIndex={nav ? (nav.tabbableId === node.id ? 0 : -1) : undefined}
            data-node-id={node.id}
            onFocus={(event) => {
                if (event.target === event.currentTarget) nav?.onItemFocus(node.id)
            }}
        >
            <div
                className={cn(
                    'item',
                    isSelected && 'selected',
                    node.disabled && 'disabled',
                    selectable && !node.disabled && 'selectable',
                    draggable && !node.disabled && 'draggable',
                    isDragging && 'dragging',
                    canDrop && 'can-drop',
                    isDropTarget && 'drop-target',
                    isCut && 'cut'
                )}
                data-color={color}
                style={{paddingLeft: level * indent}}
                draggable={draggable && !node.disabled}
                onClick={() => {
                    if (node.disabled) return
                    if (hasChildren && expandable) onToggle(node.id)
                    if (selectable) onSelect?.(node.id, node)
                }}
                onContextMenu={(event) => onContextMenu?.(event, node)}
                onDragStart={(event) => onDragStart?.(event, node)}
                onDragOver={(event) => onDragOver?.(event, node)}
                onDrop={(event) => onDrop?.(event, node)}
                onDragEnd={onDragEnd}
            >
                <span className="toggle">
                    {hasChildren && expandable ? (
                        <span className={cn('arrow', isExpanded && 'expanded')}>
                            <MChevronRightIcon />
                        </span>
                    ) : (
                        <span className="spacer" />
                    )}
                </span>
                {checkable && (
                    // The row carries `aria-checked` (APG tree); the checkbox is a pointer target only,
                    // so it stays out of the tab order and the accessibility tree.
                    <span
                        className="check"
                        aria-hidden="true"
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        <MCheckbox
                            ref={(element) => {
                                if (element) element.tabIndex = -1
                            }}
                            size="sm"
                            clickEffect="none"
                            disabled={node.disabled}
                            checked={isChecked}
                            indeterminate={isIndeterminate}
                            aria-label={node.label}
                            onChange={() => onCheck?.(node.id)}
                        />
                    </span>
                )}
                {icon && <span className="icon">{icon}</span>}
                <span className="label">{node.label}</span>
            </div>
            {hasChildren && isExpanded && (
                <ul
                    className="list"
                    role="group"
                    style={showLines ? ({'--line-left': `${level * indent + 17}px`} as CSSProperties) : undefined}
                >
                    {(node.children ?? []).map((child) => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            color={color}
                            level={level + 1}
                            expandable={expandable}
                            selectable={selectable}
                            expandedIds={expandedIds}
                            selectedId={selectedId}
                            draggedId={draggedId}
                            dropTargetId={dropTargetId}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            checkable={checkable}
                            checkedIds={checkedIds}
                            indeterminateIds={indeterminateIds}
                            onCheck={onCheck}
                            indent={indent}
                            showLines={showLines}
                            fileIcons={fileIcons}
                            draggable={draggable}
                            canDropOnNode={canDropOnNode}
                            onContextMenu={onContextMenu}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}

// Render a file tree with selection, context actions and folder moves.
export function MTreeView({
    items,
    color = 'primary',
    expandable = true,
    selectable = false,
    defaultExpanded = [],
    expanded: controlledExpanded,
    onExpandChange,
    selected: controlledSelected,
    onSelect,
    checkable = false,
    defaultChecked = [],
    checked: controlledChecked,
    onCheckedChange,
    indent = 20,
    showLines = true,
    fileIcons = true,
    draggable = false,
    canDrop,
    onMove,
    keyboardMove = true,
    contextMenuItems,
    onContextMenuAction,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
}: MTreeViewProps) {
    const texts = useMTreeViewTexts()
    const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded)
    const [internalSelected, setInternalSelected] = useState<string | null>(null)
    const [internalChecked, setInternalChecked] = useState<string[]>(defaultChecked)
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [dropTargetId, setDropTargetId] = useState<string | null>(null)
    const [focusedId, setFocusedId] = useState<string | null>(null)
    const [cutId, setCutId] = useState<string | null>(null)
    const [announcement, setAnnouncement] = useState('')
    const [menu, setMenu] = useState<{
        node: MTreeNode
        items: MTreeViewContextMenuItem[]
        x: number
        y: number
    } | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const treeRef = useRef<HTMLUListElement>(null)
    const itemEls = useRef(new Map<string, HTMLLIElement>())
    const menuItemEls = useRef<(HTMLButtonElement | null)[]>([])
    const typeahead = useRef<{buffer: string; timer: ReturnType<typeof setTimeout> | null}>({buffer: '', timer: null})

    const expandedArr = controlledExpanded ?? internalExpanded
    const expandedIds = new Set(expandedArr)
    const selectedId = controlledSelected !== undefined ? controlledSelected : internalSelected
    const checkedArr = controlledChecked ?? internalChecked
    const checkedIds = new Set(checkedArr)
    const indeterminateIds = checkable ? computeIndeterminate(items, checkedIds) : new Set<string>()
    const {nodeMap, descendants, parentMap} = buildTreeLookup(items)
    const draggedNode = draggedId ? (nodeMap.get(draggedId) ?? null) : null
    const moveEnabled = draggable && !!onMove && keyboardMove
    const cutNode = cutId ? (nodeMap.get(cutId) ?? null) : null

    const visible = flattenVisible(items, expandedIds)
    const visibleIds = visible.map((entry) => entry.node.id)
    const tabbableId =
        focusedId && visibleIds.includes(focusedId)
            ? focusedId
            : selectedId && visibleIds.includes(selectedId)
              ? selectedId
              : (visibleIds[0] ?? null)

    const menuItemCount = menu?.items.length ?? 0
    const {
        onKeyDown: onMenuNavKeyDown,
        getItemProps: getMenuItemProps,
        focusItem: focusMenuItem,
    } = useKeyboardNav({
        itemCount: menuItemCount,
        isOpen: !!menu,
        mode: 'roving',
        selectOnSpace: true,
        isItemDisabled: (index) => !!menu?.items[index]?.disabled,
        getItemLabel: (index) => {
            const label = menu?.items[index]?.label
            return typeof label === 'string' || typeof label === 'number' ? String(label) : ''
        },
        onSelect: (index) => menuItemEls.current[index]?.click(),
        onClose: () => closeMenu(true),
    })

    useEffect(() => {
        if (!menu) return

        function closeOnOutside(event?: Event) {
            if (event && menuRef.current && menuRef.current.contains(event.target as Node)) {
                return
            }

            setMenu(null)
        }

        function handleKey(event: KeyboardEvent) {
            if (event.key === 'Escape' && !event.defaultPrevented) {
                setMenu(null)
            }
        }

        document.addEventListener('mousedown', closeOnOutside)
        document.addEventListener('scroll', closeOnOutside, true)
        window.addEventListener('resize', closeOnOutside)
        document.addEventListener('keydown', handleKey)

        return () => {
            document.removeEventListener('mousedown', closeOnOutside)
            document.removeEventListener('scroll', closeOnOutside, true)
            window.removeEventListener('resize', closeOnOutside)
            document.removeEventListener('keydown', handleKey)
        }
    }, [menu])

    // APG menu: focus lands on the first enabled item when the menu opens.
    useEffect(() => {
        if (!menu) return
        const first = menu.items.findIndex((item) => !item.disabled)
        if (first >= 0) focusMenuItem(first)
        else menuRef.current?.focus()
        // Only on open: `menu` is a new object per opening.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menu])

    useEffect(() => {
        const state = typeahead.current
        return () => {
            if (state.timer) clearTimeout(state.timer)
        }
    }, [])

    function registerItem(id: string, element: HTMLLIElement | null) {
        if (element) itemEls.current.set(id, element)
        else itemEls.current.delete(id)
    }

    function focusNode(id: string) {
        setFocusedId(id)
        itemEls.current.get(id)?.focus()
    }

    function announce(message: string) {
        setAnnouncement(message)
    }

    function closeMenu(restoreFocus: boolean) {
        const node = menu?.node
        setMenu(null)
        if (restoreFocus && node) focusNode(node.id)
    }

    function handleToggle(id: string) {
        const next = expandedIds.has(id) ? expandedArr.filter((e) => e !== id) : [...expandedArr, id]
        if (onExpandChange) onExpandChange(next)
        else setInternalExpanded(next)
    }

    function expandMany(ids: string[]) {
        const missing = ids.filter((id) => !expandedIds.has(id))
        if (!missing.length) return
        const next = [...expandedArr, ...missing]
        if (onExpandChange) onExpandChange(next)
        else setInternalExpanded(next)
    }

    function handleSelect(id: string, node: MTreeNode) {
        if (onSelect) onSelect(id, node)
        else setInternalSelected(id)
    }

    function handleCheck(id: string) {
        const node = nodeMap.get(id)
        if (!node || node.disabled) return

        const next = new Set(checkedIds)
        const isCurrentlyChecked = next.has(id)
        const subtree = [id, ...Array.from(descendants.get(id) ?? [])]

        if (isCurrentlyChecked) {
            for (const sid of subtree) next.delete(sid)
        } else {
            for (const sid of subtree) {
                const sNode = nodeMap.get(sid)
                if (sNode && !sNode.disabled) next.add(sid)
            }
        }

        let parentId = parentMap.get(id)

        while (parentId) {
            const parent = nodeMap.get(parentId)
            if (!parent) break

            const allChildrenChecked = (parent.children ?? []).every((child) => child.disabled || next.has(child.id))
            const hasEnabledChild = (parent.children ?? []).some((child) => !child.disabled)

            if (allChildrenChecked && hasEnabledChild) next.add(parentId)
            else next.delete(parentId)

            parentId = parentMap.get(parentId)
        }

        const nextArr = Array.from(next)

        if (controlledChecked === undefined) setInternalChecked(nextArr)
        onCheckedChange?.(nextArr)
    }

    function closeDrag() {
        setDraggedId(null)
        setDropTargetId(null)
    }

    // Shared by drag-and-drop and the keyboard / menu move.
    function canMoveNode(sourceNode: MTreeNode | null, targetNode: MTreeNode) {
        if (!sourceNode || !draggable || !onMove) return false
        if (targetNode.disabled || !isFolderNode(targetNode)) return false
        if (targetNode.id === sourceNode.id) return false
        if (descendants.get(sourceNode.id)?.has(targetNode.id)) return false
        // Dropping into the folder that already holds the node would be an empty move.
        if (parentMap.get(sourceNode.id) === targetNode.id) return false

        return canDrop ? canDrop(sourceNode, targetNode) : true
    }

    function isValidDropTarget(targetNode: MTreeNode) {
        return canMoveNode(draggedNode, targetNode)
    }

    /* ── Keyboard / single-pointer move (cut → move here) ── */

    function cutForMove(node: MTreeNode) {
        if (!moveEnabled || node.disabled) return
        setCutId(node.id)
        announce(formatMText(texts.cutAnnouncement, {label: node.label}))
    }

    function moveCutInto(targetNode: MTreeNode) {
        if (!cutNode || !canMoveNode(cutNode, targetNode)) return false

        onMove?.({
            draggedId: cutNode.id,
            draggedNode: cutNode,
            targetId: targetNode.id,
            targetNode,
        } satisfies MTreeViewMoveEvent)

        if (expandable && !expandedIds.has(targetNode.id)) {
            handleToggle(targetNode.id)
        }

        setCutId(null)
        announce(formatMText(texts.movedAnnouncement, {label: cutNode.label, target: targetNode.label}))
        return true
    }

    function cancelMove() {
        setCutId(null)
        announce(texts.moveCancelled)
    }

    function builtInMenuItems(node: MTreeNode): MTreeViewContextMenuItem[] {
        if (!moveEnabled) return []

        const result: MTreeViewContextMenuItem[] = []
        if (cutNode && cutNode.id !== node.id && canMoveNode(cutNode, node)) {
            result.push({id: MOVE_HERE_ACTION, label: texts.moveHere})
        }
        if (!node.disabled && cutId !== node.id) {
            result.push({id: CUT_ACTION, label: texts.cut})
        }
        if (cutId) {
            result.push({id: CANCEL_MOVE_ACTION, label: texts.cancelMove})
        }

        return result
    }

    function menuItemsFor(node: MTreeNode) {
        const custom = contextMenuItems ? contextMenuItems(node).filter(Boolean) : []
        return [...custom, ...builtInMenuItems(node)]
    }

    function openMenu(node: MTreeNode, x: number, y: number) {
        if (node.disabled) return false

        const nextItems = menuItemsFor(node)
        if (!nextItems.length) return false

        handleSelect(node.id, node)

        const pos = clampMenuPosition(x, y)
        setMenu({
            node,
            items: nextItems,
            x: pos.x,
            y: pos.y,
        })
        return true
    }

    function handleContextMenu(event: MouseEvent<HTMLDivElement>, node: MTreeNode) {
        if (node.disabled || !menuItemsFor(node).length) return

        event.preventDefault()
        openMenu(node, event.clientX, event.clientY)
    }

    function handleMenuAction(item: MTreeViewContextMenuItem, node: MTreeNode) {
        if (item.disabled) return

        const restore = !!menuRef.current?.contains(document.activeElement)

        if (item.id === CUT_ACTION) cutForMove(node)
        else if (item.id === MOVE_HERE_ACTION) moveCutInto(node)
        else if (item.id === CANCEL_MOVE_ACTION) cancelMove()

        if (!BUILT_IN_ACTIONS.has(item.id)) onContextMenuAction?.(item.id, node)
        closeMenu(restore)
    }

    function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Tab') {
            // Leaving the menu closes it and puts focus back on its node.
            event.preventDefault()
            closeMenu(true)
            return
        }
        onMenuNavKeyDown(event)
    }

    function handleDragStart(event: DragEvent<HTMLDivElement>, node: MTreeNode) {
        if (!draggable || node.disabled) return

        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', node.id)
        setMenu(null)
        setDraggedId(node.id)
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>, targetNode: MTreeNode) {
        if (!isValidDropTarget(targetNode)) return

        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setDropTargetId(targetNode.id)
    }

    function handleDrop(event: DragEvent<HTMLDivElement>, targetNode: MTreeNode) {
        event.preventDefault()

        if (!draggedNode || !isValidDropTarget(targetNode)) {
            closeDrag()
            return
        }

        onMove?.({
            draggedId: draggedNode.id,
            draggedNode,
            targetId: targetNode.id,
            targetNode,
        } satisfies MTreeViewMoveEvent)

        if (expandable && !expandedIds.has(targetNode.id)) {
            handleToggle(targetNode.id)
        }

        closeDrag()
    }

    /* ── APG tree keyboard ── */

    function activateNode(node: MTreeNode) {
        if (node.disabled) return
        if (isFolderNode(node) && expandable) handleToggle(node.id)
        if (selectable) handleSelect(node.id, node)
    }

    function typeaheadTo(char: string, from: number) {
        const state = typeahead.current
        if (state.timer) clearTimeout(state.timer)
        state.buffer += char.toLowerCase()
        state.timer = setTimeout(() => {
            state.buffer = ''
            state.timer = null
        }, 500)

        const buffer = state.buffer
        const sameChar = buffer.split('').every((c) => c === buffer[0])
        const search = sameChar ? buffer[0] : buffer
        const offset = search.length === 1 ? 1 : 0
        for (let n = 0; n < visible.length; n++) {
            const entry = visible[(from + offset + n) % visible.length]
            if (entry.node.label.toLowerCase().startsWith(search)) {
                focusNode(entry.node.id)
                return true
            }
        }
        return false
    }

    function handleTreeKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
        const target = event.target as HTMLElement
        if (target.getAttribute('role') !== 'treeitem') return

        const id = target.dataset.nodeId ?? ''
        const position = visibleIds.indexOf(id)
        if (position < 0) return

        const {node, parentId} = visible[position]
        const folder = isFolderNode(node)
        const open = expandedIds.has(id)
        const ctrl = event.ctrlKey || event.metaKey
        const key = event.key

        // Context menu from the keyboard.
        if (key === 'ContextMenu' || (key === 'F10' && event.shiftKey)) {
            const rect = target.querySelector('.item')?.getBoundingClientRect() ?? target.getBoundingClientRect()
            if (openMenu(node, rect.left + 16, rect.bottom)) event.preventDefault()
            return
        }

        if (ctrl && !event.altKey && (key === 'x' || key === 'X')) {
            if (moveEnabled && !node.disabled) {
                event.preventDefault()
                cutForMove(node)
            }
            return
        }

        if (ctrl && !event.altKey && (key === 'v' || key === 'V')) {
            if (cutNode) {
                event.preventDefault()
                moveCutInto(node)
            }
            return
        }

        if (key === 'Escape' && cutId) {
            event.preventDefault()
            cancelMove()
            return
        }

        if (ctrl || event.altKey) return

        const rtl = isRtlElement(treeRef.current)
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
        const backward = rtl ? 'ArrowRight' : 'ArrowLeft'

        switch (key) {
            case 'ArrowDown':
                if (position < visible.length - 1) focusNode(visibleIds[position + 1])
                break
            case 'ArrowUp':
                if (position > 0) focusNode(visibleIds[position - 1])
                break
            case 'Home':
                focusNode(visibleIds[0])
                break
            case 'End':
                focusNode(visibleIds[visibleIds.length - 1])
                break
            case forward:
                if (folder && !open) {
                    if (expandable && !node.disabled) handleToggle(id)
                } else if (folder && open && node.children?.length) {
                    focusNode(visibleIds[position + 1])
                }
                break
            case backward:
                if (folder && open && expandable && !node.disabled) handleToggle(id)
                else if (parentId) focusNode(parentId)
                break
            case 'Enter':
                activateNode(node)
                break
            case ' ':
                if (typeahead.current.buffer) {
                    typeaheadTo(' ', position)
                } else if (checkable) {
                    handleCheck(id)
                } else if (selectable && !node.disabled) {
                    handleSelect(id, node)
                }
                break
            case '*': {
                if (!expandable) return
                const siblings = parentId ? (nodeMap.get(parentId)?.children ?? []) : items
                expandMany(siblings.filter((sibling) => isFolderNode(sibling) && !sibling.disabled).map((s) => s.id))
                break
            }
            default:
                if (key.length === 1 && key !== ' ' && typeaheadTo(key, position)) break
                return
        }

        event.preventDefault()
    }

    const navState: TreeNavState = {
        tabbableId,
        cutId,
        registerItem,
        onItemFocus: setFocusedId,
    }

    return (
        <div className={cn('tree', `color-${color}`, showLines && 'lines', className)} {...rest}>
            <TreeNavContext.Provider value={navState}>
                <ul
                    ref={treeRef}
                    className="list"
                    role="tree"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    onKeyDown={handleTreeKeyDown}
                >
                    {items.map((item) => (
                        <TreeItem
                            key={item.id}
                            node={item}
                            color={color}
                            level={0}
                            expandable={expandable}
                            selectable={selectable}
                            expandedIds={expandedIds}
                            selectedId={selectedId}
                            draggedId={draggedId}
                            dropTargetId={dropTargetId}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            checkable={checkable}
                            checkedIds={checkedIds}
                            indeterminateIds={indeterminateIds}
                            onCheck={handleCheck}
                            indent={indent}
                            showLines={showLines}
                            fileIcons={fileIcons}
                            draggable={draggable}
                            canDropOnNode={isValidDropTarget}
                            onContextMenu={handleContextMenu}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={closeDrag}
                        />
                    ))}
                </ul>
            </TreeNavContext.Provider>
            <div className="tree-live" role="status" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
            {menu && (
                <MPortal>
                    <div
                        ref={menuRef}
                        className="tree menu"
                        style={{top: menu.y, left: menu.x}}
                        role="menu"
                        tabIndex={-1}
                        aria-label={formatMText(texts.menuLabel, {label: menu.node.label})}
                        onKeyDown={handleMenuKeyDown}
                    >
                        {menu.items.map((item, index) => {
                            const navProps = getMenuItemProps(index)
                            return (
                                <button
                                    key={item.id}
                                    id={navProps.id}
                                    ref={(element) => {
                                        navProps.ref?.(element)
                                        menuItemEls.current[index] = element
                                    }}
                                    tabIndex={navProps.tabIndex}
                                    onFocus={navProps.onFocus}
                                    type="button"
                                    className={cn('action', item.color, item.disabled && 'disabled')}
                                    role="menuitem"
                                    disabled={item.disabled}
                                    onClick={() => handleMenuAction(item, menu.node)}
                                >
                                    {item.icon && <span className="icon">{item.icon}</span>}
                                    <span>{item.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </MPortal>
            )}
        </div>
    )
}
