import {
  CheckmarkCircleOutline,
  CloseCircleOutline,
  GiftOutline,
  TimeOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'

import type { MyOrderState } from '../types/responses/my-order.response'

export interface IOrderStateConfig {
  label: string
  color: string
  textColor: string
  icon: Component
}

export const ORDER_STATE_CONFIG: Record<MyOrderState, IOrderStateConfig> = {
  in_process: { label: 'En proceso', color: '#f0a020', textColor: '#8a540d', icon: TimeOutline },
  ready: { label: 'Lista', color: '#18a058', textColor: '#0e6837', icon: CheckmarkCircleOutline },
  gifted: { label: 'Regalada', color: '#7c3aed', textColor: '#5b21b6', icon: GiftOutline },
  cancelled: {
    label: 'Cancelada',
    color: '#909399',
    textColor: '#4b5563',
    icon: CloseCircleOutline,
  },
}
