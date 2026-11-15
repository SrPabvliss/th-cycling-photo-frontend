import type { PhoneBlock } from '../presentation/components/PhoneMockup/phone-blocks'

export interface IBrandScreen {
  name: string
  /** Where the brand goes on that screen. */
  text: string
  phone: PhoneBlock[]
}

const STRIP: PhoneBlock = {
  kind: 'mark',
  shape: 'strip',
  text: 'Presenta: tu marca',
  short: 'Tu marca',
}
const BAR: PhoneBlock = { kind: 'bar' }
const ROW: PhoneBlock = { kind: 'row' }
const ITEM: PhoneBlock = { kind: 'item' }
const BAND: PhoneBlock = { kind: 'mark', shape: 'band', text: 'Tu marca aquí' }
const WIDE: PhoneBlock = { kind: 'mark', shape: 'wide', text: 'Tu marca aquí' }
const cells = (count: number, markAt?: number): PhoneBlock => ({
  kind: 'grid',
  cells: count,
  markAt,
  markText: 'Tu marca',
})

// The screens of the app that carry a house ad, as the brands page shows them: the presenter
// strip on top and the piece where it really goes. Order and words from the approved prototype.
const SCREENS = {
  inicio: {
    name: 'Inicio',
    text: 'Lo primero que ve al entrar.',
    phone: [STRIP, { kind: 'cover' }, ROW, BAND, ROW],
  },
  eventos: {
    name: 'Eventos',
    text: 'Entre las carreras, y vuelve mientras baja.',
    phone: [STRIP, BAR, ROW, ROW, ROW, BAND, ROW, ROW],
  },
  galeria: {
    name: 'Galería',
    text: 'Entre sus fotos, del tamaño de una foto.',
    phone: [STRIP, BAR, cells(15, 7)],
  },
  placa: {
    name: 'Búsqueda por placa',
    text: 'Al lado de sus fotos, cuando se encuentra.',
    phone: [STRIP, BAR, { kind: 'field', text: '# 45' }, cells(5, 4)],
  },
  foto: {
    name: 'Foto ampliada',
    text: 'Bajo cada foto que abre.',
    phone: [STRIP, { kind: 'big' }, WIDE],
  },
  carrito: {
    name: 'Carrito',
    text: 'Mientras revisa lo que se lleva.',
    phone: [STRIP, BAR, ITEM, ITEM, ITEM, WIDE, { kind: 'field', text: 'Confirmar pedido' }],
  },
  confirmar: {
    name: 'Confirmar pedido',
    text: 'Justo antes de pagar.',
    phone: [STRIP, BAR, ROW, ROW, WIDE, ROW, { kind: 'field', text: 'Confirmar' }],
  },
  misFotos: {
    name: 'Mis fotos',
    text: 'Cada vez que vuelve por sus compras.',
    phone: [STRIP, BAR, ITEM, ITEM, BAND, ITEM],
  },
  descarga: {
    name: 'Descarga',
    text: 'Cuando recibe sus originales.',
    phone: [STRIP, BAR, cells(6), BAND, { kind: 'field', text: 'Descargar' }],
  },
} satisfies Record<string, IBrandScreen>

/** Three groups of three, most relevant first: every group as tall as the others. */
export const BRAND_SCREEN_GROUPS: IBrandScreen[][] = [
  [SCREENS.galeria, SCREENS.placa, SCREENS.eventos],
  [SCREENS.foto, SCREENS.inicio, SCREENS.carrito],
  [SCREENS.confirmar, SCREENS.descarga, SCREENS.misFotos],
]
