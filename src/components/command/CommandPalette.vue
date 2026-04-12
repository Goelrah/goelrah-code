<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useCommandPalette } from '@/composables/useCommandPalette';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const { open, close } = useCommandPalette();
const { createSession, clearAll } = useSessions();
const { settings } = useSettings();
const { toggle: toggleTheme } = useTheme();
const query = ref('');
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const commands = [
  { id: 'new', label: 'New Chat', action: () => { const s = createSession(settings.model); router.push(`/chat/${s.id}`); close(); } },
  { id: 'settings', label: 'Settings', action: () => { router.push('/settings'); close(); } },
  { id: 'prompts', label: 'Prompts', action: () => { router.push('/prompts'); close(); } },
  { id: 'health', label: 'Health', action: () => { router.push('/health'); close(); } },
  { id: 'about', label: 'About', action: () => { router.push('/about'); close(); } },
  { id: 'theme', label: 'Toggle Theme', action: () => { toggleTheme(); close(); } },
  { id: 'clear', label: 'Clear All Sessions', action: () => { clearAll(); close(); } },
];

const filtered = computed(() => {
  if (!query.value) return commands;
  const q = query.value.toLowerCase();
  return commands.filter((c) => c.label.toLowerCase().includes(q));
});

watch(open, (v) => { if (v) { query.value = ''; selectedIndex.value = 0; nextTick(() => inputRef.value?.focus()); } });

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex.value = Math.min(selectedIndex.value + 1, filtered.value.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex.value = Math.max(selectedIndex.value - 1, 0); }
  else if (e.key === 'Enter') { e.preventDefault(); filtered.value[selectedIndex.value]?.action(); }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" @click.self="close">
      <div class="fixed inset-0" :style="{ background: 'rgba(0,0,0,0.33)' }" @click="close" />
      <div class="relative z-10 w-full max-w-lg rounded-xl border shadow-2xl"
        :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
        <div class="flex items-center gap-2 border-b px-4 py-3" :style="{ borderColor: 'var(--border-300)' }">
          <svg class="h-4 w-4" :style="{ color: 'var(--text-400)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input ref="inputRef" v-model="query" placeholder="Search commands..."
            class="flex-1 bg-transparent text-sm focus:outline-none"
            :style="{ color: 'var(--text-100)' }" @keydown="onKey" />
        </div>
        <div class="max-h-72 overflow-y-auto py-1">
          <button v-for="(cmd, i) in filtered" :key="cmd.id"
            class="flex w-full items-center px-4 py-2 text-sm transition"
            :style="{ background: i === selectedIndex ? 'var(--bg-200)' : 'transparent', color: 'var(--text-200)' }"
            @click="cmd.action()" @mouseenter="selectedIndex = i">
            {{ cmd.label }}
          </button>
          <div v-if="filtered.length === 0" class="px-4 py-6 text-center text-sm" :style="{ color: 'var(--text-400)' }">No commands found</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
