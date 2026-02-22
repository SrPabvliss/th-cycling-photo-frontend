<script setup lang="ts">
import { NCard, NFlex, NGrid, NGridItem, NSkeleton } from 'naive-ui'
</script>

<template>
  <NCard>
    <template #header>
      <div>
        <NSkeleton text style="width: 200px; height: 18px" />
        <NSkeleton text style="width: 340px; margin-top: 8px" />
      </div>
    </template>

    <div style="padding: 32px">
      <NGrid :cols="2" :x-gap="32">
        <NGridItem>
          <NFlex vertical :size="24">
            <div>
              <NSkeleton text style="width: 130px; margin-bottom: 10px" />
              <NSkeleton height="34px" :sharp="false" />
              <NSkeleton text style="width: 220px; margin-top: 6px" />
            </div>
            <div>
              <NSkeleton text style="width: 80px; margin-bottom: 10px" />
              <NSkeleton height="34px" :sharp="false" />
            </div>
          </NFlex>
        </NGridItem>
        <NGridItem>
          <NSkeleton text style="width: 50px; margin-bottom: 10px" />
          <NSkeleton height="34px" :sharp="false" />
        </NGridItem>
      </NGrid>
    </div>

    <NFlex justify="end" :size="12" class="skeleton-footer">
      <NSkeleton width="80px" height="34px" :sharp="false" />
      <NSkeleton width="140px" height="34px" :sharp="false" />
    </NFlex>
  </NCard>
</template>

<style scoped>
.skeleton-footer {
  padding: 16px 32px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
</style>
