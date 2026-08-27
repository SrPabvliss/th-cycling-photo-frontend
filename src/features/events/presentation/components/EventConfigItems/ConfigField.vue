<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    label: string
    hint?: string | null
    pending?: string | null
    error?: string | null
    ok?: string | null
    half?: boolean
  }>(),
  { hint: null, pending: null, error: null, ok: null, half: false },
)
</script>

<template>
  <div class="tt-field" :class="{ half }">
    <span class="tt-field-l">{{ label }}</span>
    <slot />
    <span v-if="pending" class="ce-fhint pend" data-test="field-pending">
      <i class="ce-spin" />{{ pending }}
    </span>
    <span v-else-if="error" class="ce-fhint err" data-test="field-error">
      <NIcon :component="AlertCircleOutline" :size="13" />{{ error }}
    </span>
    <span v-else-if="ok" class="ce-fhint ok" data-test="field-ok">
      <NIcon :component="CheckmarkCircleOutline" :size="13" />{{ ok }}
    </span>
    <span v-else-if="hint" class="tt-field-h">{{ hint }}</span>
  </div>
</template>

<style scoped src="./config-field.css" />
