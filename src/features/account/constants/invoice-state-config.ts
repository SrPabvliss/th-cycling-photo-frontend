import {
  CheckmarkCircleOutline,
  CloseCircleOutline,
  RemoveCircleOutline,
  TimeOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'

import type { InvoiceStateValue } from '../types/responses/order-invoice.response'

export interface IInvoiceStateConfig {
  label: string
  color: string
  icon: Component
}

export const INVOICE_STATE_CONFIG: Record<InvoiceStateValue, IInvoiceStateConfig> = {
  requested: { label: 'Factura en proceso', color: '#f0a020', icon: TimeOutline },
  in_process: { label: 'Factura en proceso', color: '#f0a020', icon: TimeOutline },
  authorized: { label: 'Factura autorizada', color: '#18a058', icon: CheckmarkCircleOutline },
  rejected: { label: 'Factura rechazada', color: '#d03050', icon: CloseCircleOutline },
  annulled: { label: 'Factura anulada', color: '#909399', icon: RemoveCircleOutline },
}
