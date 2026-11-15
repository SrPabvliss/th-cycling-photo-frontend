import type { RouteRecordRaw } from 'vue-router'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'

// Two static pages in the client shell, plain header and footer, open to everyone.
export const commercialRoutes: RouteRecordRaw[] = [
  {
    path: ROUTE_PATHS.BRANDS_PAGE,
    name: ROUTE_NAMES.BRANDS_PAGE,
    component: () => import('./presentation/views/BrandsPageView.vue'),
    meta: { public: true },
  },
  {
    path: ROUTE_PATHS.ORGANIZERS_PAGE,
    name: ROUTE_NAMES.ORGANIZERS_PAGE,
    component: () => import('./presentation/views/OrganizersPageView.vue'),
    meta: { public: true },
  },
]
