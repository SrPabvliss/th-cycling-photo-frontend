<script setup lang="ts">
import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import { LAYOUT_SLOTS, useLayoutSlot } from '@/core/layout/slot-registry'
import ClientFooter from './ClientFooter.vue'
import ClientHeader from './ClientHeader.vue'
import ClientLogo from './ClientLogo.vue'
import ClientTabBar from './ClientTabBar.vue'
import OfflineStrip from './OfflineStrip.vue'
import { useClientShell } from './client-shell'
import { hasScreenProblem } from './screen-problem'

// Shell of every client route. Each route says in `meta.shell` which parts it wants; the layout
// knows no route by name.
const shell = useClientShell()
const overlays = useLayoutSlot(LAYOUT_SLOTS.CLIENT_OVERLAY)
const seasonBars = useLayoutSlot(LAYOUT_SLOTS.CLIENT_SEASON_BAR)
</script>

<template>
  <div class="client-layout" :data-tab-bar="shell.tabBar ? 'true' : undefined">
    <!-- No house ad goes with a screen that shows a problem. -->
    <template v-if="shell.seasonBar && !hasScreenProblem">
      <component :is="bar" v-for="(bar, index) in seasonBars" :key="index" />
    </template>
    <ClientHeader v-if="shell.header" />
    <div v-else class="client-layout__brand">
      <ClientLogo />
    </div>
    <OfflineStrip :under-header="shell.header" />

    <main class="client-layout__main">
      <!-- A screen that breaks keeps the shell around it, so the navigation still works. -->
      <ErrorBoundary>
        <RouterView />
      </ErrorBoundary>
    </main>

    <ClientFooter v-if="shell.footer" />
    <ClientTabBar v-if="shell.tabBar" />

    <component :is="overlay" v-for="(overlay, index) in overlays" :key="index" />
  </div>
</template>

<style src="./client-layout.css" />
