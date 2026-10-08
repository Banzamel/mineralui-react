// Styles
import './theme/index.css'

// Theme
export * from './theme'

// I18n
export {MI18nProvider, useMI18n, useMValidationMessage} from './i18n'
export type {MI18nProviderProps, MI18nContextValue} from './i18n'

// Icons
export * from './icons.entry'

// Illustrations
export * from './illustrations.entry'

// Utils
export {cn} from './utils/cn'
export {
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validatePattern,
    validateRange,
    validateEmail,
    validatePhone,
    validateIBAN,
    validateNIP,
    validatePESEL,
    validateREGON,
    validatePostCode,
    validateCardNumber,
    composeValidators,
} from './utils/validators'
export type {ValidationResult, ValidatorFn} from './utils/validators'
export {getValidationMessageInfo} from './utils/validationMessages'
export type {ValidationMessageInfo, ValidationMessageParams} from './utils/validationMessages'
export {
    formatPostCode,
    formatIBAN,
    formatCardNumber,
    unformatIBAN,
    formatPhone,
    formatNIP,
    formatCurrency,
    parseCurrencyToNumber,
    stripNonDigits,
    stripNonAlphanumeric,
    capitalizeWords,
    adjustCursorAfterFormat,
} from './utils/formatters'
export type {PhoneFormatOptions, CurrencyFormatOptions} from './utils/formatters'
export {getPostCodeRule, postCodeCountries, postCodeRules} from './utils/postalCodes'
export type {PostCodeRule} from './utils/postalCodes'
export {creditCardBrands, detectCardBrand, stripCardNumber} from './utils/creditCards'
export type {CreditCardBrand, CreditCardBrandDetails} from './utils/creditCards'
export {
    formatDate,
    parseDate,
    daysInMonth,
    firstDayOfMonth,
    isSameDay,
    isDateInRange,
    stripTime,
    addMonths,
    addYears,
    getDayNames,
    getMonthNames,
    parseTime,
    formatTime,
} from './utils/dateUtils'
export {
    formatRelativeTime,
    formatAbsoluteTime,
    getRelativeTimeValue,
    getAutoUpdateInterval,
    parseRelativeThreshold,
    toDate,
} from './utils/relativeTime'
export type {RelativeTimeFallbackFormat, RelativeTimeUnit, RelativeTimeValue} from './utils/relativeTime'
export {useDebounce, useDebouncedCallback} from './utils/useDebounce'
export {useClickOutside} from './utils/useClickOutside'
export {useKeyboardNav} from './utils/useKeyboardNav'
export type {
    UseKeyboardNavOptions,
    UseKeyboardNavMode,
    UseKeyboardNavOrientation,
    UseKeyboardNavItemProps,
    UseKeyboardNavContainerProps,
    UseKeyboardNavResult,
} from './utils/useKeyboardNav'
export {useInteractionEffect} from './utils/useInteractionEffect'
export type {MClickEffect, UseInteractionEffectOptions, UseInteractionEffectResult} from './utils/useInteractionEffect'
export {useGhostText} from './utils/useGhostText'
export type {GhostTextOptions, GhostTextReturn} from './utils/useGhostText'
export {
    mineralComponentLicenses,
    mineralProComponents,
    isMineralProComponent,
    getMineralComponentLicense,
    getMineralComponentPlan,
} from './utils/licensing'
export type {MineralPlan, MineralComponentLicense, MineralProComponentName} from './utils/licensing'

// Primitives
export * from './primitives'

// Layout
export * from './layout'

// Controls
export * from './controls'

// Cards
export * from './cards'

// Data
export * from './data'

// Calendar
export * from './calendar'

// Feedback
export * from './feedback'

// Overlays
export * from './overlays'

// Media
export * from './media'

// Display
export * from './display'

// Typography
export * from './typography'

// Inputs
export * from './inputs'

// Dropdowns
export * from './dropdowns'

// MForm
export * from './form'
