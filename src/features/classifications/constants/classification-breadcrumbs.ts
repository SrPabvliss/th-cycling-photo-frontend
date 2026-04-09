import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'
import { EVENTS_PATH } from '@/features/events/routes'
import { OPERATOR_PATH } from '@/features/operator/routes'

export function classifyBreadcrumbs(
  eventId: string,
  eventName: string,
  isOperator = false,
): IBreadcrumbItem[] {
  if (isOperator) {
    return [
      { label: 'Dashboard', to: OPERATOR_PATH },
      { label: eventName },
      { label: 'Clasificar' },
    ]
  }
  return [
    { label: 'Eventos', to: EVENTS_PATH },
    { label: eventName, to: `${EVENTS_PATH}/${eventId}` },
    { label: 'Clasificar' },
  ]
}
