import { shallowRef, watch, type Ref } from 'vue'

import { useOnline } from '@/core/network/use-online'
import { OFFLINE_PROBLEM, type IFormProblem } from '@/shared/utils/form-problem'

/**
 * What a form says when the server did not do what was asked. "Sin conexión a internet" describes
 * the moment, so it goes away by itself when the network comes back; any other problem stays until
 * the form is sent again.
 */
export function useFormProblem(): Ref<IFormProblem | null> {
  // Shallow: the problems are fixed objects, compared by identity.
  const problem = shallowRef<IFormProblem | null>(null)
  const online = useOnline()
  watch(online, (isOnline) => {
    if (isOnline && problem.value === OFFLINE_PROBLEM) problem.value = null
  })
  return problem
}
