import {useMemo} from 'react'
import {cn} from '../../../utils/cn'
import {MButton} from '../../controls'
import {MChevronLeftIcon, MChevronRightIcon} from '../../../icons'
import type {MPaginationProps} from './MPagination.types'
import {formatMText, useMLayoutTexts} from '../../../i18n/frameworkTexts'
import './MPagination.css'

function range(start: number, end: number): number[] {
    const result: number[] = []
    for (let i = start; i <= end; i++) result.push(i)
    return result
}

function buildPages(totalPages: number, page: number, siblings: number, boundaries: number): (number | 'dots')[] {
    if (totalPages <= boundaries * 2 + siblings * 2 + 3) {
        return range(1, totalPages)
    }

    const leftBound = Math.max(page - siblings, boundaries + 2)
    const rightBound = Math.min(page + siblings, totalPages - boundaries - 1)

    const showLeftDots = leftBound > boundaries + 2
    const showRightDots = rightBound < totalPages - boundaries - 1

    const leftEdge = range(1, boundaries)
    const rightEdge = range(totalPages - boundaries + 1, totalPages)

    if (!showLeftDots && showRightDots) {
        const leftCount = siblings * 2 + boundaries + 2
        return [...range(1, leftCount), 'dots', ...rightEdge]
    }

    if (showLeftDots && !showRightDots) {
        const rightCount = siblings * 2 + boundaries + 2
        return [...leftEdge, 'dots', ...range(totalPages - rightCount + 1, totalPages)]
    }

    return [...leftEdge, 'dots', ...range(leftBound, rightBound), 'dots', ...rightEdge]
}

export function MPagination({
    total,
    page,
    pageSize = 10,
    onChange,
    siblings = 1,
    boundaries = 1,
    variant = 'numbered',
    className,
    ...rest
}: MPaginationProps) {
    const texts = useMLayoutTexts()
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const currentPage = Math.min(Math.max(1, page), totalPages)

    const pages = useMemo(
        () => buildPages(totalPages, currentPage, siblings, boundaries),
        [totalPages, currentPage, siblings, boundaries]
    )

    if (variant === 'simple') {
        return (
            <nav aria-label={texts.paginationLabel} className={cn('pagination', className)} {...rest}>
                <MButton
                    variant="outlined"
                    size="sm"
                    iconOnly
                    aria-label={texts.previousPage}
                    disabled={currentPage <= 1}
                    onClick={() => onChange(currentPage - 1)}
                    className="nav"
                >
                    <MChevronLeftIcon />
                </MButton>
                <span className="info" aria-live="polite">
                    {currentPage} / {totalPages}
                </span>
                <MButton
                    variant="outlined"
                    size="sm"
                    iconOnly
                    aria-label={texts.nextPage}
                    disabled={currentPage >= totalPages}
                    onClick={() => onChange(currentPage + 1)}
                    className="nav"
                >
                    <MChevronRightIcon />
                </MButton>
            </nav>
        )
    }

    return (
        <nav aria-label={texts.paginationLabel} className={cn('pagination', className)} {...rest}>
            <MButton
                variant="outlined"
                size="sm"
                iconOnly
                aria-label={texts.previousPage}
                disabled={currentPage <= 1}
                onClick={() => onChange(currentPage - 1)}
                className="nav"
            >
                <MChevronLeftIcon />
            </MButton>
            {pages.map((p, i) =>
                p === 'dots' ? (
                    <span key={`dots-${i}`} className="dots" aria-hidden="true">
                        &#8230;
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        className={cn('btn', p === currentPage && 'active')}
                        aria-label={formatMText(texts.pageNumber, {page: p})}
                        aria-current={p === currentPage ? 'page' : undefined}
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </button>
                )
            )}
            <MButton
                variant="outlined"
                size="sm"
                iconOnly
                aria-label={texts.nextPage}
                disabled={currentPage >= totalPages}
                onClick={() => onChange(currentPage + 1)}
                className="nav"
            >
                <MChevronRightIcon />
            </MButton>
        </nav>
    )
}
