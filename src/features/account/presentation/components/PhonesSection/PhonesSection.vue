<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { problemKind } from '@/core/http/problem-kind'
import { dialCodeOf } from '@/features/auth/utils/phone-prefix'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import ConfirmDialog from '@/shared/components/confirm-dialog/ConfirmDialog.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { ErrorState, TtSkeleton, useLoadPhase } from '@/shared/components/loading'
import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useAddPhone } from '../../../composables/mutations/use-add-phone'
import { useDeletePhone } from '../../../composables/mutations/use-delete-phone'
import { useSetPrimaryPhone } from '../../../composables/mutations/use-set-primary-phone'
import { useUpdatePhone } from '../../../composables/mutations/use-update-phone'
import { useMyPhonesQuery } from '../../../composables/queries/use-my-phones'
import type { IUserPhone } from '../../../types/responses/user-phone.response'
import { buildUpdatePhonePayload } from '../../../utils/phone-payload.utils'

const DEFAULT_PREFIX = '+593'
const SKELETON_ROWS = 2

const message = useMessage()
const { data: phones, status, error, isFetching, refetch } = useMyPhonesQuery({ silent: true })
// Without network a load that did not finish waits for it, in the place of the list.
const { isPending, isWaitingForNetwork } = useLoadPhase(status)
const addPhone = useAddPhone({ silent: true })
const updatePhone = useUpdatePhone({ silent: true })
const deletePhone = useDeletePhone({ silent: true })
const setPrimary = useSetPrimaryPhone({ silent: true })

const list = computed(() => phones.value ?? [])
const details = (phone: IUserPhone) =>
  [phone.label, phone.isWhatsapp ? 'Recibe WhatsApp' : 'Sin WhatsApp'].filter(Boolean).join(' · ')

// --- The sheet adds or edits one number; deleting it is confirmed in a dialog ---
const sheet = ref<'closed' | 'form' | 'confirm'>('closed')
const editing = ref<IUserPhone | null>(null)
const number = ref('')
const isValid = ref(false)
const prefix = ref(DEFAULT_PREFIX)
const label = ref('')
const isWhatsapp = ref(true)
const makePrimary = ref(false)
const numberError = ref<string | null>(null)
const NUMBER_FIELD_ID = 'telefono-numero'
const problem = ref<IFormProblem | null>(null)

const isBusy = computed(
  () =>
    addPhone.isPending.value ||
    updatePhone.isPending.value ||
    setPrimary.isPending.value ||
    deletePhone.isPending.value,
)
// The main number cannot go, and neither can the only one.
const canDelete = computed(
  () => !!editing.value && !editing.value.isPrimary && list.value.length > 1,
)

function open(phone: IUserPhone | null) {
  editing.value = phone
  number.value = phone?.phoneNumber ?? ''
  isValid.value = !!phone
  prefix.value = DEFAULT_PREFIX
  label.value = phone?.label ?? ''
  isWhatsapp.value = phone?.isWhatsapp ?? true
  makePrimary.value = false
  numberError.value = null
  problem.value = null
  sheet.value = 'form'
}

function close() {
  sheet.value = 'closed'
}

function onCountry(country: { iso2?: string } | string | undefined) {
  const iso2 = typeof country === 'string' ? country : country?.iso2
  prefix.value = dialCodeOf(iso2) ?? prefix.value
}

function checkNumber(): boolean {
  const unchanged = editing.value && number.value === editing.value.phoneNumber
  if (!number.value.replace(/\D/g, '')) numberError.value = 'Escribe tu número.'
  else if (!unchanged && !isValid.value)
    numberError.value = `Ese número no es válido para el código ${prefix.value}.`
  else numberError.value = null
  return numberError.value === null
}

// As in every client form: writing drops the error, and a failed send goes back to the field.
watch(number, () => (numberError.value = null))

async function save() {
  if (isBusy.value) return
  if (!checkNumber()) {
    await nextTick()
    document.getElementById(NUMBER_FIELD_ID)?.focus()
    return
  }
  problem.value = null
  try {
    const phone = editing.value
    if (phone) {
      const payload = buildUpdatePhonePayload(
        {
          phoneNumber: number.value,
          isValid: true,
          label: label.value,
          isWhatsapp: isWhatsapp.value,
        },
        phone,
      )
      if (Object.keys(payload).length > 0) {
        await updatePhone.mutateAsync({ phoneId: phone.id, payload })
      }
      if (makePrimary.value && !phone.isPrimary) await setPrimary.mutateAsync(phone.id)
    } else {
      const added = await addPhone.mutateAsync({
        phoneNumber: number.value,
        label: label.value.trim() || undefined,
        isWhatsapp: isWhatsapp.value,
      })
      if (makePrimary.value && added?.id) await setPrimary.mutateAsync(added.id)
    }
  } catch (error) {
    problem.value = generalProblem(error)
    return
  }
  close()
  message.success('Teléfono guardado.')
}

async function remove() {
  const phone = editing.value
  if (!phone || isBusy.value) return
  try {
    await deletePhone.mutateAsync(phone.id)
  } catch (error) {
    // Back to the number, with what went wrong.
    problem.value = generalProblem(error)
    sheet.value = 'form'
    return
  }
  close()
  message.success('Teléfono eliminado.')
}
</script>

