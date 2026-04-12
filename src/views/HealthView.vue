<script setup lang="ts">
import { onMounted } from 'vue';
import AppShell from '@/components/layout/AppShell.vue';
import { useSettings } from '@/composables/useSettings';
import { useEndpointHealth } from '@/composables/useEndpointHealth';
const { settings } = useSettings();
const { health, checking, check } = useEndpointHealth();
onMounted(check);
</script>

<template>
  <AppShell>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-2xl px-4 py-8">
        <h1 class="text-lg font-semibold" :style="{ color: 'var(--text-100)' }">Endpoint Health</h1>
        <div class="mt-6 rounded-xl border p-5" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
          <div class="text-sm" :style="{ color: 'var(--text-300)' }">Endpoint</div>
          <div class="mt-1 text-sm font-medium" :style="{ color: 'var(--text-100)' }">{{ settings.endpointUrl }}</div>
          <button class="mt-4 rounded-lg border px-4 py-1.5 text-sm transition"
            :style="{ borderColor: 'var(--border-300)', color: 'var(--text-200)' }" :disabled="checking" @click="check">
            {{ checking ? 'Checking...' : 'Refresh' }}
          </button>
          <div v-if="health" class="mt-5">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ background: health.reachable ? 'var(--success)' : 'var(--error)' }" />
              <span class="text-sm font-medium" :style="{ color: health.reachable ? 'var(--success)' : 'var(--error)' }">
                {{ health.reachable ? 'Connected' : 'Unreachable' }}
              </span>
            </div>
            <div v-if="health.reachable" class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between border-b py-2" :style="{ borderColor: 'var(--border-300)' }">
                <span :style="{ color: 'var(--text-300)' }">Latency</span>
                <span :style="{ color: 'var(--text-100)' }">{{ health.latencyMs }}ms</span>
              </div>
              <div v-for="m in health.models" :key="m.name" class="flex justify-between py-1.5 pl-4">
                <span :style="{ color: 'var(--text-200)' }">{{ m.name }}</span>
                <span :style="{ color: 'var(--text-400)' }">{{ (m.size / 1e9).toFixed(1) }}GB</span>
              </div>
            </div>
            <div v-if="health.error" class="mt-3 text-sm" :style="{ color: 'var(--error)' }">{{ health.error }}</div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
