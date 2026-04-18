import type { EventStatus } from '../types/responses/event-list.response'

export interface IStatusConfig {
  label: string
  type: 'default' | 'info' | 'warning' | 'success'
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, IStatusConfig> = {
  active: { label: 'Activo', type: 'success' },
  archived: { label: 'Archivado', type: 'default' },
}

export interface IFilterTab {
  label: string
  status: EventStatus | null
  enabled: boolean
}

export const EVENT_FILTER_TABS: IFilterTab[] = [
  { label: 'Todos', status: null, enabled: true },
  { label: 'Activos', status: 'active', enabled: true },
  { label: 'Archivados', status: 'archived', enabled: true },
]
