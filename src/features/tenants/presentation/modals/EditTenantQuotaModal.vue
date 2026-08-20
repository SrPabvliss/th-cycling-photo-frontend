<script setup lang="ts">
import { ref, watch } from 'vue'
import { NButton, NForm, NFormItem, NInputNumber, NModal } from 'naive-ui'
import { useUpdateTenantQuota } from '../../composables/mutations/use-update-tenant-quota'
import type { TenantListResponse } from '../../types/responses/tenant-list.response'

const props = defineProps<{ show: boolean; tenant: TenantListResponse }>()
const emit = defineEmits<{ (e: 'update:show', val: boolean): void }>()

const quota = ref(props.tenant.eventQuota)

watch(
  () => props.tenant,
  (t) => {
    if (t) {
      quota.value = t.eventQuota
    }
  },
)

const { mutate, isPending } = useUpdateTenantQuota()

const submit = () => {
  mutate(
    { tenantId: props.tenant.id, quota: quota.value },
    {
      onSuccess: () => {
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
    :title="`Edit Quota for ${tenant.name}`"
    style="width: 400px"
  >
    <NForm @submit.prevent="submit">
      <NFormItem label="Event Quota">
        <NInputNumber v-model:value="quota" :min="0" style="width: 100%" />
      </NFormItem>
      <p style="font-size: 13px; color: #666; margin-top: -12px; margin-bottom: 16px">
        Currently used: {{ tenant.eventsUsed }}
      </p>

      <div style="display: flex; justify-content: flex-end; gap: 8px">
        <NButton @click="emit('update:show', false)">Cancel</NButton>
        <NButton type="primary" attr-type="submit" :loading="isPending">Save</NButton>
      </div>
    </NForm>
  </NModal>
</template>
