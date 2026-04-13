<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import type { Session } from '@/types/session';

const router = useRouter();
const route = useRoute();
const { sessions, activeSessionId, createSession, setActive, deleteSession } = useSessions();
const { settings } = useSettings();

const pinned = ref(false);

function togglePin() { pinned.value = !pinned.value; }

function newChat() {
  const s = createSession(settings.model);
  router.push(`/chat/${s.id}`);
}

function openSession(id: string) {
  setActive(id);
  router.push(`/chat/${id}`);
}

interface SG { label: string; items: Session[] }
const grouped = computed<SG[]>(() => {
  const now = Date.now(), day = 86400000;
  const t: Session[] = [], y: Session[] = [], o: Session[] = [];
  for (const s of sessions.value) {
    const age = now - s.updatedAt;
    if (age < day) t.push(s); else if (age < day * 2) y.push(s); else o.push(s);
  }
  const g: SG[] = [];
  if (t.length) g.push({ label: 'Today', items: t });
  if (y.length) g.push({ label: 'Yesterday', items: y });
  if (o.length) g.push({ label: 'Older', items: o });
  return g;
});

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path.startsWith('/chat');
  return route.path.startsWith(path);
}
</script>

<template>
  <!-- Collapsed bar (always visible) -->
  <nav
    v-if="!pinned"
    class="fixed left-0 top-0 z-40 flex h-screen w-[3.25rem] flex-col items-center border-r"
    :style="{ background: 'var(--bg-100)', borderColor: 'var(--border-300)', paddingTop: '38px' }"
  >
    <!-- Toggle open button -->
    <button
      class="flex h-8 w-8 items-center justify-center rounded-md transition group mb-2"
      title="Open sidebar"
      @click="togglePin"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" :style="{ color: 'var(--text-400)' }" class="group-hover:!text-[var(--text-100)] transition">
        <path d="M16.5 4A1.5 1.5 0 0 1 18 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9A1.5 1.5 0 0 1 3.5 4zM7 15h9.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7zM3.5 5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H6V5z" />
      </svg>
    </button>

    <!-- New chat -->
    <button class="flex h-9 w-9 items-center justify-center rounded-lg transition mb-1" :style="{ color: 'var(--text-300)' }" title="New chat" @click="newChat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
    </button>

    <!-- Nav icons -->
    <router-link to="/" class="flex h-9 w-9 items-center justify-center rounded-lg transition mb-0.5"
      :style="{ color: isActive('/') ? 'var(--text-100)' : 'var(--text-400)', background: isActive('/') ? 'var(--bg-300)' : 'transparent' }" title="Chats">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    </router-link>
    <router-link to="/prompts" class="flex h-9 w-9 items-center justify-center rounded-lg transition mb-0.5"
      :style="{ color: isActive('/prompts') ? 'var(--text-100)' : 'var(--text-400)', background: isActive('/prompts') ? 'var(--bg-300)' : 'transparent' }" title="Prompts">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
    </router-link>
    <router-link to="/settings" class="flex h-9 w-9 items-center justify-center rounded-lg transition mb-0.5"
      :style="{ color: isActive('/settings') ? 'var(--text-100)' : 'var(--text-400)', background: isActive('/settings') ? 'var(--bg-300)' : 'transparent' }" title="Settings">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    </router-link>
    <router-link to="/health" class="flex h-9 w-9 items-center justify-center rounded-lg transition"
      :style="{ color: isActive('/health') ? 'var(--text-100)' : 'var(--text-400)', background: isActive('/health') ? 'var(--bg-300)' : 'transparent' }" title="Health">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    </router-link>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- User avatar -->
    <div class="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold select-none"
      :style="{ background: 'var(--text-300)', color: 'var(--bg-100)' }">RG</div>
  </nav>

  <!-- Expanded sidebar (pinned open) -->
  <div v-if="pinned" class="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r"
    :style="{ background: 'linear-gradient(to top, hsla(48,14%,89%,0.3), var(--bg-100))', borderColor: 'var(--border-300)', paddingTop: '38px' }">

    <!-- Header -->
    <div class="flex items-center justify-between p-2 pt-2">
      <router-link to="/" class="flex items-center gap-2 pl-2 h-8">
        <span class="text-sm font-semibold" :style="{ color: 'var(--text-100)' }">{{ settings.agentName || 'Velora AI' }}</span>
      </router-link>
      <button class="flex h-8 w-8 items-center justify-center rounded-md transition group" title="Close sidebar" @click="togglePin">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" :style="{ color: 'var(--text-400)' }" class="group-hover:!text-[var(--text-100)] transition">
          <path d="M16.5 3a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5M8.128 5.165a.5.5 0 0 1 .707.707L4.804 9.5H12.5a.5.5 0 0 1 0 1H4.804l4.031 3.628a.5.5 0 0 1-.67.744l-4.5-4.5a.5.5 0 0 1 0-.744l4.5-4.5z" />
        </svg>
      </button>
    </div>

    <!-- Nav -->
    <div class="flex flex-col gap-px px-2 pt-1">
      <button class="flex h-8 items-center gap-3 rounded-lg px-4 py-1.5 transition active:scale-[0.98] w-full"
        :style="{ color: 'var(--text-200)' }" @click="newChat">
        <div class="flex h-[1.4rem] w-[1.4rem] items-center justify-center rounded-full" :style="{ background: 'hsla(30,5%,40%,0.15)' }">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" :style="{ color: 'var(--text-300)' }">
            <path d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3" />
          </svg>
        </div>
        <span class="text-sm">New chat</span>
      </button>

      <router-link to="/prompts" class="flex h-8 items-center gap-3 rounded-lg px-4 py-1.5 transition w-full"
        :style="{ color: isActive('/prompts') ? 'var(--text-100)' : 'var(--text-300)', background: isActive('/prompts') ? 'var(--bg-300)' : 'transparent' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <span class="text-sm">Prompts</span>
      </router-link>

      <router-link to="/settings" class="flex h-8 items-center gap-3 rounded-lg px-4 py-1.5 transition w-full"
        :style="{ color: isActive('/settings') ? 'var(--text-100)' : 'var(--text-300)', background: isActive('/settings') ? 'var(--bg-300)' : 'transparent' }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span class="text-sm">Settings</span>
      </router-link>
    </div>

    <!-- Recents -->
    <div class="flex-1 overflow-y-auto px-2 mt-2 border-t" :style="{ borderColor: 'var(--border-300)' }">
      <div class="flex flex-col px-2 pt-4 gap-px">
        <router-link to="/" class="flex h-8 items-center gap-3 rounded-lg px-2 py-1.5 transition w-full"
          :style="{ color: isActive('/') ? 'var(--text-100)' : 'var(--text-300)', background: isActive('/') ? 'var(--bg-300)' : 'transparent' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-sm">Chats</span>
        </router-link>
      </div>

      <template v-for="group in grouped" :key="group.label">
        <h2 class="pb-1 mt-3 text-xs select-none pl-4 font-medium" :style="{ color: 'var(--text-500)' }">{{ group.label }}</h2>
        <button
          v-for="s in group.items" :key="s.id"
          class="group flex w-full h-8 items-center rounded-lg px-4 py-1.5 text-sm transition active:scale-[0.98]"
          :style="{ background: activeSessionId === s.id ? 'var(--bg-300)' : 'transparent', color: activeSessionId === s.id ? 'var(--text-100)' : 'var(--text-300)' }"
          @click="openSession(s.id)"
        >
          <span class="truncate flex-1 text-left">{{ s.title }}</span>
          <span class="hidden text-xs group-hover:inline" :style="{ color: 'var(--text-400)' }" @click.stop="deleteSession(s.id)">×</span>
        </button>
      </template>
      <div v-if="sessions.length === 0" class="px-4 py-6 text-center text-xs" :style="{ color: 'var(--text-500)' }">No conversations yet</div>
    </div>

    <!-- User -->
    <div class="flex items-center gap-2 border-t px-3 py-3" :style="{ borderColor: 'var(--border-300)' }">
      <div class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold select-none flex-shrink-0"
        :style="{ background: 'var(--text-300)', color: 'var(--bg-100)' }">RG</div>
      <div class="flex flex-col min-w-0">
        <span class="truncate text-sm font-medium" :style="{ color: 'var(--text-100)' }">Rahul Goel</span>
        <span class="truncate text-xs" :style="{ color: 'var(--text-500)' }"><a href="https://goelrah.github.io/" target="_blank" :style="{ color: 'var(--text-400)' }">goelrah.github.io</a></span>
      </div>
    </div>
  </div>
</template>
