import type {ElementType, HTMLAttributes, ReactNode} from 'react'
import type {MColor} from '../../../theme'
import type {MCardActionProps} from '../shared'

export type MCardPaymentBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'maestro' | 'unknown'

export interface MCardPaymentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, MCardActionProps {
    holder: string
    number: string
    expiry: string
    brand?: MCardPaymentBrand
    brandIcon?: ReactNode
    balance?: string
    balanceLabel?: string
    /** Caption above the holder name. Defaults to `mineralui.cardPayment.cardHolder` ("Card holder"). */
    holderLabel?: string
    /** Caption above the expiry date. Defaults to `mineralui.cardPayment.expirationDate` ("Expiration date"). */
    expiryLabel?: string
    color?: MColor
}
