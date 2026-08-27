<script setup lang="ts">
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import ProfileContent from './ProfileContent.vue'
</script>

<template>
  <PublicLayout>
    <div class="profile-view">
      <ProfileContent />
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/profile-view.css"></style>
