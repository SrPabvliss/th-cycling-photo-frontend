<script setup lang="ts">
import ErrorBoundary from '@/core/layout/ErrorBoundary.vue'
import { retryRouteLoad, routeLoadProblem } from '@/core/navigation/route-load-problem'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { loadProblemCopy } from '@/shared/components/loading/problem-copy'
import { LAYOUT_SLOTS, useLayoutSlot } from '@/core/layout/slot-registry'
import ClientFooter from './ClientFooter.vue'
import ClientHeader from './ClientHeader.vue'
import ClientLogo from './ClientLogo.vue'
import ClientTabBar from './ClientTabBar.vue'
import OfflineStrip from './OfflineStrip.vue'
import SessionClosedScreen from './SessionClosedScreen.vue'
import { useClientShell } from './client-shell'
import { hasScreenProblem } from './screen-problem'
import { useSessionClosedScreen } from './session-closed'

// Shell of every client route. Each route says in `meta.shell` which parts it wants; the layout
// knows no route by name.
const shell = useClientShell()
const overlays = useLayoutSlot(LAYOUT_SLOTS.CLIENT_OVERLAY)
const seasonBars = useLayoutSlot(LAYOUT_SLOTS.CLIENT_SEASON_BAR)
const isSessionClosed = useSessionClosedScreen()
// The next page's code could not be fetched with network: said above the screen still up.
const routeProblemCopy = loadProblemCopy('server', 'esta página')
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
      <FormAlert
        v-if="routeLoadProblem"
        class="client-layout__route-problem"
        tone="warn"
        :title="routeProblemCopy.title"
        :text="routeProblemCopy.text"
        :on-retry="retryRouteLoad"
      />
      <!-- A screen that breaks keeps the shell around it, so the navigation still works. -->
      <SessionClosedScreen v-if="isSessionClosed" />
      <ErrorBoundary v-else>
        <RouterView />
      </ErrorBoundary>
    </main>

    <ClientFooter v-if="shell.footer" />
    <ClientTabBar v-if="shell.tabBar" />

    <component :is="overlay" v-for="(overlay, index) in overlays" :key="index" />
  </div>
</template>

<style src="./client-layout.css" />
