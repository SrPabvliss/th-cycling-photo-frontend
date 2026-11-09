<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import { pluralize } from '@/shared/utils/format.utils'

interface IRetouchPageHeaderProps {
  title: string
  subtitle?: string
  totalOrders?: number
  totalPendingPhotos?: number
  startCtaLabel?: string
  backTo?: string
  startDisabled?: boolean
  hideStartCta?: boolean
}

const props = defineProps<IRetouchPageHeaderProps>()
defineEmits<{ start: [] }>()

const fullSubtitle = computed(() => {
  const parts: string[] = []
  if (props.subtitle) parts.push(props.subtitle)
  if (props.totalOrders !== undefined) {
    parts.push(`${props.totalOrders} ${pluralize(props.totalOrders, 'orden', 'órdenes')}`)
  }
  if (props.totalPendingPhotos !== undefined) {
    parts.push(
      `${props.totalPendingPhotos} ${pluralize(props.totalPendingPhotos, 'foto pendiente', 'fotos pendientes')}`,
    )
  }
  return parts.join(' · ')
})

const ctaLabel = computed(() => props.startCtaLabel ?? 'Iniciar retoque')
</script>

<template>
  <PageHeader :title="title" :subtitle="fullSubtitle" :back-to="backTo">
    <NButton v-if="!hideStartCta" type="primary" :disabled="startDisabled" @click="$emit('start')">
      {{ ctaLabel }}
    </NButton>
  </PageHeader>
</template>

<style scoped src="./retouch-page-header.css" />
