import { h, type VNode } from 'vue'

const CREDIT_NOTE_WARNING =
  'Esta orden ya tiene factura autorizada. Se emitirá una nota de crédito por el total y se enviará al comprador.'

export function withCreditNoteWarning(
  content: string,
  invoiceState: string | null,
): string | (() => VNode) {
  if (invoiceState !== 'authorized') return content
  return () => h('div', [h('p', content), h('p', CREDIT_NOTE_WARNING)])
}
