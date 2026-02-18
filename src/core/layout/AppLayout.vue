<script setup lang="ts">
import { ref } from 'vue'
import { NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'

import { BACKGROUND, NEUTRAL_DARK } from '@/core/theme/titan-tv-theme'
import AppSidebar from './AppSidebar.vue'

const collapsed = ref(false)
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <NLayoutSider
      bordered
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="260"
      :native-scrollbar="false"
      :style="{ backgroundColor: NEUTRAL_DARK }"
    >
      <AppSidebar :collapsed="collapsed" />
    </NLayoutSider>
    <NLayout>
      <NLayoutContent :native-scrollbar="false" :content-style="`background-color: ${BACKGROUND};`">
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
