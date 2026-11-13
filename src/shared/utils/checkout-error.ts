import { isAxiosError } from 'axios'

/** What stopped an order from being created, in terms of what the buyer can do about it. */
export type CheckoutProblem =
  | 'consent'
  | 'billing'
  | 'profile'
  | 'card-unavailable'
  | 'cart-missing'
  | 'network'
  | 'unknown'

const PROBLEM_BY_KEY: Record<string, CheckoutProblem> = {
  'billing.invoice_consent_required': 'consent',
  'order.customer_profile_required': 'profile',
  'payment.card_unavailable': 'card-unavailable',
  // The server found no photos of this event in the cart. The order may exist already (back to
  // the checkout after ordering, a second tab), or the photos were taken out: it cannot tell.
  'cart.cart_empty': 'cart-missing',
  'cart.event_not_in_cart': 'cart-missing',
  'cart.no_active_cart': 'cart-missing',
}

interface IApiErrorBody {
  messageKey?: string
  fields?: Record<string, string[]>
}

/** Reads a failed order request (create it, or change how it is paid) as one problem. */
export function checkoutProblem(error: unknown): CheckoutProblem {
  if (!isAxiosError(error)) return 'unknown'
  if (!error.response) return 'network'

  const body = (error.response.data as { error?: IApiErrorBody } | undefined)?.error
  const key = body?.messageKey ?? ''

  if (PROBLEM_BY_KEY[key]) return PROBLEM_BY_KEY[key]
  if (key.startsWith('billing.')) return 'billing'
  if (body?.fields && Object.keys(body.fields).some((field) => field.startsWith('billing'))) {
    return 'billing'
  }
  return 'unknown'
}

const TEXT: Record<CheckoutProblem, { title: string; text: string }> = {
  consent: {
    title: 'Falta tu autorización de factura',
    text: 'Marca la casilla para que podamos emitir tu factura electrónica.',
  },
  billing: {
    title: 'Revisa tus datos de facturación',
    text: 'No pudimos usar esos datos. Elige otros o agrégalos de nuevo.',
  },
  profile: {
    title: 'Completa tu perfil',
    text: 'Necesitamos tu país de residencia para crear el pedido.',
  },
  'card-unavailable': {
    title: 'El pago con tarjeta no está disponible',
    text: 'Puedes pagar este pedido por transferencia.',
  },
  'cart-missing': {
    title: 'No encontramos estas fotos en tu carrito',
    text: 'Si ya confirmaste este pedido, está en Mis fotos. Si no, vuelve a la galería y agrégalas de nuevo.',
  },
  network: {
    title: 'No se pudo completar',
    text: 'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
  },
  unknown: { title: 'No se pudo completar', text: 'Intenta de nuevo en un momento.' },
}

export function checkoutProblemText(problem: CheckoutProblem): { title: string; text: string } {
  return TEXT[problem]
}
