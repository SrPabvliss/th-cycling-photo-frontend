import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

import CheckoutProblemAlert from './CheckoutProblemAlert.vue'

const mountWith = (problem: 'network' | 'offline' | 'billing') =>
  mount(CheckoutProblemAlert, {
    props: { problem, galleryPath: '/eventos/x' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

describe('CheckoutProblemAlert', () => {
  it('is amber when the order did not get there', () => {
    expect(mountWith('network').get('.form-alert').classes()).toContain('form-alert--warn')
  })

  it('says only that there is no internet, in amber, when the device is offline', () => {
    const alert = mountWith('offline').get('.form-alert')

    expect(alert.classes()).toContain('form-alert--warn')
    expect(alert.text()).toBe('Sin conexión a internet')
  })

  it('is red when the server turned the order down', () => {
    expect(mountWith('billing').get('.form-alert').classes()).toContain('form-alert--bad')
  })
})
