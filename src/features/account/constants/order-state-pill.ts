import type { MyOrderState } from '../types/responses/my-order.response'

export type OrderStateTone = 'ok' | 'warn' | 'off' | 'info'

// What the buyer reads for each state, with a tone and a mark so color is never the only cue.
export const ORDER_STATE_PILL: Record<
  MyOrderState,
  { text: string; tone: OrderStateTone; icon: string }
> = {
  ready: { text: 'Lista para descargar', tone: 'ok', icon: 'M5 12.5l4 4L19 7' },
  in_process: {
    text: 'Esperando pago',
    tone: 'warn',
    icon: 'M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
  },
  confirming: {
    text: 'Confirmando pago',
    tone: 'warn',
    icon: 'M12 7v5l3 2M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
  },
  cancelled: { text: 'Cancelada', tone: 'off', icon: 'M7 7l10 10M17 7 7 17' },
  gifted: {
    text: 'Regalo del organizador',
    tone: 'info',
    icon: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0',
  },
}
