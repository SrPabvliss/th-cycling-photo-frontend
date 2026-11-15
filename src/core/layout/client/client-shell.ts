import { computed, type ComputedRef } from 'vue'
import { useRoute, type RouteLocationNormalized } from 'vue-router'

/** The three destinations of the client navigation. */
export type ClientTab = 'home' | 'events' | 'photos'

/** What a route asks of the client shell. Anything left out takes its default. */
export interface IClientShellMeta {
  /** Destination the route belongs to; it is the one marked as current in the navigation. */
  tab?: ClientTab
  /** Bottom tab bar on mobile. Off on screens with their own bottom bar and on detail screens. */
  tabBar?: boolean
  /** Full header. Without it the shell shows only the logo. */
  header?: boolean
  footer?: boolean
  /** House season bar above the header (or above the logo strip). */
  seasonBar?: boolean
}

export interface IClientShell {
  tab: ClientTab | null
  tabBar: boolean
  header: boolean
  footer: boolean
  seasonBar: boolean
}

const DEFAULT_SHELL: IClientShell = {
  tab: null,
  tabBar: false,
  header: true,
  footer: true,
  seasonBar: false,
}

/**
 * Shell of a route: the `meta.shell` of the deepest matched record that declares one, completed
 * with the defaults. A child that declares its own replaces the one of its parent.
 */
export function resolveClientShell(route: Pick<RouteLocationNormalized, 'matched'>): IClientShell {
  const declared: IClientShellMeta | undefined = [...route.matched]
    .reverse()
    .find((record) => record.meta.shell)?.meta.shell

  return { ...DEFAULT_SHELL, ...declared }
}

export function useClientShell(): ComputedRef<IClientShell> {
  const route = useRoute()
  return computed(() => resolveClientShell(route))
}
