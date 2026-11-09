import { describe, expect, it } from 'vitest'
import type { VNode } from 'vue'

import { withCreditNoteWarning } from './credit-note-warning'

const WARNING =
  'Esta orden ya tiene factura autorizada. Se emitirá una nota de crédito por el total y se enviará al comprador.'

describe('withCreditNoteWarning', () => {
  it('leaves the content untouched when the invoice is not authorized', () => {
    expect(withCreditNoteWarning('Contenido', null)).toBe('Contenido')
    expect(withCreditNoteWarning('Contenido', 'rejected')).toBe('Contenido')
  })

  it('warns about the credit note in its own paragraph when the invoice is authorized', () => {
    const content = withCreditNoteWarning('Contenido', 'authorized') as () => VNode
    const paragraphs = content().children as VNode[]

    expect(paragraphs.map((paragraph) => paragraph.children)).toEqual(['Contenido', WARNING])
  })
})
