<script setup lang="ts">
import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import ClientFooter from './ClientFooter.vue'
import ClientHeader from './ClientHeader.vue'
import ClientTabBar from './ClientTabBar.vue'
import { useClientShell } from './client-shell'

// Shell of every client route. Each route says in `meta.shell` which parts it wants; the layout
// knows no route by name.
const shell = useClientShell()
</script>

<template>
  <div class="client-layout" :data-tab-bar="shell.tabBar ? 'true' : undefined">
    <ClientHeader v-if="shell.header" />
    <div v-else class="client-layout__brand">
      <TitanLogo />
    </div>

    <main class="client-layout__main">
      <!-- A screen that breaks keeps the shell around it, so the navigation still works. -->
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>

    <ClientFooter v-if="shell.footer" />
    <ClientTabBar v-if="shell.tabBar" />
  </div>
</template>

<style src="./client-layout.css" />
