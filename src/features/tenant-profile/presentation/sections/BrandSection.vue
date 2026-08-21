<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NCard, NFormItem, NInput } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useUpdateTenantProfile } from '../../composables/mutations/use-update-tenant-profile'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

const props = defineProps<{ profile: TenantProfileResponse }>()

const { has } = usePermissions()
const canEditProfile = computed(() => has(PERMISSIONS.TENANT_PROFILE_UPDATE))

const publicName = ref(props.profile.publicName ?? '')
const watermarkStorageKey = ref(props.profile.watermarkStorageKey ?? '')

watch(
  () => props.profile,
  (profile) => {
    publicName.value = profile.publicName ?? ''
    watermarkStorageKey.value = profile.watermarkStorageKey ?? ''
  },
)

const hasChanges = computed(
  () =>
    publicName.value !== (props.profile.publicName ?? '') ||
    watermarkStorageKey.value !== (props.profile.watermarkStorageKey ?? ''),
)

const { mutate, isPending } = useUpdateTenantProfile()

function submit() {
  const payload: Record<string, string | null> = {}
  if (publicName.value !== (props.profile.publicName ?? '')) {
    const trimmed = publicName.value.trim()
    payload.publicName = trimmed === '' ? null : trimmed
  }
  if (watermarkStorageKey.value !== (props.profile.watermarkStorageKey ?? '')) {
    const trimmed = watermarkStorageKey.value.trim()
    payload.watermarkStorageKey = trimmed === '' ? null : trimmed
  }
  if (Object.keys(payload).length === 0) return
  mutate(payload)
}
</script>

<template>
  <NCard title="Marca" class="brand-section">
    <NFormItem label="Nombre público">
      <NInput v-model:value="publicName" :disabled="!canEditProfile" placeholder="Nombre público" />
    </NFormItem>

    <NFormItem label="Marca de agua">
      <NInput
        v-model:value="watermarkStorageKey"
        :disabled="!canEditProfile"
        placeholder="Clave de almacenamiento de la marca de agua"
      />
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
