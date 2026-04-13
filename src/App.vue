<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import CommandPalette from '@/components/command/CommandPalette.vue';

const router = useRouter();
const { toggle: toggleTheme } = useTheme();
const { createSession } = useSessions();
const { settings } = useSettings();

// Dynamic title from agent name
watch(() => settings.agentName, (name) => {
  document.title = name ? `${name} · Powered by Rahul Goel` : 'Velora AI Studio';
}, { immediate: true });

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      const s = createSession(settings.model);
      router.push(`/chat/${s.id}`);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
      e.preventDefault();
      toggleTheme();
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      document.querySelector('textarea')?.focus();
    }
  });
});
</script>

<template>
  <CommandPalette />
  <router-view />
</template>
