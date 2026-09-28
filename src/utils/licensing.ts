export type MineralPlan = 'free' | 'pro'

export interface MineralComponentLicense {
    group: 'cards' | 'charts' | 'calendar' | 'data' | 'display' | 'media' | 'icons' | 'layout' | 'feedback'
    plan: MineralPlan
}

export const mineralComponentLicenses = {} as const satisfies Record<string, MineralComponentLicense>

export type MineralProComponentName = keyof typeof mineralComponentLicenses

export const mineralProComponents = Object.keys(mineralComponentLicenses) as MineralProComponentName[]

export function isMineralProComponent(componentName: string): componentName is MineralProComponentName {
    return Object.prototype.hasOwnProperty.call(mineralComponentLicenses, componentName)
}

export function getMineralComponentLicense(componentName: string): MineralComponentLicense | undefined {
    if (!isMineralProComponent(componentName)) {
        return undefined
    }

    return mineralComponentLicenses[componentName]
}

export function getMineralComponentPlan(componentName: string): MineralPlan {
    return getMineralComponentLicense(componentName)?.plan ?? 'free'
}
