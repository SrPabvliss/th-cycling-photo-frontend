import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'
import { EVENTS_PATH } from '@/features/events/routes'

const root: IBreadcrumbItem = { label: 'Eventos', to: EVENTS_PATH }

export function classifyBreadcrumbs(eventId: string, eventName: string): IBreadcrumbItem[] {
  return [root, { label: eventName, to: `${EVENTS_PATH}/${eventId}` }, { label: 'Clasificar' }]
}
