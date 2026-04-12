<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ query: string; visible: boolean }>();
const emit = defineEmits<{ select: [command: string] }>();
const commands = [
  { name: '/clear', desc: 'Clear conversation' },
  { name: '/model', desc: 'Change model' },
  { name: '/export', desc: 'Export conversation' },
  { name: '/help', desc: 'Show help' },
  { name: '/new', desc: 'New chat session' },
];
const filtered = computed(() => {
  if (!props.query.startsWith('/')) return [];
  return commands.filter((c) => c.name.startsWith(props.query.toLowerCase()));
});
</script>

<template>
  <div v-if="visible && filtered.length > 0"
    class="absolute bottom-full left-0 right-0 mb-2 rounded-xl border py-1 shadow-lg z-50"
    :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
    <button
      v-for="cmd in filtered" :key="cmd.name"
      class="flex w-full items-center gap-3 px-4 py-2 text-sm transition"
      :style="{ color: 'var(--text-200)' }"
      @mousedown.prevent="emit('select', cmd.name)"
    >
      <span class="font-medium" :style="{ color: 'var(--accent-brand)' }">{{ cmd.name }}</span>
      <span :style="{ color: 'var(--text-400)' }">{{ cmd.desc }}</span>
    </button>
  </div>
</template>
