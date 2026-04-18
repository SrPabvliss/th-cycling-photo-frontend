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

<!-- Unscoped: these .workspace__* classes are consumed by child component
     fragments (RetouchModeWorkspace, ClassificationModeWorkspace) which
     Vue 3 scoped CSS cannot reach. The BEM prefix avoids collisions. -->
<style src="./classification-workspace-view.css" />
