import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption, MenuGroupOption } from 'naive-ui'
import { PieChart, Calendar, Images, Bicycle, Pricetags, People, Settings } from '@vicons/ionicons5'

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
        label: () => h(RouterLink, { to: '/events' }, { default: () => 'Eventos' }),
        key: '/events',
        icon: renderIcon(Calendar),
      },
      {
        label: 'Fotos',
        key: '/photos',
        icon: renderIcon(Images),
      },
    ],
  },
  {
    type: 'group',
    label: 'Gestión AI',
    key: 'gestion-ai',
    children: [
      {
        label: 'Ciclistas',
        key: '/cyclists',
        icon: renderIcon(Bicycle),
      },
      {
        label: 'Clasificación',
        key: '/classification',
        icon: renderIcon(Pricetags),
      },
    ],
  },
  {
    type: 'group',
    label: 'Sistema',
    key: 'sistema',
    children: [
      {
        label: 'Usuarios',
        key: '/users',
        icon: renderIcon(People),
      },
      {
        label: 'Configuración',
        key: '/settings',
        icon: renderIcon(Settings),
      },
    ],
  },
]
