<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui'

import type { IBreadcrumbItem } from './types/breadcrumb.interface'

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs?: IBreadcrumbItem[]
}>()
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <template v-if="breadcrumbs?.length">
        <NBreadcrumb>
          <NBreadcrumbItem v-for="(crumb, index) in breadcrumbs" :key="index">
            <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
            <span v-else>{{ crumb.label }}</span>
          </NBreadcrumbItem>
        </NBreadcrumb>
      </template>

      <template v-else>
        <h1 class="topbar-title">{{ title }}</h1>
        <template v-if="subtitle">
          <span class="topbar-separator">|</span>
          <span class="topbar-subtitle">{{ subtitle }}</span>
        </template>
      </template>

      <slot name="badge" />
    </div>

    <div class="topbar-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped src="./styles/app-top-bar.css" />
