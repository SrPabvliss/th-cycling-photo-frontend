<script setup lang="ts">
import { computed } from 'vue'

import { passwordChecks, type IPasswordChecks } from './password-rule'

const props = defineProps<{
  value: string
}>()

const RULES: { key: keyof IPasswordChecks; text: string }[] = [
  { key: 'length', text: '8 caracteres o más' },
  { key: 'letter', text: 'Una letra' },
  { key: 'digit', text: 'Un número' },
]

const checks = computed(() => passwordChecks(props.value))
</script>

<template>
  <!-- Met or pending is said in words for screen readers and drawn with a mark, not only colour. -->
  <ul class="password-rules" aria-label="Requisitos de la contraseña">
    <li
      v-for="rule in RULES"
      :key="rule.key"
      class="password-rules__item"
      :data-met="checks[rule.key] ? 'true' : 'false'"
    >
      <span class="password-rules__mark" aria-hidden="true" />
      {{ rule.text }}
      <span class="password-rules__state">{{ checks[rule.key] ? 'cumplido' : 'pendiente' }}</span>
    </li>
  </ul>
</template>

<style scoped>
.password-rules {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-1) / 2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--tt-ink-muted);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.password-rules__item {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
}

.password-rules__item[data-met='true'] {
  color: var(--tt-success-ink);
}

.password-rules__mark {
  flex: none;
  inline-size: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  block-size: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  border: medium solid currentColor;
  border-radius: var(--tt-radius-pill);
}

.password-rules__item[data-met='true'] .password-rules__mark {
  background: currentColor;
}

.password-rules__state {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
