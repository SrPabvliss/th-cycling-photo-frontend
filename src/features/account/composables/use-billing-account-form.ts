import { computed, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'

import {
  ID_NUMBER_FORMAT_MESSAGE,
  type IBillingAccountFormData,
} from '../constants/billing-account-form.schema'
import type { ICreateBillingAccountRequest } from '../types/requests/billing-account.request'
import { isWellFormedIdNumber, normalizeIdNumber } from '../utils/billing-identification'
import {
  identificationMessageOf,
  readBillingServerError,
  type IBillingServerError,
} from '../utils/billing-server-error'
import { useCreateBillingAccount } from './mutations/use-create-billing-account'
import { useRecordInvoiceConsent } from './mutations/use-record-invoice-consent'

/** create: saves a new account. correct and edit: hand the request to whoever asked. */
export type BillingFormMode = 'create' | 'correct' | 'edit'

export interface IBillingAccountFormOptions {
  mode: BillingFormMode
  needsConsent: boolean
  prefill: { legalName: string; email: string }
  initial?: ICreateBillingAccountRequest
  serverError: () => IBillingServerError | null | undefined
  onSaved: (id: string) => void
  onSubmit: (request: ICreateBillingAccountRequest) => void
}

const CREATE_FALLBACK = 'No pudimos guardar tus datos de facturación. Intenta de nuevo.'

function toRequest(value: IBillingAccountFormData): ICreateBillingAccountRequest {
  const address = value.address.trim()
  return {
    idType: value.idType,
    idNumber: normalizeIdNumber(value.idType, value.idNumber),
    legalName: value.legalName.trim(),
    email: value.email.trim(),
    ...(address ? { address } : {}),
  }
}

// What a billing form does, whatever it looks like: the client form and the panel correction
// share it.
export function useBillingAccountForm(options: IBillingAccountFormOptions) {
  const handsOver = options.mode !== 'create'
  const isEditing = options.mode === 'edit'
  const asksConsent = !handsOver && options.needsConsent
  const recordInvoiceConsent = useRecordInvoiceConsent()
  const createBillingAccount = useCreateBillingAccount()

  const idNumberSaveError = ref<string | null>(null)
  const saveError = ref<string | null>(null)

  const serverIdNumberError = computed(() => {
    const error = options.serverError()
    return error ? identificationMessageOf(error) : null
  })
  const idNumberError = computed(() => idNumberSaveError.value ?? serverIdNumberError.value)
  const alertError = computed(() => {
    if (saveError.value) return saveError.value
    const error = options.serverError()
    return error && !serverIdNumberError.value ? error.message : null
  })
  const isSaving = computed(
    () => recordInvoiceConsent.isPending.value || createBillingAccount.isPending.value,
  )

  const form = useForm({
    defaultValues: {
      idType: options.initial?.idType ?? 'national_id',
      idNumber: options.initial?.idNumber ?? '',
      legalName: options.initial?.legalName ?? options.prefill.legalName,
      email: options.initial?.email ?? options.prefill.email,
      address: options.initial?.address ?? '',
      consent: false,
    } as IBillingAccountFormData,
    onSubmit: async ({ value }) => {
      if (handsOver) {
        options.onSubmit(toRequest(value))
        return
      }
      idNumberSaveError.value = null
      saveError.value = null
      try {
        if (asksConsent) await recordInvoiceConsent.mutateAsync()
        const created = await createBillingAccount.mutateAsync(toRequest(value))
        options.onSaved(created.id)
      } catch (caught) {
        const serverError = readBillingServerError(caught, CREATE_FALLBACK)
        const identificationMessage = identificationMessageOf(serverError)
        if (identificationMessage) idNumberSaveError.value = identificationMessage
        else saveError.value = serverError.message
      }
    },
  })

  const idType = form.useStore((state) => state.values.idType)

  function idNumberValidator({ value }: { value: string }) {
    return isWellFormedIdNumber(idType.value, normalizeIdNumber(idType.value, value))
      ? undefined
      : ID_NUMBER_FORMAT_MESSAGE
  }

  const idNumberPlaceholder = computed(() => {
    if (idType.value === 'ruc') return '13 dígitos'
    if (idType.value === 'passport') return 'Letras y números'
    return '10 dígitos'
  })

  return {
    form,
    idType,
    isEditing,
    asksConsent,
    idNumberError,
    alertError,
    isSaving,
    idNumberValidator,
    idNumberPlaceholder,
  }
}
