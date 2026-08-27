import type { EventSort, EventTab } from '../types/requests/event-filters.request'

export const TAB_LABELS: Record<EventTab, string> = {
  all: 'Todos',
  active: 'Activos',
  no_cover: 'Sin portada',
  frozen: 'Congelados',
  archived: 'Archivados',
}

export const SORT_LABELS: Record<EventSort, string> = {
  activity: 'Actividad reciente',
  event_date: 'Fecha del evento',
  quota: 'Cupo más consumido',
  pending_review: 'Más por revisar',
  revenue: 'Más ingresos',
  name: 'Nombre',
}
