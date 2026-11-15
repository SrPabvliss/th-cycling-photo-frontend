import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'

import ConfirmDialog from './ConfirmDialog.vue'

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
})

async function mountDialog(open = true, busy = false) {
  wrapper = mount(ConfirmDialog, {
    attachTo: document.body,
    props: {
      open,
      title: '¿Cancelar este pedido?',
      text: 'No se cobra nada.',
      confirmLabel: 'Sí, cancelar pedido',
      keepLabel: 'Conservar pedido',
      busy,
    },
  })
  await flushPromises()
  return new DOMWrapper(document.body)
}

const button = (body: DOMWrapper<Element>, name: string) =>
  body.findAll('button').find((each) => each.text().trim() === name)!

describe('ConfirmDialog', () => {
  it('is an alert dialog named by its title, starting on the safe choice', async () => {
    const body = await mountDialog()

    const dialog = body.get('[role="alertdialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    const labelId = dialog.attributes('aria-labelledby')!
    expect(document.getElementById(labelId)?.textContent).toBe('¿Cancelar este pedido?')
    expect(document.activeElement).toBe(button(body, 'Conservar pedido').element)
  })

  it('keeps without acting, by its button or with Escape', async () => {
    const body = await mountDialog()

    await button(body, 'Conservar pedido').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()

    expect(wrapper!.emitted('keep')?.length).toBeGreaterThanOrEqual(2)
    expect(wrapper!.emitted('confirm')).toBeUndefined()
  })

  it('confirms once, even when pressed twice', async () => {
    const body = await mountDialog()

    await button(body, 'Sí, cancelar pedido').trigger('click')
    await wrapper!.setProps({ busy: true })
    await button(body, 'Sí, cancelar pedido').trigger('click')

    expect(wrapper!.emitted('confirm')).toHaveLength(1)
  })

  it('says in the dialog why the action failed, and lets it be tried again', async () => {
    const body = await mountDialog()
    await button(body, 'Sí, cancelar pedido').trigger('click')

    await wrapper!.setProps({
      problem: { title: 'No se pudo completar', text: 'Parece un problema de conexión.' },
    })

    const alert = body.get('[role="alertdialog"] .form-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No se pudo completar')
    await button(body, 'Sí, cancelar pedido').trigger('click')
    expect(wrapper!.emitted('confirm')).toHaveLength(2)
  })

  it('shows nothing while closed', async () => {
    const body = await mountDialog(false)

    expect(body.find('[role="alertdialog"]').exists()).toBe(false)
  })
})
