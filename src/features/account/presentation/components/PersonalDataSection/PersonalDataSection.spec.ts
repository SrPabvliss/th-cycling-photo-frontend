import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError } from 'axios'
import { computed, ref } from 'vue'

import type { IMyProfile } from '../../../types/responses/my-profile.response'
import PersonalDataSection from './PersonalDataSection.vue'

const update = vi.fn()
const success = vi.fn()

vi.mock('../../../composables/mutations/use-update-profile', () => ({
  useUpdateProfile: () => ({ mutateAsync: update, isPending: ref(false) }),
}))
vi.mock('@/features/locations/composables/queries/use-countries', () => ({
  useCountriesQuery: () => ({
    data: computed(() => [
      { id: 50, name: 'Ecuador', isoCode: 'EC' },
      { id: 47, name: 'Colombia', isoCode: 'CO' },
    ]),
  }),
}))
vi.mock('@/features/locations/composables/queries/use-provinces-by-country', () => ({
  useProvincesByCountryQuery: () => ({ data: computed(() => []) }),
}))
vi.mock('@/features/locations/composables/queries/use-cantons', () => ({
  useCantonsQuery: () => ({ data: computed(() => []) }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success }),
}))

const PROFILE: IMyProfile = {
  id: 'u1',
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: 'Paz',
  avatarUrl: '',
  countryId: 50,
  provinceId: null,
  cantonId: null,
  birthDate: '1996-03-14',
  gender: null,
  phones: [],
}

const mounted: { unmount(): void }[] = []
async function mountSection() {
  mounted.push(mount(PersonalDataSection, { props: { profile: PROFILE }, attachTo: document.body }))
  await flushPromises()
  return new DOMWrapper(document.body)
}

const errorOf = (wrapper: DOMWrapper<Element>, id: string) => {
  const described = wrapper.get(`#${id}`).attributes('aria-describedby') ?? ''
  const errorId = described.split(' ').find((each) => each.endsWith('-error'))
  return errorId ? (document.getElementById(errorId)?.textContent?.trim() ?? null) : null
}

describe('PersonalDataSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    update.mockReset()
    success.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('starts with the saved data', async () => {
    const wrapper = await mountSection()

    expect((wrapper.get('#perfil-first').element as HTMLInputElement).value).toBe('Ana')
    expect((wrapper.get('#perfil-by').element as HTMLSelectElement).value).toBe('1996')
  })

  it('asks for the name', async () => {
    const wrapper = await mountSection()

    await wrapper.get('#perfil-first').setValue('  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(errorOf(wrapper, 'perfil-first')).toBe('Escribe tu nombre.')
    expect(update).not.toHaveBeenCalled()
  })

  it('asks for the whole date when only part of it is there', async () => {
    const wrapper = await mountSection()

    await wrapper.get('#perfil-bd').setValue('')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(errorOf(wrapper, 'perfil-bd')).toBe('Completa día, mes y año.')
  })

  it('saves only what changed and says so', async () => {
    update.mockResolvedValue({ id: 'u1' })
    const wrapper = await mountSection()

    await wrapper.get('#perfil-first').setValue('Ana María')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(update).toHaveBeenCalledWith({ firstName: 'Ana María' })
    expect(success).toHaveBeenCalledWith('Guardamos tus cambios.')
  })

  it('keeps what was written and says what went wrong when saving fails', async () => {
    update.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = await mountSection()

    await wrapper.get('#perfil-last').setValue('Paz Mora')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Parece un problema de conexión.')
    expect((wrapper.get('#perfil-last').element as HTMLInputElement).value).toBe('Paz Mora')
    expect(success).not.toHaveBeenCalled()
  })
})
