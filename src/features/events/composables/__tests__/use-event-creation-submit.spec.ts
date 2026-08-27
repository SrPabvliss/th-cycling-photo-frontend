import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const createPayoutMethod = vi.fn()
const updateTenantProfile = vi.fn()
const confirmWatermark = vi.fn()
const createEvent = vi.fn()
const uploadAssets = vi.fn()
const assignCategories = vi.fn()

vi.mock('@/features/tenant-profile/composables/mutations/use-create-payout-method', () => ({
  useCreatePayoutMethod: () => ({ mutateAsync: createPayoutMethod }),
}))

vi.mock('@/features/tenant-profile/composables/mutations/use-update-tenant-profile', () => ({
  useUpdateTenantProfile: () => ({ mutateAsync: updateTenantProfile }),
}))

vi.mock('@/features/tenant-profile/composables/mutations/use-confirm-watermark', () => ({
  useConfirmWatermark: () => ({ mutateAsync: confirmWatermark }),
}))

vi.mock('../mutations/use-create-event', () => ({
  useCreateEvent: () => ({ mutateAsync: createEvent }),
}))

vi.mock('@/features/event-assets/composables/mutations/use-upload-assets-batch', () => ({
  useUploadAssetsBatch: () => ({ mutateAsync: uploadAssets }),
}))

vi.mock(
  '@/features/photo-categories/composables/mutations/use-assign-photo-categories-batch',
  () => ({
    useAssignPhotoCategoriesBatch: () => ({ mutateAsync: assignCategories }),
  }),
)

import { useEventCreationSubmit } from '../use-event-creation-submit'
import type { ConfigurationItemId, IConfigurationItem } from '../use-configuration-items'
import type { IEventFormData, IEventFormExtra } from '../../types/event-form.types'
import type { IEventConfigurationSelectionRequest } from '../../types/requests/event-configuration.request'
import type { ICreateEventRequest } from '../../types/requests/create-event.request'
import PasswordConfirmModal from '../../presentation/views/EventCreateWizard/modals/PasswordConfirmModal.vue'
import CreatingModal from '../../presentation/views/EventCreateWizard/modals/CreatingModal.vue'
import NoSlotModal from '../../presentation/views/EventCreateWizard/modals/NoSlotModal.vue'
import ExitWarningModal from '../../presentation/views/EventCreateWizard/modals/ExitWarningModal.vue'
import ConfirmationStep from '../../presentation/views/EventCreateWizard/steps/ConfirmationStep.vue'

const PAYPHONE_ID = '11111111-1111-4111-8111-111111111111'
const BANK_ID = '22222222-2222-4222-8222-222222222222'

const FORM: IEventFormData = {
  name: 'Copa Nacional Downhill 2026',
  startDate: new Date('2026-03-12T00:00:00.000Z').getTime(),
  endDate: new Date('2026-03-14T00:00:00.000Z').getTime(),
  provinceId: 1,
  cantonId: 2,
  eventTypeId: 1,
}

const COVER = new File(['x'], 'portada.jpg', { type: 'image/jpeg' })

function extraWithCover(): IEventFormExtra {
  return { assetFiles: new Map([['cover_image', COVER]]), categoryIds: [7, 9] }
}

function baseItem(id: ConfigurationItemId, label: string): IConfigurationItem {
  return {
    id,
    label,
    icon: 'card',
    requiresPassword: id === 'payphone' || id === 'bankTransfer',
    state: 'profile',
    hasProfileValue: true,
    profileValue: 'algo',
    profileLabel: 'algo',
    summary: 'algo',
    isReady: true,
    isOpen: false,
    useProfile: true,
    saveToProfile: false,
    isRemovable: false,
    isRemoved: false,
    removeDisabledReason: null,
    draft: { value: 'algo' },
  }
}

function reusedItems(): IConfigurationItem[] {
  return [
    baseItem('publicName', 'Nombre público'),
    baseItem('watermark', 'Marca de agua'),
    baseItem('whatsapp', 'WhatsApp de contacto'),
    baseItem('payphone', 'Payphone'),
    baseItem('bankTransfer', 'Transferencia bancaria'),
  ]
}

