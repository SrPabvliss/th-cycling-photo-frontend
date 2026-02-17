import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/core/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/events',
        },
        {
          path: 'events',
          name: 'events',
          component: () => import('@/features/events/presentation/views/EventListView.vue'),
        },
      ],
    },
  ],
})

export default router
