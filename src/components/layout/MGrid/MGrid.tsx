import {Children, cloneElement, isValidElement} from 'react'
import type {ReactElement} from 'react'
import type {MGridColumns, MGridItemProps, MGridProps} from './MGrid.types'
import {getHiddenProps} from '../../../theme'
import {cn} from '../../../utils/cn'
import {getLayoutUtilityClassNames, getLayoutUtilityStyles} from '../../../utils/layoutProps'
import './MGrid.css'

type GridBreakpoint = 'base' | 'xxl' | 'xl' | 'lg' | 'md' | 'sm'
type GridBreakpointSpans = Record<GridBreakpoint, MGridColumns | undefined>
type MGridInternalProps = MGridProps & {
    resolvedBase?: MGridColumns
}

const gridBreakpointOrder: GridBreakpoint[] = ['base', 'xxl', 'xl', 'lg', 'md', 'sm']

const hiddenBreakpointMap: Record<string, GridBreakpoint[]> = {
    sm: ['sm'],
    md: ['md', 'sm'],
    lg: ['lg', 'md', 'sm'],
    xl: ['xl', 'lg', 'md', 'sm'],
    '2xl': ['xxl', 'xl', 'lg', 'md', 'sm'],
}

function isGridColumnElement(child: unknown): child is ReactElement<MGridProps | MGridItemProps> {
    if (!isValidElement(child)) {
        return false
    }

    if (child.type === MGridItem) {
        return true
    }

    return child.type === MGrid && (child.props as MGridProps).type === 'col'
}

function getInheritedSpans(props: Partial<MGridProps>): GridBreakpointSpans {
    const sm = props.sm
    const md = props.md ?? sm
    const lg = props.lg ?? md
    const xl = props.xl ?? lg
    const xxl = props.xxl ?? xl

    return {
        base: xxl,
        xxl,
        xl,
        lg,
        md,
        sm,
    }
}

function isHiddenAtBreakpoint(hidden: MGridProps['hidden'], breakpoint: GridBreakpoint) {
    if (hidden === true) {
        return true
    }

    if (hidden === undefined || hidden === false || breakpoint === 'base') {
        return false
    }

    return hiddenBreakpointMap[hidden]?.includes(breakpoint) ?? false
}

function distributeRemainingColumns(remaining: number, count: number): Array<MGridColumns | undefined> {
    if (count <= 0) {
        return []
    }

    if (remaining <= 0) {
        return Array.from({length: count}, () => 12 as MGridColumns)
    }

    const base = Math.floor(remaining / count)
    const extra = remaining % count

    return Array.from({length: count}, (_, index) => {
        const value = base + (index < extra ? 1 : 0)
        return value >= 1 ? (value as MGridColumns) : (12 as MGridColumns)
    })
}

function resolveAutoSpans(columnProps: Array<Partial<MGridProps>>) {
    const normalized = columnProps.map((props) => getInheritedSpans(props))
    const resolved = normalized.map((spans) => ({...spans}))

    for (const breakpoint of gridBreakpointOrder) {
        const autoIndexes: number[] = []
        let usedColumns = 0

        normalized.forEach((spans, index) => {
            if (isHiddenAtBreakpoint(columnProps[index].hidden, breakpoint)) {
                resolved[index][breakpoint] = undefined
                return
            }

            const value = spans[breakpoint]

            if (value) {
                usedColumns += value
                return
            }

            autoIndexes.push(index)
        })

        const distributed = distributeRemainingColumns(Math.max(12 - usedColumns, 0), autoIndexes.length)

        autoIndexes.forEach((columnIndex, autoIndex) => {
            resolved[columnIndex][breakpoint] = distributed[autoIndex]
        })
    }

    return resolved
}

// Render either a responsive row or a responsive column using one shared grid API.
export function MGrid({
    type = 'row',
    sm,
    md,
    lg,
    xl,
    xxl,
    resolvedBase,
    hidden,
    hiddenAbove,
    align,
    spacing,
    padding,
    fsize,
    mt,
    mb,
    ml,
    mr,
    mx,
    my,
    pt,
    pb,
    pl,
    pr,
    px,
    py,
    fullWidth,
    className,
    style,
    children,
    ...rest
}: MGridInternalProps) {
    const utilityStyle = getLayoutUtilityStyles({fsize})
    const inheritedSpans = getInheritedSpans({sm, md, lg, xl, xxl})
    const baseSpan = resolvedBase ?? inheritedSpans.base

    if (type === 'col') {
        return (
            <div
                className={cn(
                    'grid',
                    'col',
                    baseSpan ? `span-${baseSpan}` : 'span-auto',
                    xxl && `xxl-${xxl}`,
                    xl && `xl-${xl}`,
                    lg && `lg-${lg}`,
                    md && `md-${md}`,
                    sm && `sm-${sm}`,
                    align && `self-${align}`,
                    ...getLayoutUtilityClassNames({
                        spacing,
                        padding,
                        fsize,
                        mt,
                        mb,
                        ml,
                        mr,
                        mx,
                        my,
                        pt,
                        pb,
                        pl,
                        pr,
                        px,
                        py,
                        fullWidth,
                    }),
                    className
                )}
                style={{...utilityStyle, ...style}}
                {...getHiddenProps(hidden, hiddenAbove)}
                {...rest}
            >
                {children}
            </div>
        )
    }

    const childArray = Children.toArray(children)
    const columnEntries = childArray.flatMap((child, index) => (isGridColumnElement(child) ? [{child, index}] : []))
    const autoColumns = Math.min(Math.max(columnEntries.length || childArray.length, 1), 12)
    const needsResponsiveResolution = columnEntries.some(({child}) => {
        const p = child.props as MGridProps
        return Boolean(p.hidden || p.xxl || p.xl || p.lg || p.md || p.sm)
    })
    const resolvedSpans = needsResponsiveResolution
        ? resolveAutoSpans(columnEntries.map(({child}) => child.props as Partial<MGridProps>))
        : null
    const resolvedChildren =
        needsResponsiveResolution && resolvedSpans
            ? childArray.map((child, childIndex) => {
                  const columnIndex = columnEntries.findIndex((entry) => entry.index === childIndex)

                  if (columnIndex === -1 || !isGridColumnElement(child)) {
                      return child
                  }

                  const spans = resolvedSpans[columnIndex]

                  return cloneElement(child as ReactElement<MGridInternalProps>, {
                      resolvedBase: spans.base,
                      xxl: spans.xxl,
                      xl: spans.xl,
                      lg: spans.lg,
                      md: spans.md,
                      sm: spans.sm,
                  })
              })
            : childArray

    return (
        <div
            className={cn(
                'grid',
                'row',
                needsResponsiveResolution ? 'tracked' : `auto-cols-${autoColumns}`,
                align && `align-${align}`,
                ...getLayoutUtilityClassNames({
                    spacing,
                    padding,
                    fsize,
                    mt,
                    mb,
                    ml,
                    mr,
                    mx,
                    my,
                    pt,
                    pb,
                    pl,
                    pr,
                    px,
                    py,
                    fullWidth: fullWidth ?? true,
                }),
                className
            )}
            style={{...utilityStyle, ...style}}
            {...getHiddenProps(hidden, hiddenAbove)}
            {...rest}
        >
            {resolvedChildren}
        </div>
    )
}

// Keep MGridItem as a compatibility alias for explicit column declarations.
export function MGridItem({sm, md, lg, xl, xxl, align, ...rest}: MGridItemProps) {
    return <MGrid type="col" sm={sm} md={md} lg={lg} xl={xl} xxl={xxl} align={align} {...rest} />
}
