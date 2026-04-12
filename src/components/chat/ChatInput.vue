<script setup lang="ts">
import { ref, computed } from 'vue';
import ModelSelector from './ModelSelector.vue';
import SlashCommands from '@/components/command/SlashCommands.vue';

defineProps<{ streaming: boolean }>();
const emit = defineEmits<{ send: [message: string]; stop: []; slashCommand: [command: string] }>();

const input = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showSlash = computed(() => input.value.startsWith('/') && input.value.length < 20);

function handleSubmit() {
  const t = input.value.trim();
  if (!t) return;
  if (t.startsWith('/')) { emit('slashCommand', t); input.value = ''; return; }
  emit('send', t);
  input.value = '';
  if (textareaRef.value) textareaRef.value.style.height = 'auto';
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
}

function autoResize() {
  const el = textareaRef.value;
  if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 384)}px`; }
}

function selectSlash(cmd: string) { input.value = cmd + ' '; textareaRef.value?.focus(); }
</script>

<template>
  <div class="relative">
    <SlashCommands :query="input" :visible="showSlash" @select="selectSlash" />

    <!-- Claude-style input box -->
    <div
      class="flex flex-col items-stretch rounded-[20px] mx-2 md:mx-0 relative z-[1] border border-transparent transition-shadow duration-200"
      :style="{ background: 'var(--bg-000)' }"
      style="box-shadow: 0 0.25rem 1.25rem hsla(0,0%,0%,3.5%), 0 0 0 0.5px hsla(0,0%,50%,0.15);"
    >
      <div class="flex flex-col m-3.5 gap-3">
        <!-- Textarea -->
        <div class="relative">
          <textarea
            ref="textareaRef"
            v-model="input"
            rows="1"
            :disabled="streaming"
            class="w-full overflow-y-auto break-words resize-none bg-transparent text-base pl-[6px] pt-[6px] min-h-[3rem] max-h-96 focus:outline-none disabled:opacity-50"
            :style="{ color: 'var(--text-100)' }"
            :placeholder="streaming ? '' : 'How can I help you today?'"
            @keydown="handleKeydown"
            @input="autoResize"
          />
        </div>

        <!-- Bottom row -->
        <div class="relative flex gap-2 w-full items-center">
          <div class="relative flex-1 flex items-center shrink min-w-0 gap-1">
            <!-- Plus button -->
            <button
              class="h-8 w-8 rounded-lg flex items-center justify-center transition"
              :style="{ color: 'var(--text-300)' }"
              title="Add files"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3a.5.5 0 0 1 .5.5v6h6a.5.5 0 0 1 0 1h-6v6a.5.5 0 0 1-1 0v-6h-6a.5.5 0 0 1 0-1h6v-6A.5.5 0 0 1 10 3" />
              </svg>
            </button>
          </div>

          <!-- Model selector + send -->
          <div class="flex items-center gap-1">
            <ModelSelector />

            <div class="shrink-0">
              <button
                v-if="streaming"
                class="h-8 w-8 rounded-lg flex items-center justify-center transition"
                :style="{ background: 'var(--error)', color: '#fff' }"
                @click="emit('stop')"
                title="Stop"
              >
                <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              </button>
              <button
                v-else-if="input.trim()"
                class="h-8 w-8 rounded-lg flex items-center justify-center transition"
                :style="{ background: 'var(--accent-brand)', color: '#fff' }"
                @click="handleSubmit"
                title="Send"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
