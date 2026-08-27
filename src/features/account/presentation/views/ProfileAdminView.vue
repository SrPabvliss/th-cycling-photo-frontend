<script setup lang="ts">
import ProfileContent from './ProfileContent.vue'
</script>

<template>
  <div class="page-view">
    <div class="page-view__content profile-admin-view__content">
      <ProfileContent />
    </div>
  </div>
</template>

<style scoped>
.profile-admin-view__content {
  padding: 24px 32px;
}

@media (max-width: 767px) {
  .profile-admin-view__content {
    padding: 16px;
  }
}

@media (max-width: 479px) {
  .profile-admin-view__content {
    padding: 12px;
  }
}
</style>
