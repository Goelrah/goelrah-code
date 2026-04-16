<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useChat } from '@/composables/useChat';
import { useSessions } from '@/composables/useSessions';
import { useSettings } from '@/composables/useSettings';
import MessageBubble from './MessageBubble.vue';
import ChatInput from './ChatInput.vue';
import StreamingIndicator from './StreamingIndicator.vue';
import WelcomeScreen from './WelcomeScreen.vue';

const router = useRouter();
const { streaming, error, send, stop } = useChat();
const { activeSession, createSession, setActive } = useSessions();
const { settings } = useSettings();
const messagesEnd = ref<HTMLElement | null>(null);

function scrollToBottom() {
  nextTick(() => messagesEnd.value?.scrollIntoView({ behavior: 'smooth' }));
}
watch(() => activeSession.value?.messages.length, () => scrollToBottom());

const suggestions = [
  { icon: 'M234.53,139.07a8,8,0,0,0,3.13-13.24L122.17,10.34a8,8,0,0,0-11.31,0L70.25,51,45.65,26.34A8,8,0,0,0,34.34,37.66l24.6,24.6L15,106.17a24,24,0,0,0,0,33.94L99.89,225a24,24,0,0,0,33.94,0l78.49-78.49Z', label: 'Create' },
  { icon: 'M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63Z', label: 'Write' },
  { icon: 'M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216Z', label: 'Learn' },
  { icon: 'M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29Z', label: 'Code' },
];

function handleSlashCommand(cmd: string) {
  const parts = cmd.split(' ');
  switch (parts[0]) {
    case '/clear': if (activeSession.value) activeSession.value.messages = []; break;
    case '/model': { const m = parts.slice(1).join(' ').trim(); if (m) settings.model = m; else router.push('/settings'); break; }
    case '/export': exportConversation(); break;
    case '/help': router.push('/about'); break;
    case '/new': { const s = createSession(settings.model); setActive(s.id); router.push(`/chat/${s.id}`); break; }
    default: send(cmd);
  }
}

function exportConversation() {
  if (!activeSession.value) return;
  const lines = activeSession.value.messages.map((m) => `**${m.role === 'user' ? 'You' : settings.agentName}**\n\n${m.content}\n`);
  const blob = new Blob([`# ${activeSession.value.title}\n\n${lines.join('\n---\n\n')}`], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ai-studio-${activeSession.value.id.slice(0, 8)}.md`;
  a.click();
}
</script>

<template>
  <main class="mx-auto mt-4 w-full flex-1 px-4 md:px-8 lg:mt-6 max-w-2xl h-full flex flex-col items-center relative">
    <!-- Messages -->
    <template v-if="activeSession && activeSession.messages.length > 0">
      <div class="w-full flex-1 overflow-y-auto pb-4">
        <MessageBubble v-for="msg in activeSession.messages" :key="msg.id" :message="msg" />
        <StreamingIndicator v-if="streaming" />
        <div ref="messagesEnd" class="h-4" />
      </div>
    </template>

    <!-- Empty state — animated welcome -->
    <template v-else>
      <WelcomeScreen @send="send" />
    </template>

    <!-- Error -->
    <div v-if="error" class="w-full pb-2">
      <div class="rounded-lg px-4 py-2 text-center text-sm" :style="{ background: 'hsla(0,60%,50%,0.08)', color: 'var(--error)' }">
        {{ error }}
      </div>
    </div>

    <!-- Input area — always at bottom -->
    <div class="w-full sticky bottom-0 z-10 pb-2">
      <ChatInput :streaming="streaming" @send="send" @stop="stop" @slash-command="handleSlashCommand" />
      <!-- Ad placeholder below input -->
      <div id="velora-ad-chat" class="mx-auto max-w-3xl mt-1 min-h-[50px] flex items-center justify-center rounded-lg" :style="{ background: 'var(--bg-200)' }">
        <!-- Replace with AdSense script -->
      </div>
    </div>
  </main>
</template>
