<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettings } from '@/composables/useSettings';
import { OllamaClient } from '@/services/ollama-client';
import type { ModelInfo } from '@/types/settings';

const { settings } = useSettings();
const open = ref(false);
const models = ref<ModelInfo[]>([]);
const loaded = ref(false);

async function fetchModels() {
  if (loaded.value) return;
  try {
    const client = new OllamaClient(settings.endpointUrl);
    models.value = await client.listModels();
    loaded.value = true;
  } catch { /* silent */ }
}

function select(name: string) { settings.model = name; open.value = false; }
function toggle() { open.value = !open.value; if (open.value) fetchModels(); }

if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (open.value && !(e.target as HTMLElement).closest('.model-sel')) open.value = false;
  });
}
onMounted(fetchModels);
</script>

<template>
  <div class="model-sel relative">
    <button
      class="h-8 rounded-md px-2.5 flex items-center gap-1 text-xs transition"
      :style="{ color: 'var(--text-300)' }"
      @click.stop="toggle"
    >
      <span class="whitespace-nowrap select-none">{{ settings.model.replace(':latest', '') }}</span>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" class="opacity-75">
        <path d="M14.128 7.165a.502.502 0 0 1 .744.67l-4.5 5a.5.5 0 0 1-.744 0l-4.5-5a.501.501 0 0 1 .744-.67L10 11.752z" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute bottom-full right-0 mb-2 min-w-[220px] rounded-xl border py-1 shadow-lg z-50"
      :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }"
    >
      <div class="px-3 py-2 text-xs font-medium" :style="{ color: 'var(--text-500)' }">Select model</div>
      <button
        v-for="m in models"
        :key="m.name"
        class="flex w-full items-center justify-between px-3 py-2 text-sm transition rounded-md mx-0"
        :style="{
          color: settings.model === m.name ? 'var(--accent-brand)' : 'var(--text-100)',
          background: settings.model === m.name ? 'hsla(18,65%,58%,0.08)' : 'transparent',
        }"
        @click="select(m.name)"
      >
        <span>{{ m.name.replace(':latest', '') }}</span>
        <span class="text-xs" :style="{ color: 'var(--text-500)' }">{{ (m.size / 1e9).toFixed(1) }}B</span>
      </button>
      <div v-if="models.length === 0" class="px-3 py-3 text-center text-xs" :style="{ color: 'var(--text-500)' }">
        {{ loaded ? 'No models found' : 'Loading...' }}
      </div>
    </div>
  </div>
</template>
