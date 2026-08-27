<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { NButton, NIcon, NModal } from 'naive-ui'
import { AlertCircleOutline, RefreshOutline } from '@vicons/ionicons5'

import { message } from '@/core/ui/discrete-api'
import { useIssueContract } from '../../composables/mutations/use-issue-contract'
import { useSearchUsersQuery } from '../../composables/queries/use-search-users'
import type { IOrganizerProp } from '../../types/issue-contract-modal.types'
import type { IContractIssued } from '../../types/responses/contract-issued.response'
import type { IPickablePerson } from '../../types/responses/pickable-person.response'
import PersonPicker from '../components/PersonPicker/PersonPicker.vue'

const PENDING_CONTRACT_CODE = 'contract.owner_has_pending_contract'
const GENERIC_ERROR = 'No pudimos emitir el contrato.'

const props = withDefaults(
  defineProps<{
    show?: boolean
    mode: 'new' | 'renew'
    organizer?: IOrganizerProp | null
  }>(),
  { show: true, organizer: null },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  issued: [result: IContractIssued]
}>()

function pickedFromOrganizer(organizer: IOrganizerProp | null): IPickablePerson | null {
  if (!organizer) return null
  return {
    id: organizer.id,
    name: organizer.holderName ?? organizer.name,
    email: organizer.holderEmail ?? '',
    since: organizer.createdAt ? new Date(organizer.createdAt) : new Date(),
    emailVerified: organizer.holderEmailVerified ?? true,
    hasOrganizer: true,
    organizerName: organizer.name,
  }
}

const picked = ref<IPickablePerson | null>(
  props.mode === 'renew' ? pickedFromOrganizer(props.organizer) : null,
)
const commercialName = ref(props.mode === 'renew' ? (props.organizer?.name ?? '') : '')
const eventsTotal = ref<number | null>(null)
const photosPerEvent = ref<number | ''>('')
const validUntil = ref('')
const search = ref('')
const pendingRejection = ref(false)

const { data: searchResults, isFetching: isSearching } = useSearchUsersQuery(search)
const { mutate, isPending } = useIssueContract()

function resetForRenewal(organizer: IOrganizerProp | null) {
  picked.value = pickedFromOrganizer(organizer)
  commercialName.value = organizer?.name ?? ''
}

watch(
  () => [props.mode, props.organizer] as const,
  ([mode, organizer]) => {
    if (mode === 'renew') resetForRenewal(organizer)
  },
)

const renewalDetected = computed(
  () => props.mode === 'new' && picked.value !== null && picked.value.hasOrganizer,
)
const isRenewal = computed(() => props.mode === 'renew' || renewalDetected.value)
const renewalOrganizerName = computed(
  () => (props.mode === 'renew' ? props.organizer?.name : picked.value?.organizerName) ?? '',
)

watch(picked, (person) => {
  if (props.mode === 'new' && person?.hasOrganizer) {
    commercialName.value = person.organizerName ?? ''
  }
  pendingRejection.value = false
})

function handlePick(person: IPickablePerson) {
  picked.value = person
}

function handleClear() {
  picked.value = null
  commercialName.value = ''
}

const canSubmit = computed(
  () =>
    picked.value !== null &&
    commercialName.value.trim().length > 0 &&
    eventsTotal.value != null &&
    photosPerEvent.value !== '' &&
    validUntil.value.trim().length > 0,
)

function readErrorCode(caught: unknown): string | undefined {
  if (!isAxiosError(caught)) return undefined
  return caught.response?.data?.error?.code
}

function readErrorMessage(caught: unknown): string {
  if (!isAxiosError(caught)) return GENERIC_ERROR
  return caught.response?.data?.error?.message ?? GENERIC_ERROR
}

function submit() {
  if (!canSubmit.value || !picked.value) return

  pendingRejection.value = false

  mutate(
    {
      ownerEmail: picked.value.email,
      commercialName: commercialName.value,
      eventsTotal: eventsTotal.value as number,
      photosPerEvent: Number(photosPerEvent.value),
      validUntil: validUntil.value,
    },
    {
      onSuccess: (result) => {
        emit('issued', result)
        close()
      },
      onError: (caught) => {
        const code = readErrorCode(caught)
        if (code === PENDING_CONTRACT_CODE) {
          pendingRejection.value = true
          return
        }
        message.error(readErrorMessage(caught))
      },
    },
  )
}

