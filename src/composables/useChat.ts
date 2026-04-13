import { ref } from 'vue';
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

    let session = activeSession.value;
    if (!session) session = createSession(settings.model);
    const sessionId = session.id;

    // Build Ollama messages BEFORE adding to UI
    const ollamaMessages: Array<{ role: string; content: string }> = [];
    if (settings.systemPrompt) ollamaMessages.push({ role: 'system', content: settings.systemPrompt });
    for (const msg of session.messages) {
      if ((msg.role === 'user' || msg.role === 'assistant') && msg.content.trim()) {
        ollamaMessages.push({ role: msg.role, content: msg.content });
      }
    }
    ollamaMessages.push({ role: 'user', content: content.trim() });

    // Add to UI
    addMessage(sessionId, { id: crypto.randomUUID(), role: 'user', content: content.trim(), timestamp: Date.now() });
    addMessage(sessionId, { id: crypto.randomUUID(), role: 'assistant', content: '', timestamp: Date.now(), model: settings.model, isThinking: true, thinking: '' });

    streaming.value = true;
    let thinkingText = '';
    let responseText = '';
    let gotContent = false;

    const client = new OllamaClient(settings.endpointUrl);
    abortFn = client.streamChat(
      { model: settings.model, messages: ollamaMessages, stream: true, options: { temperature: settings.temperature, num_predict: settings.maxTokens } },
      // onToken
      (token) => {
        if (!gotContent) gotContent = true;
        responseText += token;
        updateLastMessage(sessionId, responseText, thinkingText, false);
      },
      // onDone
      () => {
        if (!gotContent && thinkingText) updateLastMessage(sessionId, thinkingText, '', false);
        streaming.value = false;
        abortFn = null;
      },
      // onError
      (err) => {
        error.value = err;
        streaming.value = false;
        abortFn = null;
        if (!responseText && !thinkingText) updateLastMessage(sessionId, `Error: ${err}`, '', false);
      },
      // onThinking
      (token) => {
        thinkingText += token;
        updateLastMessage(sessionId, '', thinkingText, true);
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
