import { describe, expect, it } from 'vitest'

import { problemCopy } from './problem-copy'

describe('problemCopy', () => {
  it('offline: waits for the network, with no way out', () => {
    expect(problemCopy('offline', 'los eventos')).toEqual({
      title: 'Sin conexión a internet',
      text: 'Los eventos aparecerán cuando vuelvas a tener conexión.',
      illustration: 'sinConexion',
      tone: 'neutral',
      retry: false,
    })
  })

  it('server: names what did not show and offers a retry', () => {
    expect(problemCopy('server', 'los eventos')).toEqual({
      title: 'No pudimos mostrar los eventos',
      text: 'Vuelve a intentarlo en un momento.',
      illustration: 'fallaMecanica',
      tone: 'warn',
      retry: true,
    })
  })

  it('timeout: lets the person wait or retry', () => {
    expect(problemCopy('timeout', 'tus compras')).toEqual({
      title: 'Está tardando más de lo normal',
      text: 'Puedes esperar un poco o volver a intentarlo.',
      illustration: 'tardando',
      tone: 'warn',
      retry: true,
    })
  })

  it('unknown: same words as the server, its own drawing', () => {
    expect(problemCopy('unknown', 'tus compras')).toEqual({
      title: 'No pudimos mostrar tus compras',
      text: 'Vuelve a intentarlo en un momento.',
      illustration: 'errorCarga',
      tone: 'warn',
      retry: true,
    })
  })

  it('expired: the way out is signing in, not a retry', () => {
    expect(problemCopy('expired', 'tus compras')).toEqual({
      title: 'Tu sesión se cerró',
      text: 'Inicia sesión de nuevo para continuar. Tu carrito sigue guardado.',
      illustration: 'sesionVencida',
      tone: 'info',
      retry: false,
    })
  })

  it('rate: asks to wait, with no drawing and no way out', () => {
    expect(problemCopy('rate', 'los eventos')).toEqual({
      title: 'Demasiados intentos',
      text: 'Espera un minuto antes de volver a intentarlo.',
      illustration: null,
      tone: 'warn',
      retry: false,
    })
  })
})
