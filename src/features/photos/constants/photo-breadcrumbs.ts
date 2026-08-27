import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

const root: IBreadcrumbItem = { label: 'Eventos', to: ROUTE_PATHS.EVENTS }

export function galleryBreadcrumbs(eventId: string, eventName: string): IBreadcrumbItem[] {
  return [root, { label: eventName, to: `${ROUTE_PATHS.EVENTS}/${eventId}` }, { label: 'Galería' }]
}

export function uploadBreadcrumbs(eventId: string, eventName: string): IBreadcrumbItem[] {
  return [root, { label: eventName, to: `${ROUTE_PATHS.EVENTS}/${eventId}` }, { label: 'Subir Fotos' }]
}

export function detailBreadcrumbs(
  eventId: string,
  eventName: string,
  filename: string,
): IBreadcrumbItem[] {
  return [
    root,
    { label: eventName, to: `${ROUTE_PATHS.EVENTS}/${eventId}` },
    { label: 'Galería', to: `${ROUTE_PATHS.EVENTS}/${eventId}/photos` },
    { label: filename },
  ]
}
