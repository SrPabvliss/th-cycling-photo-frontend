# App Setup & Providers

## Main Entry (main.ts)

```typescript
// app/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClientConfig } from './providers';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClientConfig });

app.mount('#app');
```

## TanStack Query Configuration

```typescript
// app/providers/index.ts
import type { VueQueryPluginOptions } from '@tanstack/vue-query';

export const queryClientConfig: VueQueryPluginOptions['queryClientConfig'] = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      gcTime: 1000 * 60 * 30,         // 30 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};
```

## Naive UI Setup

Wrap App.vue with NConfigProvider for theming:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui';
</script>

<template>
  <NConfigProvider>
    <NMessageProvider>
      <NDialogProvider>
        <RouterView />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
```

## Vue Router

```typescript
// app/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import { authRoutes } from '@/features/auth/routes';
import { eventRoutes } from '@/features/events/routes';
import { photoRoutes } from '@/features/photos/routes';
import AppLayout from '@/core/layout/AppLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,  // login (no layout)
    {
      path: '/',
      component: AppLayout,
      children: [
        ...eventRoutes,
        ...photoRoutes,
      ],
    },
  ],
});

export default router;
```

Routes are distributed per feature (`features/{name}/routes.ts`) and composed here.
Each feature defines a DRY path constant for its routes.

## Pinia

Pinia = client/UI state ONLY. Server data lives in TanStack Query.

Only expected Pinia store: `features/auth/store/auth.store.ts` (JWT, user, isAuthenticated).
Uses Composition API style (`defineStore('auth', () => { ... })`).
