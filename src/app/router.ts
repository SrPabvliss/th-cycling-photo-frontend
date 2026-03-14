import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import { classificationRoutes } from '@/features/classifications/routes'
import { eventRoutes, EVENTS_PATH } from '@/features/events/routes'
import { photoRoutes } from '@/features/photos/routes'

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
        ...photoRoutes,
      ],
    },
    ...classificationRoutes,
  ],
})

export default router