<template>
  <div class="phones-section">
    <div v-if="isPending" class="phones-section__list">
      <TtSkeleton v-for="row in SKELETON_ROWS" :key="row" height="var(--tt-control-l)" radius="m" />
    </div>

    <ErrorState
      v-else-if="status === 'error' || isWaitingForNetwork"
      what="tus teléfonos"
      :kind="problemKind(error)"
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else>
      <div class="phones-section__list">
        <button
          v-for="phone in list"
          :key="phone.id"
          type="button"
          class="phones-section__row"
          @click="open(phone)"
        >
          <span class="phones-section__what">
            <span class="phones-section__number">
              {{ phone.phoneNumber }}
              <span v-if="phone.isPrimary" class="phones-section__pill">Principal</span>
            </span>
            <span class="phones-section__details">{{ details(phone) }}</span>
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <NButton class="phones-section__add" @click="open(null)">Agregar teléfono</NButton>
    </template>

    <ConfirmDialog
      :open="sheet === 'confirm'"
      title="¿Eliminar este teléfono?"
      :text="editing?.phoneNumber ?? ''"
      confirm-label="Eliminar teléfono"
      keep-label="Conservar"
      :busy="deletePhone.isPending.value"
      @confirm="remove"
      @keep="sheet = 'form'"
    />

    <BillingSheet
      v-if="sheet === 'form'"
      :title="editing ? 'Editar teléfono' : 'Agregar teléfono'"
      @close="close"
    >
      <div class="phones-section__sheet">
        <FormField :id="NUMBER_FIELD_ID" label="Número" :error="numberError">
          <template #default="{ id, describedby, invalid }">
            <div class="phones-section__phone tt-phone-input">
              <IntlTelInput
                :value="editing?.phoneNumber ?? ''"
                :options="{ ...PHONE_INPUT_OPTIONS, allowDropdown: true }"
                :input-props="{
                  id,
                  autocomplete: 'tel-national',
                  placeholder: '99 123 4567',
                  'aria-describedby': describedby,
                  'aria-invalid': invalid,
                }"
                @change-number="(value: string) => (number = value)"
                @change-validity="(valid: boolean) => (isValid = valid)"
                @change-country="onCountry"
              />
            </div>
          </template>
        </FormField>

        <FormField id="telefono-etiqueta" label="Etiqueta (opcional)">
          <template #default="{ id }">
            <input :id="id" v-model="label" placeholder="Personal, trabajo…" />
          </template>
        </FormField>

        <label class="phones-section__check">
          <input v-model="isWhatsapp" type="checkbox" />
          <span>
            Este número tiene WhatsApp
            <small>Por WhatsApp te escribimos sobre tus pedidos.</small>
          </span>
        </label>

        <p v-if="editing?.isPrimary" class="phones-section__details">
          Es tu número principal: ahí te escribimos primero. Para eliminarlo, marca otro como
          principal.
        </p>
        <label v-else class="phones-section__check">
          <input v-model="makePrimary" type="checkbox" />
          <span>Hacer principal</span>
        </label>

        <FormAlert
          v-if="problem"
          :tone="problem.tone ?? 'bad'"
          :title="problem.title"
          :text="problem.text"
        />

        <NButton
          type="primary"
          size="large"
          block
          :loading="isBusy"
          :disabled="isBusy"
          :aria-busy="isBusy ? 'true' : undefined"
          @click="save"
        >
          Guardar teléfono
        </NButton>
        <NButton v-if="canDelete" size="large" block @click="sheet = 'confirm'">Eliminar</NButton>
      </div>
    </BillingSheet>
  </div>
</template>

<style scoped>
.phones-section,
.phones-section__sheet {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.phones-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
}

.phones-section__row {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  inline-size: 100%;
  min-block-size: var(--tt-control-l);
  padding: var(--tt-space-2) var(--tt-space-3);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.phones-section__row svg {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: var(--tt-ink-muted);
  stroke-width: 1.8;
  stroke-linecap: round;
}

.phones-section__what {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-inline-size: 0;
}

.phones-section__number {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  font-variant-numeric: tabular-nums;
}

.phones-section__pill {
  padding: 0 var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-title-weight);
}

.phones-section__details {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.phones-section__check {
  display: flex;
  align-items: flex-start;
  gap: var(--tt-space-3);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
  cursor: pointer;
}

.phones-section__check input {
  flex: none;
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  margin: 0;
  accent-color: var(--tt-primary);
}

.phones-section__check small {
  display: block;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
}

.phones-section__phone :deep(.iti input) {
  block-size: var(--tt-control-l);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-size: var(--tt-type-title-size);
}

.phones-section__phone :deep(.iti input:focus) {
  border-color: var(--tt-primary);
  box-shadow: 0 0 0 var(--tt-space-1) var(--tt-primary-soft);
}

.phones-section__phone :deep(.iti input[aria-invalid='true']) {
  border-color: var(--tt-danger-ink);
}

@media (min-width: 768px) {
  .phones-section__add {
    align-self: flex-start;
  }
}
</style>
