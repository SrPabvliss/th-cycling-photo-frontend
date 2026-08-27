<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

defineProps<{
  badge: string
  title: string
  tag: string
  statusLabel: string
  statusTone: 'ok' | 'warn'
}>()
</script>

<template>
  <div class="profile-pane-header">
    <span class="profile-pane-header__badge">{{ badge }}</span>
    <h2 class="profile-pane-header__title">{{ title }}</h2>
    <p class="profile-pane-header__tag">{{ tag }}</p>
    <span class="profile-pane-header__status" :class="`is-${statusTone}`">
      <NIcon
        :size="12"
        :component="statusTone === 'ok' ? CheckmarkCircleOutline : AlertCircleOutline"
      />
      {{ statusLabel }}
    </span>
  </div>
</template>

<style scoped src="./profile-pane-header.css"></style>
