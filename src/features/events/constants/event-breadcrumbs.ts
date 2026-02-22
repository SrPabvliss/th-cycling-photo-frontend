import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'

import { EVENTS_PATH } from '../routes'

const root: IBreadcrumbItem = { label: 'Eventos', to: EVENTS_PATH }

export function createBreadcrumbs(): IBreadcrumbItem[] {
  return [root, { label: 'Nuevo Evento' }]
}

export function detailBreadcrumbs(name: string): IBreadcrumbItem[] {
  return [root, { label: name }]
}

export function editBreadcrumbs(id: string, name: string): IBreadcrumbItem[] {
  return [root, { label: name, to: `${EVENTS_PATH}/${id}` }, { label: 'Editar' }]
}
