import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption, MenuGroupOption } from 'naive-ui'
import { PieChart, Calendar, Images } from '@vicons/ionicons5'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'

function renderIcon(icon: Parameters<typeof h>[0]) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

export const sidebarMenuOptions: (MenuOption | MenuGroupOption)[] = [
  {
    type: 'group',
    label: 'Principal',
    key: 'principal',
    children: [
      {
        label: 'Dashboard',
        key: '/dashboard',
        icon: renderIcon(PieChart),
      },
      {
        label: () => h(RouterLink, { to: ROUTE_PATHS.EVENTS }, { default: () => 'Eventos' }),
        key: ROUTE_PATHS.EVENTS,
        icon: renderIcon(Calendar),
      },
      {
        label: 'Fotos',
        key: '/photos',
        icon: renderIcon(Images),
      },
    ],
  },
]
