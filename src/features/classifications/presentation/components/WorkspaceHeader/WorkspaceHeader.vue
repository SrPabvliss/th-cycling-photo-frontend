<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { RouterLink } from 'vue-router'

import type { IBreadcrumbItem } from '@/core/layout/types/breadcrumb.interface'
import WorkspaceProgressBar from '../WorkspaceProgressBar/WorkspaceProgressBar.vue'

defineProps<{
  breadcrumbs: IBreadcrumbItem[]
  progress: { current: number; total: number }
  eventId: string
  classifiedCount: number
  totalPhotos: number
}>()

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <header class="workspace-header">
    <div class="workspace-header__back">
      <NButton quaternary circle size="small" @click="goBack">
        <template #icon><NIcon :component="ArrowBackOutline" /></template>
      </NButton>
    </div>
    <div class="workspace-header__breadcrumbs">
      <NBreadcrumb>
        <NBreadcrumbItem v-for="(crumb, index) in breadcrumbs" :key="index">
          <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
          <span v-else>{{ crumb.label }}</span>
        </NBreadcrumbItem>
      </NBreadcrumb>
    </div>
    <div class="workspace-header__classified">
      <span class="workspace-header__classified-text">
        {{ classifiedCount }} / {{ totalPhotos }} clasificadas
      </span>
    </div>
    <div class="workspace-header__progress">
      <WorkspaceProgressBar :current="progress.current" :total="progress.total" />
    </div>
  </header>
</template>

<style scoped src="./workspace-header.css" />
