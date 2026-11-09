import {
  ArchiveOutline,
  CardOutline,
  CloudUploadOutline,
  CreateOutline,
  EyeOutline,
  ImagesOutline,
  ReceiptOutline,
  RefreshOutline,
  StatsChartOutline,
  TrashOutline,
} from '@vicons/ionicons5'

import type { IStateSlide } from './state-slide.types'

export const ARCHIVED_SLIDES: IStateSlide[] = [
  {
    icons: [ImagesOutline, ReceiptOutline, StatsChartOutline],
    tone: 'allowed',
    title: 'No se borró nada',
    description: 'Todo lo que el evento generó sigue guardado y se puede consultar.',
    items: [
      'Las fotos siguen almacenadas',
      'Los pedidos y sus entregas',
      'Los ingresos del evento',
    ],
  },
  {
    icons: [RefreshOutline, EyeOutline],
    tone: 'allowed',
    title: 'Se puede deshacer',
    description: 'Restaurarlo lo devuelve a la lista de activos tal como estaba.',
    items: ['Restaurar el evento cuando quieras', 'Consultar su información mientras tanto'],
  },
  {
    icons: [ArchiveOutline, CardOutline],
    tone: 'blocked',
    title: 'Sale de circulación',
    description: 'Deja la lista de trabajo y el comprador ya no lo encuentra.',
    items: ['No aparece en la galería pública', 'No admite compras nuevas'],
  },
  {
    icons: [CloudUploadOutline, CreateOutline, TrashOutline],
    tone: 'blocked',
    title: 'No admite cambios',
    description: 'El evento queda tal como estaba el día que se archivó.',
    items: ['Subir, editar o borrar fotos', 'Editar la ficha y la configuración', 'Congelarlo'],
  },
]
