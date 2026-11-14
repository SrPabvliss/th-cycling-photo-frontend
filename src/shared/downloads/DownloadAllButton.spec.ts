import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import type { ISequentialDownload } from './use-sequential-download'
import DownloadAllButton from './DownloadAllButton.vue'

function download(state: ISequentialDownload['state']['value'], done = 0, total = 3) {
  return {
    state: ref(state),
    done: ref(done),
    total: ref(total),
    start: vi.fn(async () => {}),
    stop: vi.fn(),
    resume: vi.fn(async () => {}),
  } satisfies ISequentialDownload
}

const mountButton = (value: ISequentialDownload) =>
  mount(DownloadAllButton, { props: { label: 'Descargar todas', download: value } })

describe('DownloadAllButton', () => {
  it('starts the download from rest', async () => {
    const value = download('idle')
    const wrapper = mountButton(value)

    expect(wrapper.get('button').text()).toBe('Descargar todas')
    await wrapper.get('button').trigger('click')
    expect(value.start).toHaveBeenCalled()
  })

  it('counts while it runs and can be stopped', async () => {
    const value = download('running', 2, 3)
    const wrapper = mountButton(value)

    expect(wrapper.text()).toContain('Descargando 2 de 3')
    const stop = wrapper.findAll('button').find((each) => each.text() === 'Detener')!
    await stop.trigger('click')
    expect(value.stop).toHaveBeenCalled()
  })

  it('says the photos went to downloads, in singular for one photo', () => {
    expect(mountButton(download('done', 3, 3)).text()).toContain(
      'Listo: enviamos tus 3 fotos a descargas. Revisa la carpeta de descargas de tu navegador.',
    )
    expect(mountButton(download('done', 1, 1)).text()).toContain(
      'Listo: enviamos tu foto a descargas. Revisa la carpeta de descargas de tu navegador.',
    )
  })

  it('says where it stopped', () => {
    expect(mountButton(download('stopped', 2, 5)).text()).toContain(
      'Descarga detenida en la foto 2 de 5.',
    )
  })

  it('says where it was cut and offers to continue', async () => {
    const value = download('failed', 3, 8)
    const wrapper = mountButton(value)

    const alert = wrapper.get('.form-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('Se cortó la descarga en la foto 4 de 8. Intenta de nuevo.')
    const resume = wrapper.findAll('button').find((each) => each.text() === 'Continuar descarga')!
    await resume.trigger('click')
    expect(value.resume).toHaveBeenCalled()
  })
})
