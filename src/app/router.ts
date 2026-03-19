import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import { registerAuthGuard } from '@/core/guards/auth.guard'
import { standaloneRoutes } from '@/core/views/standalone-routes'
import { authRoutes } from '@/features/auth/routes'
import { classificationRoutes } from '@/features/classifications/routes'
import { eventRoutes } from '@/features/events/routes'
import { landingRoutes } from '@/features/landing/routes'
import { photoRoutes } from '@/features/photos/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...landingRoutes,
    ...authRoutes,
    ...standaloneRoutes,
    {
      path: '/',
      component: AppLayout,
      children: [...eventRoutes, ...photoRoutes],
    },
    ...classificationRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

registerAuthGuard(router)

export default router
