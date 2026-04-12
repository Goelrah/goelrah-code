import { ref, computed } from 'vue';
import type { Session } from '@/types/session';
import type { ChatMessage } from '@/types/chat';
import { storage } from '@/services/storage';

const sessions = ref<Session[]>(storage.get('sessions', []));
const activeSessionId = ref<string | null>(null);

function persist() {
  storage.set('sessions', sessions.value);
}

export function useSessions() {
  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
  );

  const sortedSessions = computed(() =>
    [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt),
  );

  function createSession(model: string): Session {
    const session: Session = {
      id: crypto.randomUUID(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model,
    };
    sessions.value.push(session);
    activeSessionId.value = session.id;
    persist();
    return session;
  }

  function setActive(id: string) {
    activeSessionId.value = id;
  }

  function addMessage(sessionId: string, message: ChatMessage) {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (!session) return;
    session.messages.push(message);
    session.updatedAt = Date.now();
    // Auto-title from first user message
    if (session.title === 'New chat' && message.role === 'user') {
      session.title = message.content.slice(0, 60) + (message.content.length > 60 ? '...' : '');
    }
    persist();
  }

  function updateLastMessage(sessionId: string, content: string) {
    const session = sessions.value.find((s) => s.id === sessionId);
    if (!session || session.messages.length === 0) return;
    const last = session.messages[session.messages.length - 1];
    if (last) {
      last.content = content;
    }
    persist();
  }

  function renameSession(id: string, title: string) {
    const session = sessions.value.find((s) => s.id === id);
    if (session) {
      session.title = title;
      persist();
    }
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id ?? null;
    }
    persist();
  }

  function clearAll() {
    sessions.value = [];
    activeSessionId.value = null;
    persist();
  }

  return {
    sessions: sortedSessions,
    activeSession,
    activeSessionId,
    createSession,
    setActive,
    addMessage,
    updateLastMessage,
    renameSession,
    deleteSession,
    clearAll,
  };
}