function itemsSavingBothPayouts(): IConfigurationItem[] {
  return reusedItems().map((item) => {
    if (item.id === 'payphone') {
      return {
        ...item,
        state: 'new' as const,
        useProfile: false,
        saveToProfile: true,
        draft: { phone: '0987654321', verification: 'verified' as const },
      }
    }
    if (item.id === 'bankTransfer') {
      return {
        ...item,
        state: 'new' as const,
        useProfile: false,
        saveToProfile: true,
        draft: {
          bankName: 'Pichincha',
          accountNumber: '2201234567',
          accountType: 'ahorros',
          accountHolder: 'Ana Rios',
          holderIdentification: '1804567890',
        },
      }
    }
    return item
  })
}

function itemsSavingPayphone(phone: string): IConfigurationItem[] {
  return reusedItems().map((item) =>
    item.id === 'payphone'
      ? {
          ...item,
          state: 'new' as const,
          useProfile: false,
          saveToProfile: true,
          draft: { phone, verification: 'verified' as const },
        }
      : item,
  )
}

function payphoneSelection(phone: string): IEventConfigurationSelectionRequest {
  return {
    ...reusedSelection(),
    payoutMethods: [
      { source: 'new', provider: 'payphone', phone },
      { source: 'profile', id: BANK_ID },
    ],
  }
}

function itemsSavingWatermark(saveToProfile: boolean): IConfigurationItem[] {
  return reusedItems().map((item) =>
    item.id === 'watermark'
      ? {
          ...item,
          state: 'new' as const,
          useProfile: false,
          saveToProfile,
          draft: { storageKey: 'tenants/1/nueva-marca.png', fileName: 'nueva-marca.png' },
        }
      : item,
  )
}

function reusedSelection(): IEventConfigurationSelectionRequest {
  return {
    publicName: 'Andes Bike Media',
    watermarkStorageKey: 'tenants/1/watermark.png',
    whatsappNumber: '0991112222',
    payoutMethods: [
      { source: 'profile', id: PAYPHONE_ID },
      { source: 'profile', id: BANK_ID },
    ],
  }
}

function newPayoutSelection(): IEventConfigurationSelectionRequest {
  return {
    publicName: 'Andes Bike Media',
    watermarkStorageKey: 'tenants/1/watermark.png',
    whatsappNumber: '0991112222',
    payoutMethods: [
      { source: 'new', provider: 'payphone', phone: '0987654321' },
      {
        source: 'new',
        provider: 'bank_transfer',
        bankName: 'Pichincha',
        accountNumber: '2201234567',
        accountType: 'ahorros',
        accountHolder: 'Ana Rios',
        holderIdentification: '1804567890',
      },
    ],
  }
}

function apiError(messageKey: string, message = 'Algo salió mal') {
  return {
    isAxiosError: true,
    response: {
      status: 422,
      data: { error: { code: 'BUSINESS_RULE', messageKey, message, shouldThrow: false } },
    },
  }
}

const openedItems: ConfigurationItemId[] = []
const configurationVisits: number[] = []

