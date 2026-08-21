<script setup lang="ts">
import { NCard, NFlex, NGrid, NGridItem, NSkeleton } from 'naive-ui'
</script>

<template>
  <div>
    <!-- Header: matches EventDetailHeader -->
    <NFlex justify="space-between" align="start" style="margin-bottom: 32px">
      <div style="flex: 1">
        <NFlex align="center" :size="12" style="margin-bottom: 4px">
          <!-- Title: 24px font × 1.2 line-height ≈ 29px -->
          <NSkeleton :sharp="false" height="29px" width="260px" />
          <!-- Status tag -->
          <NSkeleton :sharp="false" height="22px" width="70px" />
        </NFlex>
        <!-- Subtitle: 13px font × 1.4 line-height ≈ 18px -->
        <NSkeleton :sharp="false" height="18px" width="240px" />
      </div>
      <NFlex :size="10">
        <NSkeleton width="140px" height="34px" :sharp="false" />
        <NSkeleton width="120px" height="34px" :sharp="false" />
      </NFlex>
    </NFlex>

    <!-- Dashboard grid: matches .dashboard-grid -->
    <div class="skeleton-grid">
      <NFlex vertical :size="24">
        <!-- Stat cards: matches EventStatCards -->
        <NGrid cols="2 600:3 900:5" :x-gap="16" :y-gap="16" responsive="screen">
          <NGridItem v-for="i in 5" :key="i">
            <NCard>
              <NFlex justify="space-between" align="start" style="margin-bottom: 16px">
                <!-- Icon: 36×36 matches .stat-card__icon -->
                <NSkeleton width="36px" height="36px" :sharp="false" />
                <!-- Tag: 11px uppercase text -->
                <NSkeleton :sharp="false" height="15px" width="55px" />
              </NFlex>
              <!-- Value: 24px font × 1.2 line-height ≈ 29px -->
              <NSkeleton :sharp="false" height="29px" width="40px" />
              <!-- Description: 12px font, margin-top 4px -->
              <NSkeleton :sharp="false" height="16px" width="100%" style="margin-top: 4px" />
            </NCard>
          </NGridItem>
        </NGrid>

        <!-- Photos card: matches NCard title="Fotos Recientes" size="small" -->
        <NCard size="small">
          <NSkeleton :sharp="false" height="18px" width="130px" style="margin-bottom: 16px" />
          <NSkeleton :sharp="false" height="80px" />
        </NCard>
      </NFlex>

      <!-- Info sidebar: matches EventInfoCard -->
      <NCard :segmented="{ content: true }">
        <template #header>
          <div>
            <!-- Title: 15px font -->
            <NSkeleton :sharp="false" height="20px" width="160px" style="margin-bottom: 4px" />
            <!-- Subtitle: 12px font -->
            <NSkeleton :sharp="false" height="16px" width="200px" />
          </div>
        </template>
        <NFlex vertical :size="20">
          <NFlex v-for="i in 2" :key="i" align="start" :size="12">
            <!-- Icon: 32px circle, margin-top 2px matches .info-item__icon -->
            <NSkeleton circle width="32px" height="32px" style="margin-top: 2px" />
            <div style="flex: 1">
              <!-- Label: 11px uppercase -->
              <NSkeleton :sharp="false" height="15px" width="50px" style="margin-bottom: 2px" />
              <!-- Value: 14px font -->
              <NSkeleton :sharp="false" height="19px" width="140px" />
            </div>
          </NFlex>
        </NFlex>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}
</style>
