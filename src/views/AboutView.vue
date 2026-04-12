<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue';
</script>

<template>
  <AppShell>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-2xl px-4 py-8">
        <h1 class="text-lg font-semibold" :style="{ color: 'var(--text-100)' }">About Rahul Goel — AI Studio</h1>
        <div class="mt-4 space-y-3 text-sm leading-relaxed" :style="{ color: 'var(--text-200)' }">
          <p>Rahul Goel AI Studio is a private AI coding assistant that connects to your own Ollama-compatible endpoint. It runs entirely in your browser — no server-side code, no hidden secrets.</p>
          <p>All AI inference happens on your private server. This frontend is just the interface.</p>
        </div>
        <div class="mt-8 rounded-xl border p-5" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
          <h2 class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">Keyboard Shortcuts</h2>
          <div class="mt-3 space-y-2 text-sm">
            <div v-for="s in [
              ['⌘K', 'Command palette'], ['⌘N', 'New session'], ['⌘B', 'Toggle sidebar'], ['⌘J', 'Toggle theme'], ['/', 'Focus input'], ['Enter', 'Send message']
            ]" :key="s[0]" class="flex justify-between py-1 border-b" :style="{ borderColor: 'var(--border-300)' }">
              <span :style="{ color: 'var(--text-200)' }">{{ s[1] }}</span>
              <kbd class="rounded px-1.5 py-0.5 text-xs" :style="{ background: 'var(--bg-200)', color: 'var(--text-100)' }">{{ s[0] }}</kbd>
            </div>
          </div>
        </div>
        <p class="mt-8 text-xs" :style="{ color: 'var(--text-500)' }">v0.1.0 · Powered by Rahul Goel — Independent Consultant</p>
      </div>
    </div>
  </AppShell>
</template>
