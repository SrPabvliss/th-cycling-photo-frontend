<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NFormItem, NInput, NTag } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useUpdateTenantProfile } from '../../composables/mutations/use-update-tenant-profile'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

const props = defineProps<{ profile: TenantProfileResponse }>()

const { has } = usePermissions()
const canEditProfile = computed(() => has(PERMISSIONS.TENANT_PROFILE_UPDATE))

const whatsappNumber = ref(props.profile.whatsappNumber ?? '')

watch(
  () => props.profile,
  (profile) => {
    whatsappNumber.value = profile.whatsappNumber ?? ''
  },
)

const hasChanges = computed(() => whatsappNumber.value !== (props.profile.whatsappNumber ?? ''))

const { mutate, isPending } = useUpdateTenantProfile()

function submit() {
  if (!hasChanges.value) return
  mutate({ whatsappNumber: whatsappNumber.value })
}
</script>

<template>
  <NCard title="Contacto" class="contact-section">
    <NFormItem label="Número de WhatsApp">
      <NInput v-model:value="whatsappNumber" :disabled="!canEditProfile" placeholder="0999999999" />
      <NTag v-if="profile.whatsappPendingVerification" type="warning" style="margin-left: 8px">
        Pendiente de verificar
      </NTag>
    </NFormItem>

    <NButton
      v-if="canEditProfile"
      type="primary"
      :disabled="!hasChanges"
      :loading="isPending"
      @click="submit"
    >
      Guardar cambios
    </NButton>
  </NCard>
</template>
