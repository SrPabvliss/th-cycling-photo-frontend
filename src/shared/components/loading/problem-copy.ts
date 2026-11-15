import { problemKind, type ProblemKind } from '@/core/http/problem-kind'
import type { IllustrationKey } from '@/shared/components/empty-state'

/** neutral: nothing to do but wait; warn: it did not load; info: the session. */
export type ProblemTone = 'neutral' | 'warn' | 'info'

export interface IProblemCopy {
  title: string
  text: string
  illustration: IllustrationKey | null
  tone: ProblemTone
  /** The way out is "Reintentar". The expired session's way out is signing in, not a retry. */
  retry: boolean
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('es') + text.slice(1)
}

// "los eventos", "tus compras" read as many; "tu pedido", "el evento" as one.
const PLURAL_LEAD = new Set(['los', 'las', 'tus', 'sus', 'mis', 'estos', 'estas'])

function appears(what: string): string {
  const lead = what.trim().split(/\s+/)[0]?.toLocaleLowerCase('es') ?? ''
  return PLURAL_LEAD.has(lead) ? 'aparecerán' : 'aparecerá'
}

/**
 * Words, drawing and tone of a problem by its kind. `what` is the noun of what did not
 * show, with its article: "los eventos", "tus compras", "tu pedido".
 */
export function problemCopy(kind: ProblemKind, what: string): IProblemCopy {
  switch (kind) {
    case 'offline':
      return {
        title: 'Sin conexión a internet',
        text: `${capitalize(what)} ${appears(what)} cuando vuelvas a tener conexión.`,
        illustration: 'sinConexion',
        tone: 'neutral',
        retry: false,
      }
    case 'timeout':
      return {
        title: 'Está tardando más de lo normal',
        text: 'Puedes esperar un poco o volver a intentarlo.',
        illustration: 'tardando',
        tone: 'warn',
        retry: true,
      }
    case 'expired':
      return {
        title: 'Tu sesión se cerró',
        text: 'Inicia sesión de nuevo para continuar. Tu carrito sigue guardado.',
        illustration: 'sesionVencida',
        tone: 'info',
        retry: false,
      }
    case 'rate':
      return {
        title: 'Demasiados intentos',
        text: 'Espera un minuto antes de volver a intentarlo.',
        illustration: null,
        tone: 'warn',
        retry: false,
      }
    case 'server':
    case 'unknown':
      return {
        title: `No pudimos mostrar ${what}`,
        text: 'Vuelve a intentarlo en un momento.',
        illustration: kind === 'server' ? 'fallaMecanica' : 'errorCarga',
        tone: 'warn',
        retry: true,
      }
  }
}

/**
 * Title and detail of something that did not load. `better` says it better than "No pudimos
 * mostrar…" ("No pudimos mostrar más fotos" / "Las que ya ves siguen aquí."), but only when the
 * server failed or the cause is unknown: no network, slowness, too many tries and a closed
 * session keep their own words.
 */
export function loadProblemCopy(
  kind: ProblemKind,
  what: string,
  better: { title?: string; text?: string } = {},
): { title: string; text: string } {
  const copy = problemCopy(kind, what)
  const canSayBetter = kind === 'server' || kind === 'unknown'
  return {
    title: (canSayBetter && better.title) || copy.title,
    text: (canSayBetter && better.text) || copy.text,
  }
}

/**
 * The words of an alert about something that did not load, from the error itself: the same
 * cause says the same thing everywhere ("Está tardando más de lo normal" for a slow load).
 */
export function loadAlertCopy(
  error: unknown,
  what: string,
  better: { title?: string; text?: string } = {},
): { title: string; text: string } {
  return loadProblemCopy(problemKind(error), what, better)
}
