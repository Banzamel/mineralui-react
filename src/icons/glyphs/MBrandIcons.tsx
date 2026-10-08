import {forwardRef, useId} from 'react'
import type {ReactNode} from 'react'
import {MIcon} from '../MIcon'
import type {MIconProps} from '../MIcon.types'

function makeBrandIcon(name: string, body: ReactNode | ((uid: string) => ReactNode)) {
    const BrandIcon = forwardRef<SVGSVGElement, MIconProps>(function BrandIcon(props, ref) {
        // Per-instance id so glyphs with <defs> (gradients) never share an id on one page.
        const uid = useId().replace(/:/g, '')
        return (
            <MIcon ref={ref} {...props}>
                {typeof body === 'function' ? body(uid) : body}
            </MIcon>
        )
    })

    BrandIcon.displayName = name

    return BrandIcon
}

export const MGoogleIcon = makeBrandIcon(
    'MGoogleIcon',
    <path
        d="M18.8 12.25c0 3.95-2.72 6.8-6.76 6.8A7.1 7.1 0 0 1 4.9 12a7.1 7.1 0 0 1 7.15-7.05c1.96 0 3.58.72 4.83 1.9l-1.97 1.9A4.1 4.1 0 0 0 12.05 7.6a4.35 4.35 0 0 0-4.37 4.4 4.35 4.35 0 0 0 4.37 4.4c2.53 0 3.48-1.8 3.64-2.75h-3.64v-2.7h6.53c.16.45.22.86.22 1.3z"
        fill="currentColor"
        stroke="none"
    />
)

export const MGoogleColorIcon = makeBrandIcon(
    'MGoogleColorIcon',
    <>
        <path
            d="M12.05 7.6c1.1 0 2.1.39 2.86 1.14l1.97-1.9a6.78 6.78 0 0 0-4.83-1.9 7.1 7.1 0 0 0-6.4 4.06l2.26 1.73A4.37 4.37 0 0 1 12.05 7.6z"
            fill="#ea4335"
            stroke="none"
        />
        <path
            d="M18.8 12.25c0-.44-.06-.85-.18-1.3h-6.57v2.7h3.64c-.16.95-1.1 2.75-3.64 2.75a4.35 4.35 0 0 1-4.38-4.4c0-.46.07-.9.24-1.3L5.65 9A7.15 7.15 0 0 0 4.9 12a7.1 7.1 0 0 0 7.15 7.05c4.04 0 6.76-2.85 6.76-6.8z"
            fill="#4285f4"
            stroke="none"
        />
        <path d="M7.91 10.7A4.38 4.38 0 0 1 12.05 7.6V4.95A7.1 7.1 0 0 0 5.65 9z" fill="#fbbc05" stroke="none" />
        <path
            d="M12.05 19.05a6.78 6.78 0 0 0 4.62-1.72l-2.24-1.74a4.2 4.2 0 0 1-2.38.81 4.35 4.35 0 0 1-4.14-3.04L5.65 15a7.12 7.12 0 0 0 6.4 4.05z"
            fill="#34a853"
            stroke="none"
        />
    </>
)

export const MFacebookIcon = makeBrandIcon(
    'MFacebookIcon',
    <>
        <path
            d="M7.25 4.5h9.5a2.75 2.75 0 0 1 2.75 2.75v9.5a2.75 2.75 0 0 1-2.75 2.75h-9.5A2.75 2.75 0 0 1 4.5 16.75v-9.5A2.75 2.75 0 0 1 7.25 4.5z"
            fill="currentColor"
            stroke="none"
        />
        <path
            d="M13.1 19.5v-5.45h1.82l.28-2.2H13.1v-1.4c0-.7.24-1.24 1.22-1.24h1V7.2c-.36-.05-.98-.1-1.82-.1-2.07 0-3.28 1.1-3.28 3.4v1.35H8.5v2.2h1.72v5.45z"
            fill="#fff"
            stroke="none"
        />
    </>
)

export const MFacebookColorIcon = makeBrandIcon(
    'MFacebookColorIcon',
    <>
        <path
            d="M7.25 4.5h9.5a2.75 2.75 0 0 1 2.75 2.75v9.5a2.75 2.75 0 0 1-2.75 2.75h-9.5A2.75 2.75 0 0 1 4.5 16.75v-9.5A2.75 2.75 0 0 1 7.25 4.5z"
            fill="#1877f2"
            stroke="none"
        />
        <path
            d="M13.1 19.5v-5.45h1.82l.28-2.2H13.1v-1.4c0-.7.24-1.24 1.22-1.24h1V7.2c-.36-.05-.98-.1-1.82-.1-2.07 0-3.28 1.1-3.28 3.4v1.35H8.5v2.2h1.72v5.45z"
            fill="#fff"
            stroke="none"
        />
    </>
)

