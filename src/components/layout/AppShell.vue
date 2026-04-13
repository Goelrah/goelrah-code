<script setup lang="ts">
import Sidebar from './Sidebar.vue';
</script>

<template>
  <div class="flex h-screen overflow-hidden" :style="{ background: 'var(--bg-100)' }">
    <Sidebar />
    <div class="flex flex-1 flex-col overflow-hidden" style="padding-left: 3.25rem; padding-top: 38px;">
      <slot />
    </div>
  </div>
</template>
