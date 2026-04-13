<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ChatMessage } from '@/types/chat';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ThinkingAnimation from './ThinkingAnimation.vue';

const props = defineProps<{ message: ChatMessage }>();
const isUser = computed(() => props.message.role === 'user');
const copied = ref(false);

const rendered = computed(() => {
  if (isUser.value || !props.message.content) return '';
  return DOMPurify.sanitize(marked.parse(props.message.content, { async: false }) as string);
});

function copy() {
  navigator.clipboard.writeText(props.message.content);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="group py-5">
    <div class="flex gap-3">
      <div
        class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold select-none"
        :style="{
          background: isUser ? 'var(--text-200)' : 'hsla(18,65%,58%,0.12)',
          color: isUser ? 'var(--bg-100)' : 'var(--accent-brand)',
        }"
      >{{ isUser ? 'RG' : 'R' }}</div>
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex items-center gap-2">
          <span class="text-sm font-semibold" :style="{ color: 'var(--text-100)' }">
            {{ isUser ? 'You' : 'AI Studio' }}
          </span>
          <button
            v-if="message.content"
            class="ml-auto hidden text-xs transition group-hover:inline-flex"
            :style="{ color: copied ? 'var(--success)' : 'var(--text-400)' }"
            @click="copy"
          >{{ copied ? '✓ Copied' : 'Copy' }}</button>
        </div>

        <!-- Thinking animation -->
        <ThinkingAnimation v-if="message.isThinking" :thinking="message.thinking" />

        <!-- Content -->
        <template v-if="isUser">
          <div class="whitespace-pre-wrap text-[15px] leading-relaxed" :style="{ color: 'var(--text-100)' }">{{ message.content }}</div>
        </template>
        <template v-else-if="message.content">
          <!-- Show collapsed thinking if we have both -->
          <details v-if="message.thinking && !message.isThinking" class="thinking-details">
            <summary>💭 View thinking process</summary>
            <div class="thinking-collapsed">{{ message.thinking }}</div>
          </details>
          <div class="prose-g text-[15px] leading-relaxed" v-html="rendered" />
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.thinking-details { margin-bottom: 10px; }
.thinking-details summary {
  font-size: 12px;
  color: var(--text-400);
  cursor: pointer;
  user-select: none;
}
.thinking-details summary:hover { color: var(--text-300); }
.thinking-collapsed {
  margin-top: 6px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-400);
  background: var(--bg-200);
  border-radius: 8px;
  font-style: italic;
  max-height: 120px;
  overflow-y: auto;
}

.prose-g { color: var(--text-100); }
.prose-g code { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; padding: 0.125rem 0.375rem; border-radius: 0.25rem; background: var(--bg-200); }
.prose-g pre { margin: 0.75rem 0; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; background: var(--bg-200); border: 1px solid var(--border-300); }
.prose-g pre code { background: transparent; padding: 0; }
.prose-g p { margin-bottom: 0.75rem; }
.prose-g p:last-child { margin-bottom: 0; }
.prose-g ul, .prose-g ol { margin: 0.5rem 0 0.75rem 1.25rem; }
.prose-g li { margin-bottom: 0.25rem; }
.prose-g h1, .prose-g h2, .prose-g h3 { font-weight: 600; margin: 1.25rem 0 0.5rem; }
.prose-g a { color: var(--accent-brand); text-decoration: underline; }
.prose-g blockquote { margin: 0.75rem 0; padding-left: 1rem; border-left: 3px solid var(--accent-brand); color: var(--text-300); }
</style>
