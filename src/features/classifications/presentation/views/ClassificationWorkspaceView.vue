<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ClassificationModeWorkspace from '../components/ClassificationModeWorkspace/ClassificationModeWorkspace.vue'
import RetouchModeWorkspace from '../components/RetouchModeWorkspace/RetouchModeWorkspace.vue'

const route = useRoute()
const isRetouchMode = computed(() => route.query.mode === 'retouch')
const eventId = computed(() => route.params.eventId as string)
</script>

<template>
  <div class="workspace">
    <RetouchModeWorkspace v-if="isRetouchMode" :event-id="eventId" />
    <ClassificationModeWorkspace v-else />
  </div>
</template>

<style scoped src="./classification-workspace-view.css" />
