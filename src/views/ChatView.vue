<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from '@/components/layout/AppShell.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import { useSessions } from '@/composables/useSessions';

const route = useRoute();
const { setActive } = useSessions();

// Sync route param to active session
watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string') {
      setActive(id);
    }
  },
  { immediate: true },
);
</script>

<template>
  <AppShell>
    <ChatWindow />
  </AppShell>
</template>
