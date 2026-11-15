import 'vue-router'

import type { IClientShellMeta } from '@/core/layout/client/client-shell'
import type { UiArea } from '@/core/theme/area'

declare module 'vue-router' {
  interface RouteMeta {
    /** Interface the route belongs to. Child records inherit it; without it a route is client. */
    area?: UiArea
    /** Parts of the client shell the route wants. Without it: header and footer, no tab bar. */
    shell?: IClientShellMeta
  }
}
