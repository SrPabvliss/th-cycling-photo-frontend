<script setup lang="ts">
import PublicLayout from '@/core/layout/public/PublicLayout.vue'

defineProps<{
  code: string
  title: string
  description: string
  errorInfo: string
}>()
</script>

<template>
  <PublicLayout>
    <div class="error-page">
      <div class="error-page-header">
        <div class="error-page-hero">
          <span class="error-page-code">{{ code }}</span>
          <div class="error-page-icon">
            <slot name="icon" />
          </div>
        </div>

        <slot name="accent" />

        <h1 class="error-page-title">{{ title }}</h1>
        <p class="error-page-description">{{ description }}</p>

        <div class="error-page-actions">
          <slot name="actions" />
        </div>

        <slot name="extra" />

        <p class="error-page-info">
          <code>{{ errorInfo }}</code>
        </p>
      </div>

      <div class="error-page-mountain" />
    </div>
  </PublicLayout>
</template>

<style scoped src="../styles/error-page-layout.css" />
