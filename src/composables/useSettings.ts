import { reactive, watch } from 'vue';
import type { AppSettings } from '@/types/settings';
import { storage } from '@/services/storage';

const defaults: AppSettings = {
  endpointUrl: import.meta.env.VITE_DEFAULT_ENDPOINT ?? 'http://localhost:11434',
  model: import.meta.env.VITE_DEFAULT_MODEL ?? 'kimi-k2.5:cloud',
  systemPrompt: 'You are a private AI coding assistant. Be precise, concise, and technically accurate.',
  temperature: 0.7,
  maxTokens: 4096,
  theme: 'light',
  agentName: 'AI Studio',
};

const settings = reactive<AppSettings>(storage.get('settings', defaults));

watch(settings, (val) => storage.set('settings', val), { deep: true });

export function useSettings() {
  function reset() {
    Object.assign(settings, defaults);
  }

  return { settings, reset };
}
