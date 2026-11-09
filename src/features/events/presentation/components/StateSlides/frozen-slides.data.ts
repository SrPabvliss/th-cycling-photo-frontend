import type { IStateSlide } from './state-slide.types'

import {
  ArchiveOutline,
  CardOutline,
  CloudUploadOutline,
  ColorPaletteOutline,
  CreateOutline,
  EyeOutline,
  FolderOutline,
  PricetagsOutline,
  SearchOutline,
  StorefrontOutline,
  TrashOutline,
} from '@vicons/ionicons5'

export const FROZEN_SLIDES: IStateSlide[] = [
  {
    icons: [StorefrontOutline, CardOutline],
    tone: 'allowed',
    title: 'La venta no se detiene',
    description: 'Para el comprador no cambia absolutamente nada.',
    items: [
      'La galería pública sigue abierta',
      'Las órdenes se reciben y se cobran',
      'Las entregas siguen su curso',
    ],
  },
  {
    icons: [ColorPaletteOutline, SearchOutline, EyeOutline],
    tone: 'allowed',
    title: 'La revisión sigue abierta',
    description:
      'Se puede seguir arreglando la clasificación, para que cada corredor se encuentre.',
    items: ['Corregir los dorsales leídos', 'Marcar fotos revisadas'],
  },
  {
    icons: [CloudUploadOutline, TrashOutline, FolderOutline],
    tone: 'blocked',
    title: 'Las fotos quedan como están',
    description: 'El catálogo se cierra: ni entra material nuevo ni se reacomoda el que ya está.',
    items: ['Subir fotos', 'Eliminar fotos', 'Cambiarlas de categoría'],
  },
  {
    icons: [CreateOutline, PricetagsOutline, ArchiveOutline],
    tone: 'blocked',
    title: 'La ficha del evento se congela',
    description: 'Nada de lo que define al evento se puede modificar mientras dure.',
    items: [
      'Editar nombre, fechas y ubicación',
      'Cambiar precios, marca de agua y cupo',
      'Archivar, restaurar o eliminar el evento',
    ],
  },
]