export const MInstagramIcon = makeBrandIcon(
    'MInstagramIcon',
    <>
        <rect x="4.8" y="4.8" width="14.4" height="14.4" rx="4.2" fill="none" />
        <circle cx="12" cy="12" r="3.15" />
        <circle cx="16.15" cy="7.95" r="0.85" fill="currentColor" stroke="none" />
    </>
)

export const MInstagramColorIcon = makeBrandIcon('MInstagramColorIcon', (uid) => (
    <>
        <defs>
            <linearGradient id={`instagram-brand-${uid}`} x1="5" y1="19" x2="19" y2="5" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f59e0b" />
                <stop offset="0.45" stopColor="#ef4444" />
                <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        <rect x="4.8" y="4.8" width="14.4" height="14.4" rx="4.2" fill={`url(#instagram-brand-${uid})`} stroke="none" />
        <rect x="7.3" y="7.3" width="9.4" height="9.4" rx="3.1" stroke="#fff" />
        <circle cx="12" cy="12" r="2.75" stroke="#fff" />
        <circle cx="16.1" cy="7.95" r="0.8" fill="#fff" stroke="none" />
    </>
))

export const MLinkedInIcon = makeBrandIcon(
    'MLinkedInIcon',
    <>
        <path
            d="M6.3 4.5h11.4a2.4 2.4 0 0 1 2.4 2.4v11.4a2.4 2.4 0 0 1-2.4 2.4H6.3a2.4 2.4 0 0 1-2.4-2.4V6.9a2.4 2.4 0 0 1 2.4-2.4z"
            fill="currentColor"
            stroke="none"
        />
        <path
            d="M8.1 10.05h2v7.1h-2zM9.1 6.95a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM11.75 10.05h1.92v.97c.33-.59 1.06-1.12 2.08-1.12 2.1 0 2.75 1.39 2.75 3.7v3.55h-2v-3.2c0-.96-.34-1.63-1.2-1.63-.64 0-1.03.44-1.2.86-.07.15-.08.37-.08.58v3.39h-2.27z"
            fill="#fff"
            stroke="none"
        />
    </>
)

export const MLinkedInColorIcon = makeBrandIcon(
    'MLinkedInColorIcon',
    <>
        <path
            d="M6.3 4.5h11.4a2.4 2.4 0 0 1 2.4 2.4v11.4a2.4 2.4 0 0 1-2.4 2.4H6.3a2.4 2.4 0 0 1-2.4-2.4V6.9a2.4 2.4 0 0 1 2.4-2.4z"
            fill="#0a66c2"
            stroke="none"
        />
        <path
            d="M8.1 10.05h2v7.1h-2zM9.1 6.95a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM11.75 10.05h1.92v.97c.33-.59 1.06-1.12 2.08-1.12 2.1 0 2.75 1.39 2.75 3.7v3.55h-2v-3.2c0-.96-.34-1.63-1.2-1.63-.64 0-1.03.44-1.2.86-.07.15-.08.37-.08.58v3.39h-2.27z"
            fill="#fff"
            stroke="none"
        />
    </>
)

export const MYouTubeIcon = makeBrandIcon(
    'MYouTubeIcon',
    <>
        <path
            d="M19.65 9.3c-.18-1.13-.96-1.98-2.02-2.15C16.55 6.99 14.86 6.9 12 6.9s-4.55.09-5.63.25c-1.06.17-1.84 1.02-2.02 2.15-.16 1.07-.16 1.84-.16 2.7s0 1.63.16 2.7c.18 1.13.96 1.98 2.02 2.15 1.08.16 2.77.25 5.63.25s4.55-.09 5.63-.25c1.06-.17 1.84-1.02 2.02-2.15.16-1.07.16-1.84.16-2.7s0-1.63-.16-2.7z"
            fill="currentColor"
            stroke="none"
        />
        <path d="M10.4 9.55 14.9 12l-4.5 2.45z" fill="#fff" stroke="none" />
    </>
)

