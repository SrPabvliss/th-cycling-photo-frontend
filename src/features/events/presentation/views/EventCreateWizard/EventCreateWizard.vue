<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { AlertCircleOutline, CloseOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { usePhotoCategoriesGlobalQuery } from '@/features/photo-categories/composables/queries/use-photo-categories-global'
import { useEventCreationContext } from '../../../composables/queries/use-event-creation-context'
import { useEventCreationSubmit } from '../../../composables/use-event-creation-submit'
import { useEventWizard } from '../../../composables/use-event-wizard'
import type { ConfigurationItemId } from '../../../composables/use-configuration-items'
import type { IEventFormData, IEventFormExtra } from '../../../types/event-form.types'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import WizardStepper from './WizardStepper.vue'
import WizardFooter from './WizardFooter.vue'
import ContractStep from './steps/ContractStep.vue'
import ConfigurationStep from './steps/ConfigurationStep.vue'
import DetailsStep from './steps/DetailsStep.vue'
import ConfirmationStep from './steps/ConfirmationStep.vue'
import PasswordConfirmModal from './modals/PasswordConfirmModal.vue'
import CreatingModal from './modals/CreatingModal.vue'
import NoSlotModal from './modals/NoSlotModal.vue'
import ExitWarningModal from './modals/ExitWarningModal.vue'

const router = useRouter()

const { role, steps, currentIndex, goNext, goBack, contract, isLoading, isError, refetch } =
  useEventWizard()

const { data: creationContext } = useEventCreationContext()
const { data: allCategories } = usePhotoCategoriesGlobalQuery()

const configurationRef = ref<InstanceType<typeof ConfigurationStep> | null>(null)
const detailsRef = ref<InstanceType<typeof DetailsStep> | null>(null)

const canContinueContract = ref(false)
const canContinueConfiguration = ref(false)
const wizardKey = ref(0)

const {
  isSubmitting,
  payoutError,
  isPasswordOpen,
  isPasswordPending,
  passwordError,
  passwordLabels,
  creatingStep,
  isCreatingOpen,
  isNoSlotOpen,
  createdPayoutLabels,
  createdEventSlug,
  isCreated,
  coverImage,
  categories,
  profileSave,
  submit: submitEvent,
  confirmPassword,
  cancelPassword,
  closeNoSlot,
  retry: retryResource,
  reset: resetSubmission,
} = useEventCreationSubmit({
  items: () => configurationRef.value?.items ?? [],
  toSelection: () => configurationRef.value?.toSelection() ?? {},
  openItem: (id: ConfigurationItemId) => {
    const item = configurationRef.value?.items.find((entry) => entry.id === id)
    if (item && !item.isOpen) configurationRef.value?.toggle(id)
  },
  goToConfiguration: () => {
    const index = steps.value.findIndex((step) => step.id === 'configuration')
    if (index >= 0) currentIndex.value = index
  },
  describeCategories: (ids: number[]) =>
    ids
      .map((id) => allCategories.value?.find((category) => category.id === id)?.name)
      .filter((name): name is string => name !== undefined)
      .join(', '),
})

const currentStep = computed(() => steps.value[currentIndex.value])
const isLastStep = computed(() => currentIndex.value === steps.value.length - 1)

const subtitle = computed(() =>
  role.value === 'titan'
    ? 'Titan TV · el evento no consume cupos de ningún contrato'
    : contract.value
      ? `Organizador · ${contract.value.commercialName}`
      : 'Organizador',
)

const freeSlots = computed(() => {
  if (!contract.value) return null
  return contract.value.eventsTotal - contract.value.eventsUsed
})

const photoQuota = computed(() =>
  role.value === 'organizer'
    ? (contract.value?.photosPerEvent ?? null)
    : (creationContext.value?.defaultEventPhotoQuota ?? null),
)

const slotsAtSubmit = ref<number | null>(null)

const slotsRemaining = computed(() =>
  slotsAtSubmit.value === null ? null : slotsAtSubmit.value - 1,
)

const readyCount = computed(() => configurationRef.value?.readyCount ?? 0)
const totalCount = computed(() => configurationRef.value?.totalCount ?? 5)
const isConfigurationComplete = computed(() => canContinueConfiguration.value)

interface IFooterProps {
  listos?: number
  total?: number
  cta: string
  dis: boolean
  nota: string | null
}

const footerProps = computed<IFooterProps>(() => {
  if (currentStep.value?.id === 'configuration') {
    return {
      listos: readyCount.value,
      total: totalCount.value,
      dis: !isConfigurationComplete.value,
      nota: isConfigurationComplete.value ? null : 'Completa los cinco datos para continuar',
      cta: 'Continuar',
    }
  }

  if (currentStep.value?.id === 'details') {
    return {
      dis: !detailsRef.value?.canSubmit || isSubmitting.value,
      nota: role.value === 'organizer' ? 'Se consume un cupo al crear' : null,
      cta: 'Crear evento',
    }
  }

  return {
    dis: !canContinueContract.value,
    nota: canContinueContract.value ? null : 'Sin cupos disponibles',
    cta: 'Continuar',
  }
})

const eventDateRangeLabel = ref('')
const eventName = ref('')

function handleFooterNext() {
  if (isLastStep.value) {
    detailsRef.value?.submit()
    return
  }
  goNext()
}

async function handleSubmit(formData: IEventFormData, extra: IEventFormExtra) {
  slotsAtSubmit.value = freeSlots.value
  eventName.value = formData.name
  eventDateRangeLabel.value = `${formatDate(new Date(formData.startDate ?? Date.now()))} → ${formatDate(
    new Date(formData.endDate ?? Date.now()),
  )}`
  await submitEvent(formData, extra)
}

const isExitOpen = ref(false)
const isLeaving = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

const isGuarded = computed(() => !isCreated.value && !isLeaving.value)

onBeforeRouteLeave((to) => {
  if (!isGuarded.value) return true
  pendingRoute.value = to
  isExitOpen.value = true
  return false
})

function warnOnUnload(event: BeforeUnloadEvent) {
  if (!isGuarded.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', warnOnUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnOnUnload))

function exitWizard() {
  router.push({ name: EVENT_ROUTE_NAMES.LIST })
}

function stayInWizard() {
  isExitOpen.value = false
  pendingRoute.value = null
}

function leaveWizard() {
  isExitOpen.value = false
  isLeaving.value = true
  const target = pendingRoute.value
  pendingRoute.value = null
  router.push(target ? target.fullPath : { name: EVENT_ROUTE_NAMES.LIST })
}

function goToEvents() {
  closeNoSlot()
  isLeaving.value = true
  router.push({ name: EVENT_ROUTE_NAMES.LIST })
}

function goToCreatedEvent() {
  const slug = createdEventSlug.value
  if (!slug) {
    goToEvents()
    return
  }
  router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug } })
}

