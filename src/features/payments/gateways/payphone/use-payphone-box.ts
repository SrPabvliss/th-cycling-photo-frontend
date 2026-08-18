import { ref, type Ref } from 'vue'

import {
  loadExternalScript,
  loadExternalStylesheet,
} from '@/shared/composables/use-external-script'
import type { IPaymentIntent } from '@/features/payments/types/responses/payment-intent.response'
import { PAYPHONE_SDK } from './payphone-sdk.constants'
import type {
  IPayphoneBoxInstance,
  IPayphonePaymentOutcome,
  PayphoneBoxConstructor,
} from './payphone-box.types'

export function usePayphoneBox() {
  const isReady = ref(false)
  const isProcessing = ref(false)
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
      isAsyncResponse: true,
    }

    const box = new BoxConstructor(params)

    if (typeof box.startProcessPaymentAsync !== 'function') {
      throw new Error(
        'Payphone payment box no longer exposes startProcessPaymentAsync; fall back to the redirect flow',
      )
    }

    box.render(PAYPHONE_SDK.CONTAINER_ID)
    instance.value = box
    isReady.value = true
  }

  async function pay(): Promise<IPayphonePaymentOutcome> {
    const box = instance.value
    if (!box?.startProcessPaymentAsync) throw new Error('Payment box is not ready')

    isProcessing.value = true
    try {
      return await box.startProcessPaymentAsync()
    } finally {
      isProcessing.value = false
    }
  }

  function destroy(): void {
    instance.value?.destroy?.()
    instance.value = null
    isReady.value = false
  }

  return { isReady, isProcessing, render, pay, destroy }
}
