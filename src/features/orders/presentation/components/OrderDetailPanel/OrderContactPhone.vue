<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { NButton, NCheckbox, NIcon, NModal, useMessage } from 'naive-ui'
import { CreateOutline, LogoWhatsapp } from '@vicons/ionicons5'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { formatWhatsAppNumber, isPhoneValid } from '@/shared/utils/phone.utils'
import { useChangeOrderContactPhone } from '../../../composables/mutations/use-change-order-contact-phone'
import type { IOrderDetail } from '../../../types/responses/order-detail.response'

// The phone the buyer of the order is reached at, and the way to correct it. Whoever writes to
// buyers often knows the right number when the one typed at sign-up was wrong.
const props = defineProps<{
  order: Pick<IOrderDetail, 'id' | 'snapWhatsapp' | 'customerPrimaryPhone'>
}>()

const { has } = usePermissions()
const canEdit = computed(() => has(PERMISSIONS.ORDER_NOTIFY_PAYMENT))
const message = useMessage()
const change = useChangeOrderContactPhone(toRef(() => props.order.id))

const formatted = computed(() =>
  props.order.snapWhatsapp ? formatWhatsAppNumber(props.order.snapWhatsapp) : null,
)

const isOpen = ref(false)
const number = ref('')
const updateAccount = ref(true)
const hasTried = ref(false)
const failed = ref(false)

const isValid = computed(() => isPhoneValid(number.value))
const isSame = computed(() => number.value === props.order.snapWhatsapp)
// Saving the same number still makes sense when the account has a different one.
const nothingToDo = computed(
  () =>
    isSame.value &&
    (!updateAccount.value || props.order.customerPrimaryPhone === props.order.snapWhatsapp),
)

function open() {
  number.value = props.order.snapWhatsapp ?? ''
  updateAccount.value = true
  hasTried.value = false
  failed.value = false
  isOpen.value = true
}

async function save() {
  hasTried.value = true
  failed.value = false
  if (!isValid.value || nothingToDo.value || change.isPending.value) return

  try {
    const result = await change.mutateAsync({
      phoneNumber: number.value,
      updateAccount: updateAccount.value,
    })
    isOpen.value = false
    const others = (result?.updatedOrders ?? 1) - 1
    message.success(
      others > 0
        ? `Teléfono actualizado en este pedido y en ${others} más en curso.`
        : 'Teléfono actualizado.',
    )
  } catch {
    failed.value = true
  }
}
</script>

<template>
  <div class="order-phone">
    <NIcon v-if="formatted" :component="LogoWhatsapp" :size="12" />
    <span data-test="order-phone">{{ formatted ?? 'sin WhatsApp registrado' }}</span>
    <button
      v-if="canEdit"
      type="button"
      class="order-phone__edit"
      data-test="edit-order-phone"
      @click="open"
    >
      <NIcon :component="CreateOutline" :size="12" />
      {{ formatted ? 'Editar' : 'Agregar' }}
    </button>

    <NModal
      v-model:show="isOpen"
      preset="card"
      title="Teléfono del cliente"
      class="order-phone__modal"
      :style="{ width: 'min(420px, calc(100vw - 32px))' }"
      :mask-closable="!change.isPending.value"
    >
      <p class="order-phone__lead">
        Es el número al que se le escribe por WhatsApp. Se corrige en este pedido y en los otros
        pedidos en curso del mismo cliente.
      </p>

      <div class="tt-phone-input order-phone__input">
        <IntlTelInput
          :options="PHONE_INPUT_OPTIONS"
          :value="number"
          :input-props="{ placeholder: 'Ej. 99 123 4567', 'aria-label': 'Número de teléfono' }"
          @change-number="(value: string) => (number = value)"
        />
      </div>
      <p v-if="hasTried && !isValid" class="order-phone__error" data-test="order-phone-invalid">
        Ese número no es válido para el país seleccionado.
      </p>

      <NCheckbox v-model:checked="updateAccount" class="order-phone__account">
        Actualizar también en la cuenta del cliente
      </NCheckbox>
      <p class="order-phone__hint">
        Así sus próximos pedidos salen con el número correcto. Desmárcalo si el número solo aplica a
        este pedido.
      </p>

      <p v-if="failed" class="order-phone__error" data-test="order-phone-failed">
        No pudimos guardar el teléfono. Intenta de nuevo.
      </p>

      <template #footer>
        <div class="order-phone__actions">
          <NButton :disabled="change.isPending.value" @click="isOpen = false">Cancelar</NButton>
          <NButton
            type="primary"
            :loading="change.isPending.value"
            :disabled="nothingToDo"
            data-test="save-order-phone"
            @click="save"
          >
            Guardar
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.order-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  color: #6b7280;
}

.order-phone__edit {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 4px;
  padding: 2px 7px;
  border: 1px solid #d8e0e9;
  border-radius: 6px;
  background: #fff;
  color: #16294d;
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.order-phone__edit:hover {
  background: #f2f5f8;
}

.order-phone__lead,
.order-phone__hint {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #6b7280;
}

.order-phone__input {
  margin-top: 14px;
}

.order-phone__account {
  margin-top: 16px;
}

.order-phone__hint {
  margin-top: 4px;
  padding-left: 24px;
}

.order-phone__error {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: #b42318;
}

.order-phone__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
