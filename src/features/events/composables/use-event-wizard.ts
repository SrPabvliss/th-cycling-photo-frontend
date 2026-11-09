import { computed, ref } from 'vue'

import { useEventCreationContext } from './queries/use-event-creation-context'
import type { EventWizardRole, IWizardStep } from '../types/event-wizard.types'

export const ORGANIZER_STEPS: IWizardStep[] = [
  { id: 'contract', label: 'Contrato', hint: 'Cupo y fotos' },
  { id: 'configuration', label: 'Configuración', hint: 'Lo que ve el comprador' },
  { id: 'details', label: 'Detalles', hint: 'Nombre, fechas, lugar' },
]

export const TITAN_STEPS: IWizardStep[] = ORGANIZER_STEPS.slice(1)

export function useEventWizard() {
  const creationContext = useEventCreationContext()

  const role = computed<EventWizardRole>(() =>
    creationContext.data.value?.requiresContract === false ? 'titan' : 'organizer',
  )

  const steps = computed<IWizardStep[]>(() =>
    role.value === 'titan' ? TITAN_STEPS : ORGANIZER_STEPS,
  )

  const currentIndex = ref(0)

  function goNext() {
    currentIndex.value = Math.min(currentIndex.value + 1, steps.value.length - 1)
  }

  function goBack() {
    currentIndex.value = Math.max(currentIndex.value - 1, 0)
  }

  return {
    role,
    steps,
    currentIndex,
    goNext,
    goBack,
    contract: computed(() => creationContext.data.value?.contract ?? null),
    isLoading: creationContext.isPending,
    isError: creationContext.isError,
    refetch: creationContext.refetch,
  }
}