export const MYouTubeColorIcon = makeBrandIcon(
    'MYouTubeColorIcon',
    <>
        <path
            d="M19.65 9.3c-.18-1.13-.96-1.98-2.02-2.15C16.55 6.99 14.86 6.9 12 6.9s-4.55.09-5.63.25c-1.06.17-1.84 1.02-2.02 2.15-.16 1.07-.16 1.84-.16 2.7s0 1.63.16 2.7c.18 1.13.96 1.98 2.02 2.15 1.08.16 2.77.25 5.63.25s4.55-.09 5.63-.25c1.06-.17 1.84-1.02 2.02-2.15.16-1.07.16-1.84.16-2.7s0-1.63-.16-2.7z"
            fill="#ff0033"
            stroke="none"
        />
        <path d="M10.4 9.55 14.9 12l-4.5 2.45z" fill="#fff" stroke="none" />
    </>
)

export const MGitHubIcon = makeBrandIcon(
    'MGitHubIcon',
    <>
        <circle cx="12" cy="12" r="8.5" fill="currentColor" stroke="none" />
        <path
            d="M8.45 16.95v-1.25c-.95.26-1.58-.21-1.92-.73-.21-.34-.41-.73-.73-.96-.2-.15-.13-.31.14-.3.58.02.97.4 1.28.82.44.57.98.72 1.63.72.14-.57.44-.97.78-1.2-2.23-.26-3.4-1.32-3.4-3.44 0-.94.34-1.72.91-2.34-.1-.35-.23-1.08.1-1.96 0 0 .78-.25 2.5.9a8.7 8.7 0 0 1 4.52 0c1.72-1.15 2.5-.9 2.5-.9.33.88.2 1.61.1 1.96.57.62.91 1.4.91 2.34 0 2.13-1.18 3.19-3.44 3.44.49.34.89 1 .89 2.03v1.87"
            fill="#fff"
            stroke="none"
        />
        <path
            d="M9.1 9.2c.38-.72.97-1.02 1.52-1.02.63 0 1.15.3 1.38.83.25-.53.78-.83 1.4-.83.54 0 1.12.3 1.5 1.02"
            stroke="#fff"
        />
        <path d="M9.35 10.95c1.52 1.2 3.78 1.2 5.3 0" stroke="#fff" />
    </>
)

export const MGitHubColorIcon = makeBrandIcon(
    'MGitHubColorIcon',
    <>
        <circle cx="12" cy="12" r="8.5" fill="#111827" stroke="none" />
        <path
            d="M8.45 16.95v-1.25c-.95.26-1.58-.21-1.92-.73-.21-.34-.41-.73-.73-.96-.2-.15-.13-.31.14-.3.58.02.97.4 1.28.82.44.57.98.72 1.63.72.14-.57.44-.97.78-1.2-2.23-.26-3.4-1.32-3.4-3.44 0-.94.34-1.72.91-2.34-.1-.35-.23-1.08.1-1.96 0 0 .78-.25 2.5.9a8.7 8.7 0 0 1 4.52 0c1.72-1.15 2.5-.9 2.5-.9.33.88.2 1.61.1 1.96.57.62.91 1.4.91 2.34 0 2.13-1.18 3.19-3.44 3.44.49.34.89 1 .89 2.03v1.87"
            fill="#fff"
            stroke="none"
        />
        <path
            d="M9.1 9.2c.38-.72.97-1.02 1.52-1.02.63 0 1.15.3 1.38.83.25-.53.78-.83 1.4-.83.54 0 1.12.3 1.5 1.02"
            stroke="#fff"
        />
        <path d="M9.35 10.95c1.52 1.2 3.78 1.2 5.3 0" stroke="#fff" />
    </>
)

export const MDiscordIcon = makeBrandIcon(
    'MDiscordIcon',
    <>
        <path
            d="M7.35 7.55c1.15-.78 2.4-1.23 3.7-1.35l.47.96c.33-.05.66-.07.98-.07s.65.02.98.07l.47-.96c1.3.12 2.55.57 3.7 1.35 1.18 1.78 1.83 3.72 1.95 5.85-.83.96-1.85 1.64-3.05 2.1l-.66-1.07c-.42.24-.86.42-1.34.55-.8.22-1.62.33-2.45.33s-1.65-.11-2.45-.33c-.48-.13-.92-.31-1.34-.55l-.66 1.07c-1.2-.46-2.22-1.14-3.05-2.1.12-2.13.77-4.07 1.95-5.85z"
            fill="currentColor"
            stroke="none"
        />
        <path
            d="M9.8 12.35a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8zM14.2 12.35a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8z"
            fill="#fff"
            stroke="none"
        />
        <path d="M9.55 13.55c1.55.88 3.35.88 4.9 0" stroke="#fff" />
    </>
)

