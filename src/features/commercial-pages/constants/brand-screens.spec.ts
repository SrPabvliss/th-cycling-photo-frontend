import { describe, expect, it } from 'vitest'

import { BRAND_SCREEN_GROUPS } from './brand-screens'

describe('brand screens', () => {
  it('shows nine screens in three groups of three, most relevant first', () => {
    expect(BRAND_SCREEN_GROUPS.map((group) => group.map((screen) => screen.name))).toEqual([
      ['Galería', 'Búsqueda por placa', 'Eventos'],
      ['Foto ampliada', 'Inicio', 'Carrito'],
      ['Confirmar pedido', 'Descarga', 'Mis fotos'],
    ])
  })

  it('says where the brand goes on each screen, in the words of the prototype', () => {
    const text = Object.fromEntries(
      BRAND_SCREEN_GROUPS.flat().map((screen) => [screen.name, screen.text]),
    )

    expect(text).toEqual({
      Galería: 'Entre sus fotos, del tamaño de una foto.',
      'Búsqueda por placa': 'Al lado de sus fotos, cuando se encuentra.',
      Eventos: 'Entre las carreras, y vuelve mientras baja.',
      'Foto ampliada': 'Bajo cada foto que abre.',
      Inicio: 'Lo primero que ve al entrar.',
      Carrito: 'Mientras revisa lo que se lleva.',
      'Confirmar pedido': 'Justo antes de pagar.',
      Descarga: 'Cuando recibe sus originales.',
      'Mis fotos': 'Cada vez que vuelve por sus compras.',
    })
  })

  it('puts the presenter strip on top of every screen and the brand in its place', () => {
    for (const screen of BRAND_SCREEN_GROUPS.flat()) {
      expect(screen.phone[0]).toEqual({
        kind: 'mark',
        shape: 'strip',
        text: 'Presenta: tu marca',
        short: 'Tu marca',
      })
      const marks = screen.phone.filter(
        (block) => block.kind === 'mark' || (block.kind === 'grid' && block.markAt !== undefined),
      )
      expect(marks.length).toBeGreaterThanOrEqual(2)
    }
  })
})
