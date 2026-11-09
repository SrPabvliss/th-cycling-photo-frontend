import { payphoneGateway } from './payphone'
import type { IPaymentGateway } from './types'

export const DEFAULT_PAYMENT_PROVIDER = payphoneGateway.provider

const PAYMENT_GATEWAYS: Record<string, IPaymentGateway> = {
  [payphoneGateway.provider]: payphoneGateway,
}

export function findPaymentGateway(provider: string): IPaymentGateway | null {
  return PAYMENT_GATEWAYS[provider] ?? null
}
