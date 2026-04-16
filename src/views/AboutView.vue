<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue';
</script>

<template>
  <AppShell>
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-2xl px-4 py-8">
        <h1 class="text-lg font-semibold" :style="{ color: 'var(--text-100)' }">About Velora AI</h1>
        <div class="mt-4 space-y-3 text-sm leading-relaxed" :style="{ color: 'var(--text-200)' }">
          <p>Velora AI is an enterprise-grade private AI coding assistant that runs entirely on your machine — no cloud, no data collection, no limits.</p>
        </div>

        <!-- Ad placeholder -->
        <div class="mt-6 rounded-xl border p-4 text-center" :style="{ background: 'var(--bg-200)', borderColor: 'var(--border-300)' }">
          <div id="velora-ad-about" class="min-h-[90px] flex items-center justify-center">
            <span class="text-xs" :style="{ color: 'var(--text-400)' }"><!-- Ad slot: replace with Google AdSense script --></span>
          </div>
        </div>

        <!-- Support / Donate -->
        <div class="mt-6 rounded-xl border p-5" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
          <h2 class="text-sm font-medium" :style="{ color: 'var(--text-100)' }">❤️ Support Velora AI</h2>
          <p class="mt-2 text-xs" :style="{ color: 'var(--text-300)' }">Velora AI is free and open source. If you find it useful, consider supporting the project.</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <a href="https://github.com/sponsors/Goelrah" target="_blank"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
              :style="{ borderColor: 'var(--border-200)', color: 'var(--text-200)', background: 'var(--bg-000)' }">
              💖 GitHub Sponsors
            </a>
            <a href="https://buymeacoffee.com/goelrah" target="_blank"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
              :style="{ borderColor: 'var(--border-200)', color: 'var(--text-200)', background: 'var(--bg-000)' }">
              ☕ Buy Me a Coffee
            </a>
            <a href="https://ko-fi.com/goelrah" target="_blank"
              class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
              :style="{ borderColor: 'var(--border-200)', color: 'var(--text-200)', background: 'var(--bg-000)' }">
              🎁 Ko-fi
            </a>
          </div>
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="mt-6 rounded-xl border p-5" :style="{ background: 'var(--bg-000)', borderColor: 'var(--border-300)' }">
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

        <p class="mt-8 text-xs" :style="{ color: 'var(--text-500)' }">
          Velora AI Studio · Est. April 2026 · Powered by <a href="https://goelrah.github.io/" target="_blank" :style="{ color: 'var(--accent-brand)' }">Rahul Goel</a>
        </p>
      </div>
    </div>
  </AppShell>
</template>
