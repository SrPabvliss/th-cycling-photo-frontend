import { ref, type Ref } from 'vue'

import {
  loadExternalScript,
  loadExternalStylesheet,
} from '@/shared/composables/use-external-script'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'
import { PAYPHONE_SDK } from './payphone-sdk.constants'
import type { IPayphoneBoxInstance, PayphoneBoxConstructor } from './payphone-box.types'

export function usePayphoneBox() {
  const isReady = ref(false)
  const instance: Ref<IPayphoneBoxInstance | null> = ref(null)

  async function render(intent: IPaymentIntent): Promise<void> {
    await Promise.all([
      loadExternalStylesheet(PAYPHONE_SDK.STYLESHEET),
      loadExternalScript(PAYPHONE_SDK.SCRIPT, { type: 'module' }),
    ])

    const BoxConstructor = (window as unknown as { PPaymentButtonBox?: PayphoneBoxConstructor })
      .PPaymentButtonBox
    if (!BoxConstructor) throw new Error('Payphone payment box did not load')

    const params: Record<string, unknown> = {
      ...intent.payload,
      lang: 'es',
      defaultMethod: 'card',
      timeZone: -5,
      isAsyncResponse: false,
    }

    const box = new BoxConstructor(params)

    box.render(PAYPHONE_SDK.CONTAINER_ID)
    instance.value = box
    isReady.value = true
  }

  function destroy(): void {
    instance.value?.destroy?.()
    instance.value = null
    isReady.value = false
  }

  return { isReady, render, destroy }
}
