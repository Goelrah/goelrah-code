<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import CommandPalette from '@/components/command/CommandPalette.vue';

const router = useRouter();
const { toggle: toggleTheme } = useTheme();
const { createSession } = useSessions();
const { settings } = useSettings();

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    // Cmd+N: New session
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      const s = createSession(settings.model);
      router.push(`/chat/${s.id}`);
    }
    // Cmd+J: Toggle theme
    if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
      e.preventDefault();
      toggleTheme();
    }
    // / key: Focus chat input (when not in an input)
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }
  });
});
</script>

<template>
  <CommandPalette />
  <router-view />
</template>
