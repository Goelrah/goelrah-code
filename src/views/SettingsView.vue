<script setup lang="ts">
import { ref } from 'vue';
import AppShell from '@/components/layout/AppShell.vue';
import { useSettings } from '@/composables/useSettings';
import { useEndpointHealth } from '@/composables/useEndpointHealth';
import { useSaveNotify } from '@/composables/useSaveNotify';
import { OllamaClient } from '@/services/ollama-client';
import type { ModelInfo } from '@/types/settings';

const { settings, reset } = useSettings();
const { health, checking, check } = useEndpointHealth();
const { saved } = useSaveNotify();
const models = ref<ModelInfo[]>([]);
const loadingModels = ref(false);

async function fetchModels() {
  loadingModels.value = true;
  try { models.value = await new OllamaClient(settings.endpointUrl).listModels(); } catch { models.value = []; }
  finally { loadingModels.value = false; }
}
</script>

<template>
  <AppShell>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-2xl px-4 py-8">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold" :style="{ color: 'var(--text-100)' }">Settings</h1>
          <transition name="save-fade">
            <span v-if="saved" class="flex items-center gap-1 text-xs font-medium" :style="{ color: 'var(--success)' }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              Saved
            </span>
          </transition>
        </div>
        <div class="mt-6 space-y-6">
          <!-- Agent Name -->
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Agent Name</label>
            <p class="text-xs mt-1" :style="{ color: 'var(--text-400)' }">Give your AI assistant a custom name</p>
            <input v-model="settings.agentName" type="text" placeholder="Velora AI"
              class="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)', color: 'var(--text-100)' }" />
          </div>

          <!-- Endpoint -->
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Endpoint URL</label>
            <input v-model="settings.endpointUrl" type="url"
              class="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)', color: 'var(--text-100)' }" />
            <div class="mt-3 flex gap-2">
              <button class="rounded-lg border px-3 py-1.5 text-sm transition"
                :style="{ borderColor: 'var(--border-300)', color: 'var(--text-200)' }"
                :disabled="checking" @click="check">{{ checking ? 'Testing...' : 'Test Connection' }}</button>
              <button class="rounded-lg border px-3 py-1.5 text-sm transition"
                :style="{ borderColor: 'var(--border-300)', color: 'var(--text-200)' }"
                :disabled="loadingModels" @click="fetchModels">{{ loadingModels ? 'Loading...' : 'Fetch Models' }}</button>
            </div>
            <div v-if="health" class="mt-3 text-sm">
              <span v-if="health.reachable" :style="{ color: 'var(--success)' }">✓ Connected — {{ health.models.length }} model(s) — {{ health.latencyMs }}ms</span>
              <span v-else :style="{ color: 'var(--error)' }">✗ {{ health.error }}</span>
            </div>
          </div>
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Model</label>
            <input v-model="settings.model" type="text"
              class="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)', color: 'var(--text-100)' }" />
            <div v-if="models.length > 0" class="mt-3 space-y-1">
              <button v-for="m in models" :key="m.name"
                class="block w-full rounded-lg px-3 py-1.5 text-left text-sm transition"
                :style="{ color: settings.model === m.name ? 'var(--accent-brand)' : 'var(--text-200)', background: settings.model === m.name ? 'hsla(18,65%,58%,0.08)' : 'transparent' }"
                @click="settings.model = m.name">
                {{ m.name }} <span :style="{ color: 'var(--text-500)' }">({{ (m.size / 1e9).toFixed(1) }}GB)</span>
              </button>
            </div>
          </div>
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">System Prompt</label>
            <textarea v-model="settings.systemPrompt" rows="3"
              class="mt-2 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none"
              :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)', color: 'var(--text-100)' }" />
          </div>
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Temperature: {{ settings.temperature }}</label>
            <input v-model.number="settings.temperature" type="range" min="0" max="2" step="0.1" class="mt-2 w-full" />
            <label class="mt-4 block text-sm font-medium" :style="{ color: 'var(--text-100)' }">Max Tokens: {{ settings.maxTokens }}</label>
            <input v-model.number="settings.maxTokens" type="range" min="256" max="16384" step="256" class="mt-2 w-full" />
          </div>
          <div class="rounded-xl border p-4" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Theme</label>
            <select v-model="settings.theme"
              class="mt-2 rounded-lg border px-3 py-2 text-sm focus:outline-none"
              :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)', color: 'var(--text-100)' }">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <button class="rounded-lg border px-4 py-2 text-sm transition"
            :style="{ borderColor: 'hsla(0,60%,50%,0.3)', color: 'var(--error)' }" @click="reset">Reset to Defaults</button>
        </div>
        <p class="mt-8 text-xs" :style="{ color: 'var(--text-500)' }">Powered by <a href="https://goelrah.github.io/" target="_blank" :style="{ color: 'var(--accent-brand)' }">Rahul Goel</a></p>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.save-fade-enter-active { transition: all 0.3s ease; }
.save-fade-leave-active { transition: all 0.3s ease; }
.save-fade-enter-from, .save-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
