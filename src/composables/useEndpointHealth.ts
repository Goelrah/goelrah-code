import { ref } from 'vue';
import type { EndpointHealth } from '@/types/settings';
import { OllamaClient } from '@/services/ollama-client';
import { useSettings } from './useSettings';

const health = ref<EndpointHealth | null>(null);
const checking = ref(false);

export function useEndpointHealth() {
  const { settings } = useSettings();

  async function check() {
    checking.value = true;
    const client = new OllamaClient(settings.endpointUrl);
    health.value = await client.checkHealth();
    checking.value = false;
  }

  return { health, checking, check };
}
