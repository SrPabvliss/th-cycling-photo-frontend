<script setup lang="ts">
import { NFlex, NGrid, NGridItem, NSkeleton } from 'naive-ui'

import PhotoCardSkeleton from '../PhotoCardSkeleton/PhotoCardSkeleton.vue'
</script>

<template>
  <div>
    <!-- Header skeleton -->
    <NFlex justify="space-between" align="start" style="margin-bottom: 24px">
      <div>
        <NFlex align="center" :size="12" style="margin-bottom: 4px">
          <NSkeleton :sharp="false" height="29px" width="260px" />
          <NSkeleton :sharp="false" height="22px" width="70px" />
        </NFlex>
        <NSkeleton :sharp="false" height="18px" width="200px" />
      </div>
      <NSkeleton :sharp="false" width="130px" height="34px" />
    </NFlex>

    <!-- Filter bar skeleton -->
    <div class="skeleton-filter-bar">
      <NFlex :size="8">
        <NSkeleton v-for="i in 4" :key="i" :sharp="false" height="36px" width="90px" />
      </NFlex>
    </div>

    <!-- Grid skeleton -->
    <NGrid :cols="4" :x-gap="16" :y-gap="16">
      <NGridItem v-for="i in 8" :key="i">
        <PhotoCardSkeleton />
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.skeleton-filter-bar {
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--tt-neutral-light);
  margin-bottom: 24px;
}
</style>
