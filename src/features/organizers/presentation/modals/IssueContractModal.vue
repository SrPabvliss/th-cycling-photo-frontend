<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { NButton, NDatePicker, NIcon, NInputNumber, NModal } from 'naive-ui'
import {
  AlertCircleOutline,
  DocumentTextOutline,
  PersonOutline,
  RefreshOutline,
  TicketOutline,
} from '@vicons/ionicons5'

import { message } from '@/core/ui/discrete-api'
import { useIssueContract } from '../../composables/mutations/use-issue-contract'
import { useSearchUsersQuery } from '../../composables/queries/use-search-users'
import type { IOrganizerProp } from '../../types/issue-contract-modal.types'
import type { IContractIssued } from '../../types/responses/contract-issued.response'
import type { IPickablePerson } from '../../types/responses/pickable-person.response'
import PersonPicker from '../components/PersonPicker/PersonPicker.vue'

const PENDING_CONTRACT_CODE = 'contract.owner_has_pending_contract'
const GENERIC_ERROR = 'No pudimos emitir el contrato.'
const DAY_IN_MS = 86_400_000

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

const personPicker = ref<InstanceType<typeof PersonPicker> | null>(null)

const picked = ref<IPickablePerson | null>(
  props.mode === 'renew' ? pickedFromOrganizer(props.organizer) : null,
)
const commercialName = ref(props.mode === 'renew' ? (props.organizer?.name ?? '') : '')
const eventsTotal = ref<number | null>(null)
const photosPerEvent = ref<number | null>(null)
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
  search.value = ''
  void nextTick(() => personPicker.value?.focusSearch())
}

function isPastDate(timestamp: number): boolean {
  return timestamp < Date.now() - DAY_IN_MS
}

const canSubmit = computed(
  () =>
    picked.value !== null &&
    commercialName.value.trim().length > 0 &&
    eventsTotal.value != null &&
    eventsTotal.value > 0 &&
    photosPerEvent.value != null &&
    photosPerEvent.value > 0 &&
    validUntil.value.length > 0,
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
      photosPerEvent: photosPerEvent.value as number,
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
  photosPerEvent.value = null
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
    :bordered="false"
    class="icm-modal"
    style="width: 560px; max-width: calc(100vw - 32px)"
  >
    <template #header>
      <div class="tt-modal-head">
        <span class="tt-modal-head__icon">
          <NIcon :component="mode === 'renew' ? RefreshOutline : DocumentTextOutline" :size="22" />
        </span>
        <div>
          <h3>{{ mode === 'renew' ? 'Renovar contrato' : 'Emitir contrato' }}</h3>
          <p>
            {{
              mode === 'renew'
                ? `Se suma cupo nuevo a ${organizer?.name}.`
                : 'Da cupo de eventos a una persona que ya tiene cuenta en Titan TV.'
            }}
          </p>
        </div>
      </div>
    </template>

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

      <section class="tt-fieldset">
        <header class="tt-fieldset__head">
          <span class="tt-fieldset__num">1</span>
          <h4>Titular</h4>
          <NIcon :component="PersonOutline" :size="16" />
        </header>

        <div class="tt-form-field">
          <span>Persona</span>
          <PersonPicker
            ref="personPicker"
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
          <p v-if="mode === 'renew'" class="tt-form-hint">
            El titular del contrato no se puede cambiar en una renovación.
          </p>
        </div>

        <label class="tt-form-field">
          <span>Nombre comercial</span>
          <input
            v-model="commercialName"
            class="icm-input"
            placeholder="Ej. Andes Bike Photo"
            data-test="commercial-name"
            :readonly="isRenewal"
          />
          <p class="tt-form-hint">
            {{
              isRenewal
                ? 'Se mantiene el del organizador.'
                : 'Queda fijado al emitir: el titular lo acepta tal cual, no puede cambiarlo.'
            }}
          </p>
        </label>
      </section>

      <section class="tt-fieldset">
        <header class="tt-fieldset__head">
          <span class="tt-fieldset__num">2</span>
          <h4>Cupo del contrato</h4>
          <NIcon :component="TicketOutline" :size="16" />
        </header>

        <div class="icm-row">
          <label class="tt-form-field icm-field--half">
            <span>Eventos</span>
            <NInputNumber
              v-model:value="eventsTotal"
              :min="1"
              :show-button="false"
              placeholder="Ej. 5"
              data-test="events-total"
            />
          </label>
          <label class="tt-form-field icm-field--half">
            <span>Fotos por evento</span>
            <NInputNumber
              v-model:value="photosPerEvent"
              :min="1"
              :show-button="false"
              placeholder="Ej. 2000"
              data-test="photos-per-event"
            />
          </label>
        </div>
        <p class="tt-form-hint">
          Cuántos eventos puede crear y cuántas fotos caben en cada uno. Se elige cada vez que se
          emite un contrato.
        </p>

        <div class="tt-form-field">
          <span>Vence el</span>
          <NDatePicker
            type="date"
            format="dd MMM yyyy"
            value-format="yyyy-MM-dd"
            placeholder="Elegir fecha"
            style="width: 100%"
            :formatted-value="validUntil.length > 0 ? validUntil : null"
            :is-date-disabled="isPastDate"
            data-test="valid-until"
            @update:formatted-value="(v: string | null) => (validUntil = v ?? '')"
          />
          <p class="tt-form-hint">
            Después de esta fecha el organizador deja de poder crear eventos. No se puede cambiar
            luego de emitir.
          </p>
        </div>
      </section>

      <p class="icm-note">
        Un contrato no se puede editar después de emitirlo. Las únicas correcciones son revocarlo y
        volver a emitirlo.
      </p>
    </form>

    <template #footer>
      <div class="tt-modal-foot">
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
