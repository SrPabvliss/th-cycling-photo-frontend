import type { EventStatus } from '../types/responses/event-list.response'

export interface IStatusConfig {
  label: string
  type: 'default' | 'info' | 'warning' | 'success'
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, IStatusConfig> = {
  draft: { label: 'Borrador', type: 'default' },
  uploading: { label: 'Subiendo', type: 'info' },
  processing: { label: 'Procesando', type: 'warning' },
  completed: { label: 'Completado', type: 'success' },
}

export interface IFilterTab {
  label: string
  status: EventStatus | null
  enabled: boolean
}

export const EVENT_FILTER_TABS: IFilterTab[] = [
  { label: 'Todos', status: null, enabled: true },
  { label: 'Completados', status: 'completed', enabled: false },
  { label: 'Procesando', status: 'processing', enabled: false },
  { label: 'Borradores', status: 'draft', enabled: false },
]