function createAnother() {
  resetSubmission()
  slotsAtSubmit.value = null
  canContinueConfiguration.value = false
  currentIndex.value = 0
  wizardKey.value += 1
}
</script>

<template>
  <div class="ce-page">
    <NSpin v-if="isLoading" size="large" class="ce-loading" />

    <NResult
      v-else-if="isError"
      status="error"
      title="No pudimos cargar el contexto del evento"
      description="Intenta de nuevo en unos segundos."
    >
      <template #footer>
        <NButton @click="refetch()">Reintentar</NButton>
      </template>
    </NResult>

    <template v-else>
      <div class="ce-page-head">
        <div>
          <h1>Crear evento</h1>
          <p>{{ subtitle }}</p>
        </div>
        <NButton quaternary @click="exitWizard">
          <template #icon><NIcon :component="CloseOutline" /></template>
          Salir
        </NButton>
      </div>

      <WizardStepper
        v-if="!isCreated"
        :steps="steps"
        :current-index="currentIndex"
        variant="mobile"
        @back="goBack"
        @exit="exitWizard"
      />

      <div v-if="isCreated" class="ce-panel solo" data-test="confirmation-panel">
        <div class="ce-panel-body">
          <ConfirmationStep
            :event-name="eventName"
            :event-date-range-label="eventDateRangeLabel"
            :role="role"
            :slots-remaining="slotsRemaining"
            :photo-quota="photoQuota"
            :cover-image="coverImage"
            :categories="categories"
            :profile-save="profileSave"
            @retry="retryResource"
            @go-to-event="goToCreatedEvent"
            @create-another="createAnother"
          />
        </div>
      </div>

      <div v-else class="ce-layout">
        <aside class="ce-rail">
          <WizardStepper :steps="steps" :current-index="currentIndex" variant="rail" />
          <div v-if="role === 'organizer' && contract" class="ce-railcard">
            <span>Contrato</span>
            <b>{{ contract.commercialName }}</b>
            <i>{{ freeSlots }} de {{ contract.eventsTotal }} cupos libres</i>
          </div>
        </aside>

        <div class="ce-panel">
          <div class="ce-panel-body">
            <div v-if="payoutError" class="ce-payout-error" data-test="payout-error">
              <NIcon :component="AlertCircleOutline" :size="18" />
              <div>
                <b>No se creó el método de pago</b>
                {{ payoutError }}
              </div>
            </div>

            <ContractStep
              v-if="role === 'organizer'"
              v-show="currentStep?.id === 'contract'"
              :key="`contrato-${wizardKey}`"
              @update:can-continue="canContinueContract = $event"
            />
            <ConfigurationStep
              v-show="currentStep?.id === 'configuration'"
              :key="`config-${wizardKey}`"
              ref="configurationRef"
              @update:can-continue="canContinueConfiguration = $event"
            />
            <DetailsStep
              v-show="currentStep?.id === 'details'"
              :key="`detalles-${wizardKey}`"
              ref="detailsRef"
              :is-submitting="isCreatingOpen"
              @submit="handleSubmit"
            />
          </div>

          <WizardFooter
            :back="currentIndex > 0"
            :listos="footerProps.listos"
            :total="footerProps.total"
            :cta="footerProps.cta"
            :dis="footerProps.dis"
            :nota="footerProps.nota"
            @next="handleFooterNext"
            @back="goBack"
          />
        </div>
      </div>
    </template>

    <PasswordConfirmModal
      :show="isPasswordOpen"
      :methods="passwordLabels"
      :loading="isPasswordPending"
      :error="passwordError"
      @update:show="isPasswordOpen = $event"
      @confirm="confirmPassword"
      @cancel="cancelPassword"
    />

    <CreatingModal :show="isCreatingOpen" :step="creatingStep ?? 0" />

    <NoSlotModal
      :show="isNoSlotOpen"
      @update:show="isNoSlotOpen = $event"
      @back-to-events="goToEvents"
    />

    <ExitWarningModal
      :show="isExitOpen"
      :created-methods="createdPayoutLabels"
      @update:show="isExitOpen = $event"
      @stay="stayInWizard"
      @leave="leaveWizard"
    />
  </div>
</template>

<style scoped src="./event-create-wizard.css" />
