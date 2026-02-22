import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import { eventRoutes, EVENTS_PATH } from '@/features/events/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: EVENTS_PATH,
        },
        ...eventRoutes,
      ],
    },
  ],
})

export default router
