import {defineConfig, type Plugin} from 'vite'
import {resolve} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import dts from 'vite-plugin-dts'

const packageManifest = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const isProPackage = packageManifest.name === '@banzamel/mineralui-pro'

// Build one shared style runtime and attach it to every public entry once.
// This keeps subpath exports small while preserving automatic style injection.
function cssAutoInject(entryNames: string[]): Plugin {
    return {
        name: 'mineral-css-auto-inject',
        apply: 'build',
        closeBundle() {
            const distDir = resolve(__dirname, 'dist')
            let css: string
            try {
                css = readFileSync(resolve(distDir, 'styles.css'), 'utf-8')
            } catch {
                return
            }

            const escaped = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

            const runtimes = [
                {
                    file: 'style-runtime.js',
                    include: (file: string) => `${file}.js`,
                    prefix: 'import {ensureStyles} from \'./style-runtime.js\'\nensureStyles()\n',
                    code: [
                        'export function ensureStyles(){',
                        'if(typeof document!=="undefined"){',
                        'let s=document.getElementById("mineral-ui-styles");',
                        'if(!s){s=document.createElement("style");',
                        's.id="mineral-ui-styles";',
                        `s.textContent=\`${escaped}\`;`,
                        'document.head.appendChild(s)}}',
                        '}',
                    ].join(''),
                },
                {
                    file: 'style-runtime.cjs',
                    include: (file: string) => `${file}.cjs`,
                    prefix: 'const {ensureStyles}=require(\'./style-runtime.cjs\')\nensureStyles()\n',
                    code: [
                        'function ensureStyles(){',
                        'if(typeof document!=="undefined"){',
                        'let s=document.getElementById("mineral-ui-styles");',
                        'if(!s){s=document.createElement("style");',
                        's.id="mineral-ui-styles";',
                        `s.textContent=\`${escaped}\`;`,
                        'document.head.appendChild(s)}}',
                        '}',
                        'exports.ensureStyles=ensureStyles',
                    ].join(''),
                },
            ]

            for (const runtime of runtimes) {
                const runtimePath = resolve(distDir, runtime.file)
                writeFileSync(runtimePath, runtime.code)

                for (const entryName of entryNames) {
                    const entryPath = resolve(distDir, runtime.include(entryName))

                    try {
                        const code = readFileSync(entryPath, 'utf-8')

                        if (!code.startsWith(runtime.prefix)) {
                            writeFileSync(entryPath, runtime.prefix + code)
                        }
                    } catch {
                        /* skip if file doesn't exist */
                    }
                }
            }

            if (!isProPackage) {
                return
            }

            const warningMessage = JSON.stringify(
                [
                    '[MineralUI Pro] This project is using the private Pro package, but the installation is not registered yet.',
                    'Run `node ./node_modules/@banzamel/mineralui-pro/bin/mineralui-pro.js activate --license-key=YOUR_LICENSE_KEY` to register this project in your license portal.',
                ].join(' ')
            )

            const activationRuntimes = [
                {
                    file: 'pro-activation-runtime.js',
                    include: (file: string) => `${file}.js`,
                    prefix: 'import \'./pro-activation-runtime.js\'\n',
                    code: [
                        'const activationState={',
                        'activated:false,',
                        `packageName:${JSON.stringify(packageManifest.name)},`,
                        `packageVersion:${JSON.stringify(packageManifest.version ?? null)},`,
                        'projectName:null,',
                        'environment:null,',
                        'hostname:null,',
                        'instanceId:null,',
                        'activationId:null,',
                        'activatedAt:null,',
                        `apiBaseUrl:${JSON.stringify('https://api.mineralui.io')}`,
                        '}',
                        'function applyMineralProActivationState(){',
                        'if(typeof window==="undefined"){return}',
                        'if(activationState.activated){window.__MINERAL_PRO_ACTIVATED__=true;return}',
                        'if(window.__MINERAL_PRO_ACTIVATION_WARNING_SHOWN__===true){return}',
                        'window.__MINERAL_PRO_ACTIVATION_WARNING_SHOWN__=true',
                        `console.warn(${warningMessage})`,
                        '}',
                        'applyMineralProActivationState()',
                        'export {activationState,applyMineralProActivationState}',
                    ].join('\n'),
                },
                {
                    file: 'pro-activation-runtime.cjs',
                    include: (file: string) => `${file}.cjs`,
                    prefix: 'require(\'./pro-activation-runtime.cjs\')\n',
                    code: [
                        'const activationState={',
                        'activated:false,',
                        `packageName:${JSON.stringify(packageManifest.name)},`,
                        `packageVersion:${JSON.stringify(packageManifest.version ?? null)},`,
                        'projectName:null,',
                        'environment:null,',
                        'hostname:null,',
                        'instanceId:null,',
                        'activationId:null,',
                        'activatedAt:null,',
                        `apiBaseUrl:${JSON.stringify('https://api.mineralui.io')}`,
                        '}',
                        'function applyMineralProActivationState(){',
                        'if(typeof window==="undefined"){return}',
                        'if(activationState.activated){window.__MINERAL_PRO_ACTIVATED__=true;return}',
                        'if(window.__MINERAL_PRO_ACTIVATION_WARNING_SHOWN__===true){return}',
                        'window.__MINERAL_PRO_ACTIVATION_WARNING_SHOWN__=true',
                        `console.warn(${warningMessage})`,
                        '}',
                        'applyMineralProActivationState()',
                        'exports.activationState=activationState',
                        'exports.applyMineralProActivationState=applyMineralProActivationState',
                    ].join('\n'),
                },
            ]

            for (const runtime of activationRuntimes) {
                const runtimePath = resolve(distDir, runtime.file)
                writeFileSync(runtimePath, runtime.code)

                for (const entryName of entryNames) {
                    const entryPath = resolve(distDir, runtime.include(entryName))

                    try {
                        const code = readFileSync(entryPath, 'utf-8')

                        if (!code.startsWith(runtime.prefix)) {
                            writeFileSync(entryPath, runtime.prefix + code)
                        }
                    } catch {
                        /* skip if file doesn't exist */
                    }
                }
            }
        },
    }
}

