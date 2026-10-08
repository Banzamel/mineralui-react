import {useState, useEffect, useCallback} from 'react'
import type {MScrollTopProps} from './MScrollTop.types'
import {MButton} from '../MButton'
import {MArrowUpIcon} from '../../../icons'
import {cn} from '../../../utils/cn'
import './MScrollTop.css'
import {useMCommonTexts} from '../../../i18n/frameworkTexts'

export function MScrollTop({
    threshold = 300,
    variant = 'filled',
    color = 'primary',
    smooth = true,
    className,
}: MScrollTopProps) {
    const texts = useMCommonTexts()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        function onScroll() {
            setVisible(window.scrollY > threshold)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, {passive: true})
        return () => window.removeEventListener('scroll', onScroll)
    }, [threshold])

    const scrollToTop = useCallback(() => {
        // Smooth scrolling is skipped for users who asked the OS to reduce motion.
        const reduceMotion =
            typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({top: 0, behavior: smooth && !reduceMotion ? 'smooth' : 'instant'})
    }, [smooth])

    return (
        <MButton
            variant={variant}
            color={color}
            shape="circle"
            size="lg"
            iconOnly
            onClick={scrollToTop}
            aria-label={texts.scrollToTop}
            className={cn('scroll-top', visible && 'visible', className)}
            // While hidden (opacity 0) the button must leave the Tab order and the accessibility tree.
            inert={!visible}
        >
            <MArrowUpIcon />
        </MButton>
    )
}