const Harness = defineComponent({
  props: {
    items: { type: Array as () => IConfigurationItem[], required: true },
    selection: { type: Object as () => IEventConfigurationSelectionRequest, required: true },
    extra: { type: Object as () => IEventFormExtra, required: true },
    categoryNames: { type: Array as () => string[] | null, default: null },
  },
  setup(props) {
    const submission = useEventCreationSubmit({
      items: () => props.items,
      toSelection: () => props.selection,
      openItem: (id) => openedItems.push(id),
      goToConfiguration: () => configurationVisits.push(1),
      describeCategories: () => (props.categoryNames ?? []).join(', '),
    })

    return () => [
      h(
        'button',
        { 'data-test': 'do-submit', onClick: () => submission.submit(FORM, props.extra) },
        'Crear evento',
      ),
      submission.payoutError.value === null
        ? null
        : h('p', { 'data-test': 'payout-error' }, submission.payoutError.value),
      h(PasswordConfirmModal, {
        show: submission.isPasswordOpen.value,
        methods: submission.passwordLabels.value,
        loading: submission.isPasswordPending.value,
        error: submission.passwordError.value,
        onConfirm: (password: string) => submission.confirmPassword(password),
        onCancel: () => submission.cancelPassword(),
      }),
      h(CreatingModal, {
        show: submission.isCreatingOpen.value,
        step: submission.creatingStep.value ?? 0,
      }),
      h(NoSlotModal, { show: submission.isNoSlotOpen.value }),
      h(ExitWarningModal, { show: true, createdMethods: submission.createdPayoutLabels.value }),
      submission.isCreated.value
        ? h(ConfirmationStep, {
            eventName: FORM.name,
            eventDateRangeLabel: '12 mar 2026 → 14 mar 2026',
            role: 'organizer' as const,
            slotsRemaining: 2,
            photoQuota: 4000,
            coverImage: submission.coverImage.value,
            categories: submission.categories.value,
            profileSave: submission.profileSave.value,
          })
        : null,
    ]
  },
})

function mountHarness(options: {
  items: IConfigurationItem[]
  selection: IEventConfigurationSelectionRequest
  extra?: IEventFormExtra
  categoryNames?: string[]
}) {
  return mount(Harness, {
    props: {
      items: options.items,
      selection: options.selection,
      extra: options.extra ?? extraWithCover(),
      categoryNames: options.categoryNames ?? ['Podio', 'Salida'],
    },
    global: { stubs: { teleport: true } },
  })
}

function createdEventRequest(index = 0): ICreateEventRequest {
  return createEvent.mock.calls[index]?.[0] as ICreateEventRequest
}

