<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NIcon, NInput, NModal } from 'naive-ui'
import { AlertCircleOutline, CheckmarkOutline } from '@vicons/ionicons5'

const props = defineProps<{
  show: boolean
  methods: string[]
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  'update:show': [boolean]
  confirm: [password: string]
  cancel: []
}>()

const password = ref('')

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) password.value = ''
  },
)

function cancel() {
  emit('update:show', false)
  emit('cancel')
}

function confirm() {
  if (password.value.length === 0 || props.loading) return
  emit('confirm', password.value)
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Confirma tu contraseña"
    style="width: 460px; max-width: calc(100vw - 32px)"
    :closable="!loading"
    :mask-closable="false"
    @update:show="emit('update:show', $event)"
  >
    <div class="ce-pass" data-test="password-modal">
      <p class="ce-pass-sub">
        Necesitamos verificar que eres tú antes de crear tus métodos de pago.
      </p>

      <div class="ce-authbox">
        <span class="tt-field-l">Esto autoriza</span>
        <ul class="ce-authlist">
          <li v-for="method in methods" :key="method" data-test="auth-item">
            <NIcon :component="CheckmarkOutline" :size="14" />
            Crear {{ method }} en tu cuenta
          </li>
        </ul>
        <p>
          Nada más se guarda con esta contraseña. Los datos que reusaste de tu perfil no la
          necesitan.
        </p>
      </div>

      <div class="tt-field">
        <span class="tt-field-l">Contraseña</span>
        <NInput
          v-model:value="password"
          type="password"
          placeholder="Tu contraseña"
          data-test="password-input"
          :status="error ? 'error' : undefined"
          @keyup.enter="confirm"
        />
        <span v-if="error" class="ce-fhint err" data-test="password-error">
          <NIcon :component="AlertCircleOutline" :size="13" />
          {{ error }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="ce-pass-foot">
        <NButton :disabled="loading" data-test="cancel-password" @click="cancel">Cancelar</NButton>
        <NButton
          type="primary"
          :loading="loading"
          :disabled="password.length === 0 || loading"
          data-test="confirm-password"
          @click="confirm"
        >
          Confirmar y continuar
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./password-confirm-modal.css" />
