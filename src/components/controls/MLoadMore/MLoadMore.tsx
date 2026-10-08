import {useEffect, useRef, useCallback} from 'react'
import type {MLoadMoreProps} from './MLoadMore.types'
import {MButton} from '../MButton'
import {cn} from '../../../utils/cn'
import './MLoadMore.css'
import {useMLoadMoreTexts} from '../../../i18n/frameworkTexts'

export function MLoadMore({
    onLoadMore,
    loading = false,
    hasMore = true,
    loaded,
    total,
    auto = false,
    autoThreshold = 100,
    variant = 'outlined',
    color = 'primary',
    label: labelProp,
    loadingLabel: loadingLabelProp,
    doneLabel: doneLabelProp,
    className,
    ...rest
}: MLoadMoreProps) {
    const texts = useMLoadMoreTexts()
    const label = labelProp ?? texts.label
    const loadingLabel = loadingLabelProp ?? texts.loading
    const doneLabel = doneLabelProp ?? texts.done
    const sentinelRef = useRef<HTMLDivElement>(null)
    const loadMoreRef = useRef(onLoadMore)
    loadMoreRef.current = onLoadMore

    useEffect(() => {
        if (!auto || !hasMore || loading) return

        const sentinel = sentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreRef.current()
                }
            },
            {rootMargin: `${autoThreshold}px`}
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [auto, hasMore, loading, autoThreshold])

    const handleClick = useCallback(() => {
        if (!loading && hasMore) onLoadMore()
    }, [onLoadMore, loading, hasMore])

    const showCount = loaded !== undefined && total !== undefined
    // An empty list (total 0) is complete, not NaN%.
    const barPercent = showCount ? (total > 0 ? Math.min(Math.max((loaded / total) * 100, 0), 100) : 100) : 0

    return (
        <div className={cn('load-more', className)} {...rest}>
            {showCount && (
                <span className="load-more-count" aria-live="polite" aria-atomic="true">
                    {loaded} / {total}
                </span>
            )}

            {hasMore ? (
                <MButton
                    variant={variant}
                    color={color}
                    loading={loading}
                    onClick={handleClick}
                    className="load-more-btn"
                >
                    {loading ? loadingLabel : label}
                </MButton>
            ) : (
                <span className="load-more-done" role="status">
                    {doneLabel}
                </span>
            )}

            {auto && hasMore && <div ref={sentinelRef} className="load-more-sentinel" />}

            {showCount && (
                <div className="load-more-bar">
                    <div className="load-more-bar-fill" style={{width: `${barPercent}%`}} />
                </div>
            )}
        </div>
    )
}
