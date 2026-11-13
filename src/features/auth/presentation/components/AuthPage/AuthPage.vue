<script setup lang="ts">
// Frame of every access screen: a narrow reading column, the title and what the screen is for.
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="auth-page">
    <header class="auth-page__head">
      <h1 class="auth-page__title">{{ title }}</h1>
      <p v-if="subtitle" class="auth-page__subtitle">{{ subtitle }}</p>
    </header>
    <slot name="tabs" />
    <slot />
  </div>
</template>

<style scoped>
.auth-page {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-5);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 7);
  margin-inline: auto;
  padding: var(--tt-space-5) var(--tt-space-4) var(--tt-space-7);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.auth-page__head {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
}

.auth-page__title {
  margin: 0;
  font-family: var(--tt-type-display-s-family);
  font-stretch: var(--tt-display-stretch);
  font-size: var(--tt-type-display-s-size);
  line-height: var(--tt-type-display-s-line);
  font-weight: var(--tt-type-display-s-weight);
  text-transform: uppercase;
}

.auth-page__subtitle {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

@media (min-width: 768px) {
  .auth-page {
    padding-block-start: var(--tt-space-7);
  }

  .auth-page__title {
    font-size: var(--tt-type-display-m-size);
    line-height: var(--tt-type-display-m-line);
  }
}
</style>
