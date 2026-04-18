<script setup lang="ts">
import PublicNavbar from './PublicNavbar.vue'
import PublicFooter from './PublicFooter.vue'
</script>

<template>
  <div class="public-layout">
    <PublicNavbar />
    <main class="public-layout-content">
      <slot />
    </main>
    <PublicFooter />
  </div>
</template>

<style>
/* Override base.css overflow:hidden when a public page is mounted */
html:has(.public-layout),
html:has(.public-layout) body,
html:has(.public-layout) #app {
  overflow: visible;
  height: auto;
}
</style>

<style scoped src="./styles/public-layout.css" />
