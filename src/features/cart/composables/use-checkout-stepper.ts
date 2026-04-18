import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'

import { useCartStore } from '../stores/cart.store'

export interface IEventFormData {
  bibNumber: string
  categoryName: string | null
  notes: string
}

export function useCheckoutStepper() {
  const cartStore = useCartStore()
  const message = useMessage()

  const currentStep = ref(0)
  const totalSteps = computed(() => cartStore.groups.length)
  const currentGroup = computed(() => cartStore.groups[currentStep.value])
  const isLastStep = computed(() => currentStep.value === totalSteps.value - 1)

  // Per-event form data
  const eventForms = ref<Map<string, IEventFormData>>(new Map())

  function getForm(eventId: string): IEventFormData {
    if (!eventForms.value.has(eventId)) {
      eventForms.value.set(eventId, { bibNumber: '', categoryName: null, notes: '' })
    }
    return eventForms.value.get(eventId)!
  }

  function isStepComplete(eventId: string): boolean {
    const form = eventForms.value.get(eventId)
    return !!(form && form.categoryName && form.bibNumber)
  }

  function validateCurrent(): boolean {
    if (!currentGroup.value) return false
    const form = getForm(currentGroup.value.eventId)
    if (!form.categoryName) {
      message.warning('Selecciona una categoría')
      return false
    }
    if (!form.bibNumber.trim()) {
      message.warning('Ingresa tu número de dorsal')
      return false
    }
    return true
  }

  function goNext(): boolean {
    if (!validateCurrent()) return false
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++
      return true
    }
    return false
  }

  function goPrev() {
    if (currentStep.value > 0) currentStep.value--
  }

  function handleTabClick(idx: number) {
    if (idx < currentStep.value) {
      currentStep.value = idx
    } else if (idx === currentStep.value + 1 && validateCurrent()) {
      currentStep.value = idx
    }
  }

  return {
    currentStep,
    totalSteps,
    currentGroup,
    isLastStep,
    eventForms,
    getForm,
    isStepComplete,
    validateCurrent,
    goNext,
    goPrev,
    handleTabClick,
  }
}
