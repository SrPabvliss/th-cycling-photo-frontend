import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import { registerAuthGuard } from '@/core/guards/auth.guard'
import { standaloneRoutes } from '@/core/views/standalone-routes'
import { authRoutes } from '@/features/auth/routes'
import { eventRoutes } from '@/features/events/routes'
import { landingRoutes } from '@/features/landing/routes'
import { legalRoutes } from '@/features/legal/routes'
import { photoRoutes } from '@/features/photos/routes'
import { clientGalleryRoutes } from '@/features/client-gallery/routes'
import { deliveryRoutes } from '@/features/delivery/routes'
import { orderRoutes } from '@/features/orders/routes'
import { previewLinkRoutes } from '@/features/preview-links/routes'
import { publicGalleryRoutes } from '@/features/public-gallery/routes'
import { retouchRoutes, retouchWorkspaceRoutes } from '@/features/retouch/routes'
import { reviewRoutes } from '@/features/review/routes'
import { buyerRoutes } from '@/features/buyers/routes'
import { cartRoutes } from '@/features/cart/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...landingRoutes,
    ...legalRoutes,
    ...authRoutes,
    ...publicGalleryRoutes,
    ...cartRoutes,
    ...clientGalleryRoutes,
    ...deliveryRoutes,
    ...standaloneRoutes,
    ...reviewRoutes,
    ...retouchWorkspaceRoutes,
    {
      path: '/',
      component: AppLayout,
      children: [
        ...eventRoutes,
        ...photoRoutes,
        ...previewLinkRoutes,
        ...orderRoutes,
        ...retouchRoutes,
        ...buyerRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

registerAuthGuard(router)

export default router
