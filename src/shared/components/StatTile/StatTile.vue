<script setup lang="ts">
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'

export type StatTileTone = 'navy' | 'blue' | 'green' | 'amber' | 'violet' | 'red'

defineProps<{
  label: string
  value: string
  icon: Component
  tone: StatTileTone
  note?: string
  detail?: string
}>()
</script>

<template>
  <div class="stat-tile">
    <div class="stat-tile__head">
      <span class="stat-tile__label">
        {{ label }}
        <slot name="label-extra" />
      </span>
      <span class="stat-tile__ic" :class="`stat-tile__ic--${tone}`">
        <NIcon :component="icon" :size="17" />
      </span>
    </div>
    <div class="stat-tile__val" :class="`stat-tile__val--${tone}`">
      {{ value }}
      <em v-if="detail">{{ detail }}</em>
    </div>
    <div v-if="note" class="stat-tile__note">{{ note }}</div>
  </div>
</template>

<style scoped src="./stat-tile.css" />
