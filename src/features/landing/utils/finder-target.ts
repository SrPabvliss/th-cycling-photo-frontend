import type { RouteLocationRaw } from 'vue-router'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { PLATE_QUERY } from '@/shared/utils/plate.utils'

/** Where the home finder sends: the gallery of the race, with the plate when there is one. */
export function finderTarget(slug: string, plate: string | null): RouteLocationRaw {
  const path = `${ROUTE_PATHS.PUBLIC_GALLERY}/${encodeURIComponent(slug)}`

  return plate ? { path, query: { [PLATE_QUERY]: plate } } : { path }
}
