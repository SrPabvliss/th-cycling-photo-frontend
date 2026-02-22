<script setup lang="ts">
import { ref } from 'vue'
import { NLayout, NLayoutSider } from 'naive-ui'

import { NEUTRAL_DARK } from '@/core/theme/titan-tv-theme'
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
    <div class="main-content">
      <RouterView />
    </div>
  </NLayout>
</template>

<style scoped>
.main-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background-color: var(--tt-background);
}
</style>
