import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import NoQuotaNote from './NoQuotaNote.vue'

function mountNote(props: Partial<InstanceType<typeof NoQuotaNote>['$props']>) {
  return mount(NoQuotaNote, {
    props: { reason: 'exhausted', eventsTotal: null, expiredOn: null, ...props },
  })
}

describe('NoQuotaNote', () => {
  it('names a used-up contract as out of quota, with its total', () => {
    const text = mountNote({ reason: 'exhausted', eventsTotal: 3 }).text()

    expect(text).toContain('Sin cupo de eventos.')
    expect(text).toContain('consumió sus 3 eventos')
  })

  it('names a lapsed contract as expired, with the day it lapsed', () => {
    const text = mountNote({ reason: 'expired', expiredOn: new Date(2026, 9, 31, 12) }).text()

    expect(text).toContain('Sin contrato vigente.')
    expect(text).toContain('venció el 31 oct 2026')
    expect(text).not.toContain('Sin cupo')
  })

  it('points to the pending contract instead of blaming the quota', () => {
    const text = mountNote({ reason: 'pending' }).text()

    expect(text).toContain('Tienes un contrato sin aceptar.')
    expect(text).not.toContain('Sin cupo')
  })

  it('says there is no contract when there never was one', () => {
    const text = mountNote({ reason: 'missing' }).text()

    expect(text).toContain('Todavía no tienes contrato.')
    expect(text).not.toContain('Sin cupo')
  })
})