describe('useEventCreationSubmit', () => {
  beforeEach(() => {
    openedItems.length = 0
    configurationVisits.length = 0
    vi.clearAllMocks()
    createEvent.mockResolvedValue({ id: 'event-1', slug: 'copa-nacional-downhill-2026' })
    uploadAssets.mockResolvedValue('event-1')
    assignCategories.mockResolvedValue('event-1')
    updateTenantProfile.mockResolvedValue(undefined)
    confirmWatermark.mockResolvedValue(undefined)
    createPayoutMethod.mockResolvedValue({ id: 'unexpected' })
  })

  it('never opens the password modal when every payout item reuses the profile', async () => {
    const wrapper = mountHarness({ items: reusedItems(), selection: reusedSelection() })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="password-modal"]').exists()).toBe(false)
    expect(createPayoutMethod).not.toHaveBeenCalled()
    expect(updateTenantProfile).not.toHaveBeenCalled()
    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe('Evento creado')
  })

  it('opens it once, listing both, when two payout items save to the profile', async () => {
    createPayoutMethod
      .mockResolvedValueOnce({ id: 'payphone-new' })
      .mockResolvedValueOnce({ id: 'bank-new' })

    const wrapper = mountHarness({
      items: itemsSavingBothPayouts(),
      selection: newPayoutSelection(),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    const modal = wrapper.get('[data-test="password-modal"]')
    const entries = modal.findAll('[data-test="auth-item"]')
    expect(entries.map((entry) => entry.text())).toEqual([
      'Crear Payphone en tu cuenta',
      'Crear Transferencia bancaria en tu cuenta',
    ])
    expect(modal.text()).toContain('Los datos que reusaste de tu perfil no la necesitan')
    expect(createEvent).not.toHaveBeenCalled()

    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    expect(createPayoutMethod).toHaveBeenCalledTimes(2)
    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-test="password-modal"]').exists()).toBe(false)
  })

  it('rewrites a saved payout entry to source profile with the returned id', async () => {
    createPayoutMethod
      .mockResolvedValueOnce({ id: 'payphone-new' })
      .mockResolvedValueOnce({ id: 'bank-new' })

    const wrapper = mountHarness({
      items: itemsSavingBothPayouts(),
      selection: newPayoutSelection(),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    expect(createdEventRequest().configuration?.payoutMethods).toEqual([
      { source: 'profile', id: 'payphone-new' },
      { source: 'profile', id: 'bank-new' },
    ])
  })

  it('does not create the event when a payout method creation fails', async () => {
    createPayoutMethod
      .mockResolvedValueOnce({ id: 'payphone-new' })
      .mockRejectedValueOnce(apiError('payment.invalid_bank_account', 'La cuenta no existe'))

    const wrapper = mountHarness({
      items: itemsSavingBothPayouts(),
      selection: newPayoutSelection(),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    expect(createEvent).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="password-modal"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="confirmation-step"]').exists()).toBe(false)
    expect(openedItems).toEqual(['bankTransfer'])
    expect(configurationVisits).toHaveLength(1)
    expect(wrapper.get('[data-test="payout-error"]').text()).toBe('La cuenta no existe')
    expect(wrapper.get('[data-test="exit-keep"]').text()).toContain(
      'Payphone ya quedó creado en tu cuenta',
    )
  })

  it('reports the event as created when the cover upload fails afterwards', async () => {
    uploadAssets.mockRejectedValueOnce(new Error('b2 down'))

    const wrapper = mountHarness({ items: reusedItems(), selection: reusedSelection() })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe(
      'Evento creado, con una cosa pendiente',
    )
    expect(wrapper.get('[data-test="line-event"]').classes()).toContain('ok')
    expect(wrapper.get('[data-test="line-cover"]').classes()).toContain('bad')
    expect(wrapper.get('[data-test="line-categories"]').text()).toContain('Podio, Salida')
  })

  it('marks the cover and the categories as not requested when the form carried neither', async () => {
    const wrapper = mountHarness({
      items: reusedItems(),
      selection: reusedSelection(),
      extra: {},
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(uploadAssets).not.toHaveBeenCalled()
    expect(assignCategories).not.toHaveBeenCalled()
    expect(wrapper.get('[data-test="line-cover"]').classes()).toContain('skip')
    expect(wrapper.get('[data-test="line-categories"]').classes()).toContain('skip')
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe('Evento creado')
  })

  it('confirms the watermark onto the profile only when its checkbox is on', async () => {
    const reused = mountHarness({ items: reusedItems(), selection: reusedSelection() })
    await reused.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    expect(confirmWatermark).not.toHaveBeenCalled()

    const unchecked = mountHarness({
      items: itemsSavingWatermark(false),
      selection: { ...reusedSelection(), watermarkStorageKey: 'tenants/1/nueva-marca.png' },
    })
    await unchecked.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    expect(confirmWatermark).not.toHaveBeenCalled()

    const checked = mountHarness({
      items: itemsSavingWatermark(true),
      selection: { ...reusedSelection(), watermarkStorageKey: 'tenants/1/nueva-marca.png' },
    })
    await checked.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    expect(confirmWatermark).toHaveBeenCalledTimes(1)
    expect(confirmWatermark).toHaveBeenCalledWith('tenants/1/nueva-marca.png')
  })

  it('falls back to a count when the category names cannot be resolved', async () => {
    const wrapper = mountHarness({
      items: reusedItems(),
      selection: reusedSelection(),
      categoryNames: [],
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    const line = wrapper.get('[data-test="line-categories"]')
    expect(line.classes()).toContain('ok')
    expect(line.text()).toContain('2 categorías')
  })

  it('ignores a second submit while the first one is still running', async () => {
    let release: (value: { id: string; slug: string }) => void = () => undefined
    createEvent.mockReturnValueOnce(
      new Promise<{ id: string; slug: string }>((resolve) => {
        release = resolve
      }),
    )

    const wrapper = mountHarness({ items: reusedItems(), selection: reusedSelection() })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(createEvent).toHaveBeenCalledTimes(1)

    release({ id: 'event-1', slug: 'copa-nacional-downhill-2026' })
    await flushPromises()

    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe('Evento creado')
  })

  it('creates a new method when the payout draft changed after a failed creation', async () => {
    createPayoutMethod
      .mockResolvedValueOnce({ id: 'payphone-old' })
      .mockResolvedValueOnce({ id: 'payphone-newer' })
    createEvent.mockRejectedValueOnce(apiError('event.slot_conflict', 'No pudimos crear el evento'))

    const wrapper = mountHarness({
      items: itemsSavingPayphone('0987654321'),
      selection: payphoneSelection('0987654321'),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-test="confirmation-step"]').exists()).toBe(false)

    await wrapper.setProps({
      items: itemsSavingPayphone('0999888777'),
      selection: payphoneSelection('0999888777'),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    expect(createPayoutMethod).toHaveBeenCalledTimes(2)
    expect(createPayoutMethod.mock.calls[1]?.[0]).toMatchObject({ phone: '0999888777' })
    expect(createdEventRequest(1).configuration?.payoutMethods).toEqual([
      { source: 'profile', id: 'payphone-newer' },
      { source: 'profile', id: BANK_ID },
    ])
  })

  it('reuses the saved method when the payout draft did not change', async () => {
    createPayoutMethod.mockResolvedValueOnce({ id: 'payphone-old' })
    createEvent.mockRejectedValueOnce(apiError('event.slot_conflict', 'No pudimos crear el evento'))

    const wrapper = mountHarness({
      items: itemsSavingPayphone('0987654321'),
      selection: payphoneSelection('0987654321'),
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="password-input"] input').setValue('secreta')
    await wrapper.get('[data-test="confirm-password"]').trigger('click')
    await flushPromises()

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(createPayoutMethod).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-test="password-modal"]').exists()).toBe(false)
    expect(createdEventRequest(1).configuration?.payoutMethods).toEqual([
      { source: 'profile', id: 'payphone-old' },
      { source: 'profile', id: BANK_ID },
    ])
  })

  it('reports on the confirmation when the profile write failed', async () => {
    confirmWatermark.mockRejectedValueOnce(new Error('no se pudo'))

    const wrapper = mountHarness({
      items: itemsSavingWatermark(true),
      selection: { ...reusedSelection(), watermarkStorageKey: 'tenants/1/nueva-marca.png' },
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    const line = wrapper.get('[data-test="line-profile"]')
    expect(line.classes()).toContain('bad')
    expect(line.text()).toContain('Tu perfil no se actualizó')
    expect(line.text()).toContain('la marca de agua')
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe(
      'Evento creado, con una cosa pendiente',
    )
  })

  it('says nothing about the profile when nothing was marked for it', async () => {
    const wrapper = mountHarness({ items: reusedItems(), selection: reusedSelection() })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(updateTenantProfile).not.toHaveBeenCalled()
    expect(confirmWatermark).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="line-profile"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe('Evento creado')
  })

  it('reports on the confirmation when the profile write succeeded', async () => {
    const wrapper = mountHarness({
      items: itemsSavingWatermark(true),
      selection: { ...reusedSelection(), watermarkStorageKey: 'tenants/1/nueva-marca.png' },
    })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    const line = wrapper.get('[data-test="line-profile"]')
    expect(line.classes()).toContain('ok')
    expect(line.text()).toContain('Perfil actualizado')
    expect(line.text()).toContain('la marca de agua')
    expect(wrapper.get('[data-test="confirmation-heading"]').text()).toBe('Evento creado')
  })

  it('surfaces event.no_contract_available as the slot-exhausted modal', async () => {
    createEvent.mockRejectedValueOnce(
      apiError(
        'event.no_contract_available',
        'No tienes un contrato vigente con cupo disponible para crear un evento.',
      ),
    )

    const wrapper = mountHarness({ items: reusedItems(), selection: reusedSelection() })

    await wrapper.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="no-slot-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Se acabaron los cupos')
    expect(wrapper.text()).toContain('El evento no se creó')
    expect(wrapper.find('[data-test="confirmation-step"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="creating-modal"]').exists()).toBe(false)
    expect(uploadAssets).not.toHaveBeenCalled()

    createEvent.mockRejectedValueOnce(apiError('event.configuration_incomplete'))

    const other = mountHarness({ items: reusedItems(), selection: reusedSelection() })
    await other.get('[data-test="do-submit"]').trigger('click')
    await flushPromises()

    expect(other.find('[data-test="no-slot-modal"]').exists()).toBe(false)
  })
})