const entryMap = {
    index: resolve(__dirname, 'src/index.ts'),
    layout: resolve(__dirname, 'src/layout.ts'),
    controls: resolve(__dirname, 'src/controls.ts'),
    icons: resolve(__dirname, 'src/icons/index.ts'),
    illustrations: resolve(__dirname, 'src/illustrations/index.ts'),
    cards: resolve(__dirname, 'src/cards.ts'),
    data: resolve(__dirname, 'src/data.ts'),
    calendar: resolve(__dirname, 'src/calendar.ts'),
    display: resolve(__dirname, 'src/display.ts'),
    dropdowns: resolve(__dirname, 'src/dropdowns.ts'),
    feedback: resolve(__dirname, 'src/feedback.ts'),
    form: resolve(__dirname, 'src/form.ts'),
    inputs: resolve(__dirname, 'src/inputs.ts'),
    media: resolve(__dirname, 'src/media.ts'),
    overlays: resolve(__dirname, 'src/overlays.ts'),
    primitives: resolve(__dirname, 'src/primitives.ts'),
    typography: resolve(__dirname, 'src/typography.ts'),
    theme: resolve(__dirname, 'src/theme/index.ts'),
    i18n: resolve(__dirname, 'src/i18n/index.ts'),
    utils: resolve(__dirname, 'src/utils.entry.ts'),
}

// All entries in 2.0.0 are React-facing — the cookie-consent-bootstrap subpath
// moved to @banzamel/honey/cookie-consent-bootstrap and no longer ships here.
const styleInjectedEntries = Object.keys(entryMap)

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: false,
        }),
        cssAutoInject(styleInjectedEntries),
    ],
    build: {
        lib: {
            entry: entryMap,
            name: 'MineralUI',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
                assetFileNames: 'styles.css',
            },
        },
        cssCodeSplit: false,
        sourcemap: true,
    },
})
