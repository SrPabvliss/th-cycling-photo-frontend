<script setup lang="ts">
import { h } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NIcon, NLayout, NLayoutContent, NLayoutSider, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

function renderIcon(icon: string) {
  return () => h(NIcon, null, { default: () => h('span', icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: '/events' }, { default: () => 'Events' }),
    key: '/events',
    icon: renderIcon('📷'),
  },
]

function handleMenuUpdate(key: string) {
  router.push(key)
}
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <NLayoutSider bordered :width="220" content-style="padding: 8px 0;">
      <div style="padding: 16px 24px; font-weight: 700; font-size: 18px">Cycling Photos</div>
      <NMenu :options="menuOptions" :value="route.path" @update:value="handleMenuUpdate" />
    </NLayoutSider>
    <NLayout>
      <NLayoutContent content-style="padding: 24px;">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
