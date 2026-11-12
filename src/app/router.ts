import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'
import ClientLayout from '@/core/layout/client/ClientLayout.vue'
import { registerAuthGuard } from '@/core/guards/auth.guard'
import { registerRouteProgress } from '@/core/navigation/route-progress'
import { registerStaleChunkReload } from '@/core/navigation/stale-chunk-reload'
import { inPanelArea, registerUiArea } from '@/core/theme/area'
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
import { accountRoutes } from '@/features/account/routes'
import { buyerRoutes } from '@/features/buyers/routes'
import { cartRoutes } from '@/features/cart/routes'
import { contractRoutes } from '@/features/contracts/routes'
import { organizerRoutes } from '@/features/organizers/routes'
import { paymentRoutes } from '@/features/payments/routes'
import { tenantProfileRoutes } from '@/features/tenant-profile/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    if (to.path === from.path) return false
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: ClientLayout,
      children: [
        ...landingRoutes,
        ...legalRoutes,
        ...authRoutes,
        ...publicGalleryRoutes,
        ...accountRoutes,
        ...cartRoutes,
        ...paymentRoutes,
        ...clientGalleryRoutes,
        ...deliveryRoutes,
        ...standaloneRoutes,
      ],
    },
    ...inPanelArea(reviewRoutes),
    ...inPanelArea(retouchWorkspaceRoutes),
    {
      path: '/',
      component: AppLayout,
      meta: { area: 'panel' },
      children: [
        ...eventRoutes,
        ...photoRoutes,
        ...previewLinkRoutes,
        ...orderRoutes,
        ...retouchRoutes,
        ...buyerRoutes,
        ...organizerRoutes,
        ...contractRoutes,
        ...tenantProfileRoutes,
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

// Before the auth guard: it sets the area of the first page while the guard waits for the session.
registerUiArea(router)
// Also before it, so the bar answers the tap at once.
registerRouteProgress(router)
registerAuthGuard(router)
registerStaleChunkReload(router)

export default router
