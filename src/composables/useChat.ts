import { ref } from 'vue';
import type { ChatMessage } from '@/types/chat';
import { OllamaClient } from '@/services/ollama-client';
import { useSettings } from './useSettings';
import { useSessions } from './useSessions';

const streaming = ref(false);
const error = ref<string | null>(null);
let abortFn: (() => void) | null = null;

export function useChat() {
  const { settings } = useSettings();
  const { activeSession, addMessage, updateLastMessage, createSession } = useSessions();

  function send(content: string) {
    if (streaming.value || !content.trim()) return;

    error.value = null;

    // Ensure we have an active session
    let session = activeSession.value;
    if (!session) {
      session = createSession(settings.model);
    }

    const sessionId = session.id;

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    addMessage(sessionId, userMsg);

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: settings.model,
    };
    addMessage(sessionId, assistantMsg);

    // Build messages array for Ollama
    const messages: Array<{ role: string; content: string }> = [];
    if (settings.systemPrompt) {
      messages.push({ role: 'system', content: settings.systemPrompt });
    }
    // Include conversation history
    for (const msg of session.messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    streaming.value = true;
    let accumulated = '';

    const client = new OllamaClient(settings.endpointUrl);
    abortFn = client.streamChat(
      {
        model: settings.model,
        messages,
        stream: true,
        options: {
          temperature: settings.temperature,
          num_predict: settings.maxTokens,
        },
      },
      (token) => {
        accumulated += token;
        updateLastMessage(sessionId, accumulated);
      },
      () => {
        streaming.value = false;
        abortFn = null;
      },
      (err) => {
        error.value = err;
        streaming.value = false;
        abortFn = null;
        // Mark the assistant message as error
        if (!accumulated) {
          updateLastMessage(sessionId, `Error: ${err}`);
        }
      },
    );
  }

  function stop() {
    abortFn?.();
    streaming.value = false;
    abortFn = null;
  }

  return { streaming, error, send, stop };
}
