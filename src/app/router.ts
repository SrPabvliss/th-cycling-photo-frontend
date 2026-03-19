import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import { registerAuthGuard } from '@/core/guards/auth.guard'
import { authRoutes } from '@/features/auth/routes'
import { classificationRoutes } from '@/features/classifications/routes'
import { eventRoutes, EVENTS_PATH } from '@/features/events/routes'
import { photoRoutes } from '@/features/photos/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
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

registerAuthGuard(router)

export default router
