# MineralUI

Modern React UI framework with a sharp admin aesthetic, theming system, and production-ready components.

- npm: `@banzamel/mineralui`
- version: `2.4.3`
- peer dependencies: `react >= 19`, `react-dom >= 19`
- repository: `https://github.com/Banzamel/mineralui-react`
- homepage: `https://mineralui.io`

## Installation

```bash
npm install @banzamel/mineralui
```

No separate CSS import is required.

## What MineralUI Basic includes

- production-ready React UI components for dashboards, admin panels, forms, and internal tools
- theming with CSS variables and dark/light mode support
- layout primitives, overlays, inputs, feedback components, media, cards, and utilities
- tree-shakeable grouped subpath exports
- bundled styles with automatic runtime injection

## Quick Start

```tsx
import {MThemeProvider, MCard, MCardHeader, MCardBody, MInput, MButton} from '@banzamel/mineralui'

export function Example() {
    return (
        <MThemeProvider mode="dark">
            <MCard>
                <MCardHeader title="Workspace settings" />
                <MCardBody>
                    <MInput label="Workspace name" placeholder="Banzamel Studio" fullWidth />
                    <MButton>Save changes</MButton>
                </MCardBody>
            </MCard>
        </MThemeProvider>
    )
}
```

## Popular grouped imports

```tsx
import {MButton, MCheckbox} from '@banzamel/mineralui/controls'
import {MCard, MCardBody} from '@banzamel/mineralui/cards'
import {MDataTable} from '@banzamel/mineralui/data'
import {MThemeProvider} from '@banzamel/mineralui/theme'
```

## Documentation

- website: `https://mineralui.io`
- docs: `https://mineralui.io/docs`

## Basic vs Pro

This package is the public Basic edition of MineralUI.
Premium components, templates, package access, and installation tooling are distributed separately in MineralUI Pro.
