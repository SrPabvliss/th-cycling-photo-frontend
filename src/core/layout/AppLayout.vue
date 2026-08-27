<script setup lang="ts">
import AppNav from './AppNav.vue'
</script>

<template>
  <div class="app-layout">
    <AppNav />
    <main class="app-layout-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped src="./styles/app-layout.css" />
