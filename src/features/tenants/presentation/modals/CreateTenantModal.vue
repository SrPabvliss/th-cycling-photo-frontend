<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NInputNumber, NModal } from 'naive-ui'
import { useCreateTenant } from '../../composables/mutations/use-create-tenant'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const name = ref('')
const adminEmail = ref('')
const adminPassword = ref('')
const adminFirstName = ref('')
const adminLastName = ref('')
const eventQuota = ref(0)

const { mutate, isPending } = useCreateTenant()

const submit = () => {
  mutate(
    {
      name: name.value,
      adminEmail: adminEmail.value,
      adminPassword: adminPassword.value,
      adminFirstName: adminFirstName.value,
      adminLastName: adminLastName.value,
      eventQuota: eventQuota.value,
    },
    {
      onSuccess: () => {
        name.value = ''
        adminEmail.value = ''
        adminPassword.value = ''
        adminFirstName.value = ''
        adminLastName.value = ''
        eventQuota.value = 0
        emit('update:show', false)
      },
    },
  )
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v) => emit('update:show', v)"
    preset="card"
    title="Crear tenant"
    style="width: 500px"
  >
    <NForm @submit.prevent="submit">
      <NFormItem label="Nombre del tenant" required>
        <NInput v-model:value="name" />
      </NFormItem>
      <NFormItem label="Cupo de eventos" required>
        <NInputNumber v-model:value="eventQuota" :min="0" style="width: 100%" />
      </NFormItem>

      <h3 style="margin-top: 16px; margin-bottom: 16px; font-weight: 600">
        Datos del usuario administrador
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
        <NFormItem label="Nombres" required>
          <NInput v-model:value="adminFirstName" />
        </NFormItem>
        <NFormItem label="Apellidos" required>
          <NInput v-model:value="adminLastName" />
        </NFormItem>
      </div>
      <NFormItem label="Correo electrónico" required>
        <NInput v-model:value="adminEmail" />
      </NFormItem>
      <NFormItem label="Contraseña" required>
        <NInput v-model:value="adminPassword" type="password" show-password-on="click" />
      </NFormItem>

      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" attr-type="submit" :loading="isPending">Crear</NButton>
      </div>
    </NForm>
  </NModal>
</template>
