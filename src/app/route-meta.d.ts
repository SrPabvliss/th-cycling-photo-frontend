import 'vue-router'

import type { UiArea } from '@/core/theme/area'

declare module 'vue-router' {
  interface RouteMeta {
    /** Interface the route belongs to. Child records inherit it; without it a route is client. */
    area?: UiArea
  }
}
