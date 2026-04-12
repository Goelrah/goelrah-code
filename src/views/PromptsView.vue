<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/components/layout/AppShell.vue';
import { prompts } from '@/data/prompts';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import { useChat } from '@/composables/useChat';

const router = useRouter();
const { createSession, setActive } = useSessions();
const { settings } = useSettings();
const { send } = useChat();
const categories = [...new Set(prompts.map((p) => p.category))];
const expandedId = ref<string | null>(null);

function toggle(id: string) { expandedId.value = expandedId.value === id ? null : id; }
function use(content: string) {
  const s = createSession(settings.model); setActive(s.id);
  router.push(`/chat/${s.id}`); setTimeout(() => send(content), 100);
}
</script>

<template>
  <AppShell>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-2xl px-4 py-8">
        <h1 class="text-lg font-semibold" :style="{ color: 'var(--text-100)' }">Prompt Library</h1>
        <p class="mt-1 text-sm" :style="{ color: 'var(--text-300)' }">Browse and use prompt templates</p>
        <div v-for="cat in categories" :key="cat" class="mt-6">
          <h2 class="text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--text-400)' }">{{ cat }}</h2>
          <div class="mt-2 space-y-2">
            <div v-for="p in prompts.filter((x) => x.category === cat)" :key="p.id"
              class="rounded-xl border overflow-hidden" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
              <button class="flex w-full items-center justify-between px-4 py-3 text-left transition" @click="toggle(p.id)">
                <div>
                  <div class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">{{ p.name }}</div>
                  <div class="text-xs" :style="{ color: 'var(--text-300)' }">{{ p.description }}</div>
                </div>
                <svg class="h-4 w-4 transition-transform" :class="expandedId === p.id ? 'rotate-180' : ''"
                  :style="{ color: 'var(--text-400)' }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div v-if="expandedId === p.id" class="border-t px-4 py-3" :style="{ borderColor: 'var(--border-300)', background: 'var(--bg-100)' }">
                <pre class="whitespace-pre-wrap text-sm font-mono" :style="{ color: 'var(--text-200)' }">{{ p.content }}</pre>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-xs" :style="{ color: 'var(--text-400)' }">Inputs: {{ p.inputs.join(', ') }}</span>
                  <button class="rounded-lg px-3 py-1 text-xs font-medium text-white transition"
                    :style="{ background: 'var(--accent-brand)' }" @click="use(p.content)">Use in Chat →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