export const MDiscordColorIcon = makeBrandIcon(
    'MDiscordColorIcon',
    <>
        <path
            d="M7.35 7.55c1.15-.78 2.4-1.23 3.7-1.35l.47.96c.33-.05.66-.07.98-.07s.65.02.98.07l.47-.96c1.3.12 2.55.57 3.7 1.35 1.18 1.78 1.83 3.72 1.95 5.85-.83.96-1.85 1.64-3.05 2.1l-.66-1.07c-.42.24-.86.42-1.34.55-.8.22-1.62.33-2.45.33s-1.65-.11-2.45-.33c-.48-.13-.92-.31-1.34-.55l-.66 1.07c-1.2-.46-2.22-1.14-3.05-2.1.12-2.13.77-4.07 1.95-5.85z"
            fill="#5865f2"
            stroke="none"
        />
        <path
            d="M9.8 12.35a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8zM14.2 12.35a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8z"
            fill="#fff"
            stroke="none"
        />
        <path d="M9.55 13.55c1.55.88 3.35.88 4.9 0" stroke="#fff" />
    </>
)

export const MFigmaIcon = makeBrandIcon(
    'MFigmaIcon',
    <>
        <rect x="8" y="4.3" width="4" height="5.2" rx="2.1" fill="currentColor" stroke="none" />
        <rect x="8" y="9.4" width="4" height="5.2" rx="2.1" fill="currentColor" stroke="none" />
        <rect x="8" y="14.5" width="4" height="5.2" rx="2.1" fill="currentColor" stroke="none" />
        <rect x="12" y="4.3" width="4" height="5.2" rx="2.1" fill="currentColor" stroke="none" />
        <circle cx="14" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </>
)

export const MFigmaColorIcon = makeBrandIcon(
    'MFigmaColorIcon',
    <>
        <rect x="8" y="4.3" width="4" height="5.2" rx="2.1" fill="#f24e1e" stroke="none" />
        <rect x="8" y="9.4" width="4" height="5.2" rx="2.1" fill="#a259ff" stroke="none" />
        <rect x="8" y="14.5" width="4" height="5.2" rx="2.1" fill="#0acf83" stroke="none" />
        <rect x="12" y="4.3" width="4" height="5.2" rx="2.1" fill="#ff7262" stroke="none" />
        <circle cx="14" cy="12" r="2.6" fill="#1abcfe" stroke="none" />
    </>
)

export const MXIcon = makeBrandIcon(
    'MXIcon',
    <path
        d="M6.3 4.5h2.7l3.35 4.58L16.1 4.5h1.6l-4.55 5.54 4.65 6.46H15.1l-3.61-4.98L7.48 16.5h-1.6l4.65-5.67z"
        fill="currentColor"
        stroke="none"
    />
)

export const MXColorIcon = makeBrandIcon(
    'MXColorIcon',
    <path
        d="M6.3 4.5h2.7l3.35 4.58L16.1 4.5h1.6l-4.55 5.54 4.65 6.46H15.1l-3.61-4.98L7.48 16.5h-1.6l4.65-5.67z"
        fill="#111827"
        stroke="none"
    />
)

export const MSlackIcon = makeBrandIcon(
    'MSlackIcon',
    <>
        <rect x="10.2" y="4.3" width="3.2" height="7.1" rx="1.6" fill="currentColor" stroke="none" />
        <rect x="12.6" y="10.2" width="7.1" height="3.2" rx="1.6" fill="currentColor" stroke="none" />
        <rect x="10.6" y="12.6" width="3.2" height="7.1" rx="1.6" fill="currentColor" stroke="none" />
        <rect x="4.3" y="10.6" width="7.1" height="3.2" rx="1.6" fill="currentColor" stroke="none" />
    </>
)

export const MSlackColorIcon = makeBrandIcon(
    'MSlackColorIcon',
    <>
        <rect x="10.2" y="4.3" width="3.2" height="7.1" rx="1.6" fill="#36c5f0" stroke="none" />
        <rect x="12.6" y="10.2" width="7.1" height="3.2" rx="1.6" fill="#2eb67d" stroke="none" />
        <rect x="10.6" y="12.6" width="3.2" height="7.1" rx="1.6" fill="#ecb22e" stroke="none" />
        <rect x="4.3" y="10.6" width="7.1" height="3.2" rx="1.6" fill="#e01e5a" stroke="none" />
    </>
)
