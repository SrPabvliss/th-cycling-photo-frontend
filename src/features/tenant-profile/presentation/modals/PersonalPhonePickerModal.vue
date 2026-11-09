<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NEmpty, NIcon, NModal, NSpin, NTag } from 'naive-ui'
import { LogoWhatsapp } from '@vicons/ionicons5'

import { formatWhatsAppNumber, isPhoneValid } from '@/shared/utils/phone.utils'
import { useMyPhonesQuery } from '@/features/account/composables/queries/use-my-phones'

const props = defineProps<{ show: boolean; currentNumber: string | null; saving?: boolean }>()

const emit = defineEmits<{
  'update:show': [boolean]
  select: [phoneNumber: string]
}>()

const { data: phones, isLoading } = useMyPhonesQuery()

const selectablePhones = computed(() =>
  (phones.value ?? [])
    .filter((phone) => phone.isWhatsapp)
    .map((phone) => ({
      ...phone,
      isUsable: isPhoneValid(phone.phoneNumber),
      isCurrent: phone.phoneNumber === props.currentNumber,
    })),
)

const selected = ref<string | null>(null)

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) selected.value = null
  },
)

const canConfirm = computed(() => selected.value !== null && selected.value !== props.currentNumber)

function confirm() {
  if (!canConfirm.value || props.saving) return
  emit('select', selected.value as string)
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Usar uno de mis teléfonos"
    style="width: 460px; max-width: calc(100vw - 32px)"
    :closable="!saving"
    :mask-closable="!saving"
    @update:show="emit('update:show', $event)"
  >
    <p class="phone-picker__intro">
      Solo aparecen los teléfonos personales que tienes marcados con WhatsApp. El número que elijas
      se guarda como contacto de tu negocio y queda visible en la galería pública.
    </p>

    <NSpin v-if="isLoading" size="small" class="phone-picker__loading" />

    <NEmpty
      v-else-if="selectablePhones.length === 0"
      description="No tienes teléfonos personales con WhatsApp activo."
      size="small"
    />

    <ul v-else class="phone-picker__list">
      <li v-for="phone in selectablePhones" :key="phone.id">
        <button
          type="button"
          class="phone-picker__row"
          :class="{
            'is-selected': selected === phone.phoneNumber,
            'is-disabled': !phone.isUsable,
          }"
          :disabled="!phone.isUsable || saving"
          @click="selected = phone.phoneNumber"
        >
          <span class="phone-picker__wa">
            <NIcon :component="LogoWhatsapp" :size="20" />
          </span>

          <span class="phone-picker__info">
            <span class="phone-picker__number">
              {{ formatWhatsAppNumber(phone.phoneNumber) }}
              <NTag v-if="phone.isPrimary" size="small" :bordered="false" class="phone-picker__tag">
                Principal
              </NTag>
              <NTag
                v-if="phone.isCurrent"
                size="small"
                :bordered="false"
                type="success"
                class="phone-picker__tag"
              >
                En uso
              </NTag>
            </span>
            <span class="phone-picker__meta">
              {{ phone.isUsable ? (phone.label ?? 'Recibe WhatsApp') : 'Número incompleto' }}
            </span>
          </span>
        </button>
      </li>
    </ul>

    <template #footer>
      <div class="phone-picker__foot">
        <NButton :disabled="saving" @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" :disabled="!canConfirm" :loading="saving" @click="confirm">
          Usar este número
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.phone-picker__intro {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.75;
}

.phone-picker__loading {
  display: block;
  margin: 24px auto;
}

.phone-picker__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.phone-picker__row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid var(--tt-neutral-light, #e6e7eb);
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.phone-picker__row:hover:not(.is-disabled) {
  border-color: #1da851;
}

.phone-picker__row.is-selected {
  border-color: #1da851;
  background: #f3fbf6;
}

.phone-picker__row.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.phone-picker__wa {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  align-self: stretch;
  border-radius: 10px;
  background: #e7f9ef;
  color: #1da851;
}

.phone-picker__row.is-disabled .phone-picker__wa {
  background: #f3f4f6;
  color: #b6bac1;
}

.phone-picker__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.phone-picker__number {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1f2c;
}

.phone-picker__tag {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
}

.phone-picker__meta {
  font-size: 13px;
  color: #6b7280;
}

.phone-picker__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
