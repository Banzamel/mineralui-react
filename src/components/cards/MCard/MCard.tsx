import type {MCardProps, MCardSectionProps} from './MCard.types'
import {cn} from '../../../utils/cn'
import {useInteractionEffect} from '../../../utils/useInteractionEffect'
import {MSurface} from '../../layout'
import {MSkeleton} from '../../feedback'
import {resolveMCardAction} from '../shared'
import './MCard.css'
import '../shared/MCardShared.css'

// Compose elevated content blocks that can optionally behave like an interactive surface.
export function MCard({
    component,
    to,
    href,
    target,
    rel,
    interactive = false,
    stretch = true,
    tone = 'raised',
    padded = false,
    color,
    clickEffect,
    rippleColor,
    skeleton = false,
    spacing,
    mt,
    mb,
    ml,
    mr,
    mx,
    my,
    className,
    children,
    onPointerDown,
    ...rest
}: MCardProps) {
    const {
        component: surfaceComponent,
        href: resolvedHref,
        to: resolvedTo,
        isInteractive,
    } = resolveMCardAction({
        component,
        href,
        to,
        interactive,
        hasClickHandler: Boolean(rest.onClick),
        hasPointerHandler: Boolean(onPointerDown),
    })
    const {effectClassName, effectLayer, handlePointerDown} = useInteractionEffect<HTMLDivElement>({
        effect: clickEffect ?? (isInteractive ? 'ripple' : 'none'),
        disabled: !isInteractive || skeleton,
        color: rippleColor,
    })

    return (
        <MSurface
            component={surfaceComponent}
            href={resolvedHref}
            to={resolvedTo}
            target={target}
            rel={rel}
            tone={tone}
            padded={padded}
            spacing={spacing}
            mt={mt}
            mb={mb}
            ml={ml}
            mr={mr}
            mx={mx}
            my={my}
            className={cn(
                'card',
                !stretch && 'no-stretch',
                color && `color-${color}`,
                isInteractive && !skeleton && 'interactive',
                skeleton && 'skeleton',
                effectClassName,
                className
            )}
            onPointerDown={(event) => {
                handlePointerDown(event)
                onPointerDown?.(event)
            }}
            {...rest}
        >
            {effectLayer}
            {skeleton ? (
                <div className="card-skeleton-content">
                    <MSkeleton variant="rectangle" height="8rem" />
                    <MSkeleton variant="text" lines={3} className="card-skeleton-lines" />
                </div>
            ) : (
                children
            )}
        </MSurface>
    )
}

// Render the top section of a card.
export function MCardHeader({className, children, ...rest}: MCardSectionProps) {
    return (
        <div className={cn('header', className)} {...rest}>
            {children}
        </div>
    )
}

// Render the main content section of a card.
export function MCardBody({className, children, ...rest}: MCardSectionProps) {
    return (
        <div className={cn('body', className)} {...rest}>
            {children}
        </div>
    )
}

// Render the bottom section of a card.
export function MCardFooter({className, children, ...rest}: MCardSectionProps) {
    return (
        <div className={cn('footer', className)} {...rest}>
            {children}
        </div>
    )
}