function reset() {
  picked.value = props.mode === 'renew' ? pickedFromOrganizer(props.organizer) : null
  commercialName.value = props.mode === 'renew' ? (props.organizer?.name ?? '') : ''
  eventsTotal.value = null
  photosPerEvent.value = ''
  validUntil.value = ''
  search.value = ''
  pendingRejection.value = false
}

function close() {
  emit('update:show', false)
  reset()
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v: boolean) => emit('update:show', v)"
    preset="card"
    :title="mode === 'renew' ? 'Renovar contrato' : 'Emitir contrato'"
    style="width: 520px"
  >
    <template #header-extra>{{
      mode === 'renew' ? organizer?.name : 'Un contrato da cupo de eventos a una persona con cuenta'
    }}</template>

    <form class="icm-body" data-test="issue-contract-form" @submit.prevent="submit">
      <div v-if="isRenewal" class="icm-notice icm-notice--blue" data-test="renewal-notice">
        <NIcon :component="RefreshOutline" :size="16" />
        <div>
          <b>Esta persona ya tiene un organizador.</b>
          <span
            >El contrato se sumará a {{ renewalOrganizerName }}; no se creará un organizador
            nuevo.</span
          >
        </div>
      </div>

      <div
        v-if="pendingRejection"
        class="icm-notice icm-notice--red"
        data-test="pending-rejection-notice"
      >
        <NIcon :component="AlertCircleOutline" :size="16" />
        <div>
          <b>Esta persona ya tiene un contrato pendiente.</b>
          <span>Solo puede haber uno a la vez. Revoca el anterior o espera a que lo acepte.</span>
        </div>
      </div>

      <label class="icm-field">
        <span class="icm-field__label">Persona</span>
        <PersonPicker
          :picked="picked"
          :users="searchResults ?? []"
          :search="search"
          :loading="isSearching"
          :rejected="pendingRejection"
          :locked="mode === 'renew'"
          @update:search="(v: string) => (search = v)"
          @pick="handlePick"
          @clear="handleClear"
        />
        <span v-if="mode === 'renew'" class="icm-field__hint">
          El titular del contrato no se puede cambiar en una renovación.
        </span>
      </label>

      <label class="icm-field">
        <span class="icm-field__label">Nombre comercial</span>
        <input
          v-model="commercialName"
          class="icm-input"
          data-test="commercial-name"
          :readonly="isRenewal"
        />
        <span class="icm-field__hint">
          {{
            isRenewal
              ? 'Se mantiene el del organizador.'
              : 'Queda fijado al emitir: el titular lo acepta tal cual, no puede cambiarlo.'
          }}
        </span>
      </label>

      <div class="icm-row">
        <label class="icm-field icm-field--half">
          <span class="icm-field__label">Eventos</span>
          <input
            v-model.number="eventsTotal"
            type="number"
            min="1"
            class="icm-input"
            data-test="events-total"
          />
        </label>
        <label class="icm-field icm-field--half">
          <span class="icm-field__label">Fotos por evento</span>
          <input
            v-model="photosPerEvent"
            type="number"
            min="1"
            placeholder="Ej. 2000"
            class="icm-input"
            data-test="photos-per-event"
          />
          <span class="icm-field__hint"
            >Límite de este contrato. Se elige cada vez que se emite.</span
          >
        </label>
      </div>

      <label class="icm-field icm-field--half">
        <span class="icm-field__label">Vence el</span>
        <input v-model="validUntil" type="date" class="icm-input" data-test="valid-until" />
        <span class="icm-field__hint">No se puede cambiar después de emitir.</span>
      </label>

      <p class="icm-note">
        Un contrato no se puede editar después de emitirlo. Las únicas correcciones son revocarlo y
        volver a emitirlo.
      </p>
    </form>

    <template #footer>
      <div class="icm-footer">
        <NButton @click="close">Cancelar</NButton>
        <NButton
          type="primary"
          :disabled="!canSubmit"
          :loading="isPending"
          data-test="submit-issue"
          @click="submit"
        >
          {{ mode === 'renew' ? 'Emitir renovación' : 'Emitir contrato' }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./issue-contract-modal.css" />
