import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'

import { EVENTS_PATH } from '@/features/events/routes'

const root: IBreadcrumbItem = { label: 'Eventos', to: EVENTS_PATH }

export function galleryBreadcrumbs(eventId: string, eventName: string): IBreadcrumbItem[] {
  return [root, { label: eventName, to: `${EVENTS_PATH}/${eventId}` }, { label: 'Galería' }]
}

export function uploadBreadcrumbs(eventId: string, eventName: string): IBreadcrumbItem[] {
  return [root, { label: eventName, to: `${EVENTS_PATH}/${eventId}` }, { label: 'Subir Fotos' }]
}

export function detailBreadcrumbs(
  eventId: string,
  eventName: string,
  filename: string,
): IBreadcrumbItem[] {
  return [
    root,
    { label: eventName, to: `${EVENTS_PATH}/${eventId}` },
    { label: 'Galería', to: `${EVENTS_PATH}/${eventId}/photos` },
    { label: filename },
  ]
}
