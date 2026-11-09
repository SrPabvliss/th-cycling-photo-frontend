import type { IStatusBadgeConfig } from '@/shared/types/badge-config.types'
import type { EventStatus } from '@/shared/types/event.types'

export const EVENT_STATUS_CONFIG: Record<EventStatus, IStatusBadgeConfig> = {
  active: { label: 'Activo', type: 'success' },
  archived: { label: 'Archivado', type: 'default' },
}
