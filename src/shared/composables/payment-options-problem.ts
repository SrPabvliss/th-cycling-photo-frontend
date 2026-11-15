import { problemKind } from '@/core/http/problem-kind'
import { loadProblemCopy } from '@/shared/components/loading'

/**
 * What to say when the ways to pay of an event could not be read. Without them nothing may be
 * confirmed: the order would go by transfer, a way the buyer never chose. Nothing to say while
 * they load or once some are known.
 */
export function paymentOptionsProblem(
  status: 'pending' | 'error' | 'success',
  hasOptions: boolean,
  error: unknown,
): { title: string; text: string } | null {
  if (status !== 'error' || hasOptions) return null
  return loadProblemCopy(problemKind(error), 'las formas de pago', {
    title: 'No pudimos mostrar las formas de pago',
    text: 'Las necesitamos para crear tu pedido.',
  })
}
