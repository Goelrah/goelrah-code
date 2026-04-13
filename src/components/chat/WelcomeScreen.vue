<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettings } from '@/composables/useSettings';

const { settings } = useSettings();
const show = ref(false);
const showText = ref(false);
const showSuggestions = ref(false);

const emit = defineEmits<{ send: [text: string] }>();

const suggestions = [
  { icon: '💻', label: 'Code', text: 'Help me write some code' },
  { icon: '📝', label: 'Write', text: 'Help me write something' },
  { icon: '🔍', label: 'Review', text: 'Review this code for bugs' },
  { icon: '🧪', label: 'Test', text: 'Generate unit tests' },
];

onMounted(() => {
  setTimeout(() => (show.value = true), 100);
  setTimeout(() => (showText.value = true), 600);
  setTimeout(() => (showSuggestions.value = true), 1000);
});
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-4">
    <div class="max-w-xl text-center">
      <!-- Animated avatar -->
      <div class="welcome-avatar" :class="{ visible: show }">
        <div class="avatar-ring">
          <svg viewBox="0 0 120 120" class="ring-svg">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-200)" stroke-width="1.5" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="url(#wg)" stroke-width="2" stroke-linecap="round" stroke-dasharray="85 255" class="ring-spin" />
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="120" y2="120">
                <stop stop-color="var(--accent-brand)" />
                <stop offset="1" stop-color="var(--accent-secondary)" />
              </linearGradient>
            </defs>
          </svg>
          <div class="avatar-inner">
            <svg viewBox="0 0 60 60" fill="none" class="bot-icon">
              <rect x="12" y="5" width="36" height="28" rx="10" fill="var(--accent-brand)" />
              <circle cx="24" cy="17" r="3" fill="#fff" />
              <circle cx="36" cy="17" r="3" fill="#fff" />
              <circle cx="24.5" cy="17.5" r="1.5" fill="var(--bg-000)" />
              <circle cx="36.5" cy="17.5" r="1.5" fill="var(--bg-000)" />
              <path d="M26 26 Q30 31 34 26" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none" />
              <rect x="18" y="35" width="24" height="16" rx="6" fill="var(--accent-brand)" opacity="0.7" />
              <circle cx="30" cy="42" r="2.5" fill="#fff" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>
      </div>

      <!-- Welcome text -->
      <div class="welcome-text" :class="{ visible: showText }">
        <h1 class="text-2xl font-bold" :style="{ color: 'var(--text-100)' }">
          Welcome to {{ settings.agentName || 'Velora AI' }}
        </h1>
        <p class="mt-2 text-sm" :style="{ color: 'var(--text-300)' }">
          Your private AI assistant. Ask anything about code.
        </p>
      </div>

      <!-- Suggestion pills -->
      <div class="welcome-suggestions" :class="{ visible: showSuggestions }">
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <button
            v-for="s in suggestions"
            :key="s.label"
            class="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition hover:scale-[1.02] active:scale-[0.98]"
            :style="{ borderColor: 'var(--border-200)', color: 'var(--text-200)', background: 'var(--bg-000)' }"
            @click="emit('send', s.text)"
          >
            <span>{{ s.icon }}</span>
            <span>{{ s.label }}</span>
          </button>
        </div>
      </div>

      <!-- Powered by -->
      <div class="welcome-powered" :class="{ visible: showSuggestions }">
        <p class="mt-8 text-xs" :style="{ color: 'var(--text-400)' }">
          Powered by <a href="https://goelrah.github.io/" target="_blank" :style="{ color: 'var(--accent-brand)' }">Rahul Goel</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-avatar {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.welcome-avatar.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.avatar-ring {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
}
.ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.ring-spin {
  animation: ring-rotate 3s linear infinite;
  transform-origin: center;
}
@keyframes ring-rotate { to { transform: rotate(360deg); } }

.avatar-inner {
  position: absolute;
  inset: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: avatar-float 3s ease-in-out infinite;
}
@keyframes avatar-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.bot-icon { width: 60px; height: 60px; }

.welcome-text {
  opacity: 0;
  transform: translateY(16px);
  transition: all 0.6s ease;
}
.welcome-text.visible {
  opacity: 1;
  transform: translateY(0);
}

.welcome-suggestions {
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.6s ease;
}
.welcome-suggestions.visible {
  opacity: 1;
  transform: translateY(0);
}

.welcome-powered {
  opacity: 0;
  transition: opacity 0.6s ease 0.2s;
}
.welcome-powered.visible {
  opacity: 1;
}
</style>
