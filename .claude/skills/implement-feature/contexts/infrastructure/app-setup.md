# App Setup & Providers

## Main Entry (main.ts)

```typescript
// app/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClientConfig } from './providers'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClientConfig })

app.mount('#app')
```

## TanStack Query Configuration

```typescript
// app/providers/index.ts
export const queryClientConfig: VueQueryPluginOptions['queryClientConfig'] = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
}
```

## Naive UI Setup

```vue
<!-- App.vue -->
<NConfigProvider>
  <NMessageProvider>
    <NDialogProvider>
      <RouterView />
    </NDialogProvider>
  </NMessageProvider>
</NConfigProvider>
```

## Layout Architecture

### AppLayout.vue

Uses `NLayout has-sider` for the sidebar, but the content area is a **plain div** (NOT `NLayoutContent`):

```vue
<template>
  <NLayout has-sider style="height: 100vh">
    <NLayoutSider ...>
      <AppSidebar />
    </NLayoutSider>
    <div class="main-content">
      <RouterView />
    </div>
  </NLayout>
</template>

<style scoped>
.main-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-color: var(--tt-background);
}
</style>
```

**Why not NLayoutContent?** It creates an internal scroll container (`.n-layout-scroll-container`) that scrolls ALL content including the AppTopBar. Using a plain div with `overflow: hidden` lets each view control its own scroll behavior.

### Page View Pattern (base.css)

Every view uses this structure so AppTopBar stays fixed while content scrolls:

```css
/* assets/styles/base.css */
.page-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-view__content {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable; /* reserves scrollbar space to prevent horizontal shift */
}
```

```vue
<!-- Every view follows this structure -->
<template>
  <div class="page-view">
    <AppTopBar title="..." />
    <!-- fixed: flex-shrink: 0 -->
    <div class="page-view__content">
      <!-- scrollable -->
      <!-- view content here -->
    </div>
  </div>
</template>
```

### Error Centering Pattern

Content areas that might show errors should be `display: flex; flex-direction: column` so `.error-container` can center:

```css
.list-content {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
}

.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Vue Router

```typescript
// app/router.ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes, // login (no layout)
    {
      path: '/',
      component: AppLayout,
      children: [...eventRoutes, ...photoRoutes],
    },
  ],
})
```

Routes are distributed per feature (`features/{name}/routes.ts`) and composed here.
Each feature defines `{FEATURE}_PATH` and `{FEATURE}_ROUTE_NAMES` constants.

## Pinia

Pinia = client/UI state ONLY. Server data lives in TanStack Query.
Only expected Pinia store: `features/auth/store/auth.store.ts`.
Uses Composition API style: `defineStore('auth', () => { ... })`.
