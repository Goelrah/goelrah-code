import type { ChatRequest, StreamChunk, ModelInfo } from './types';

export class ApiClient {
  constructor(private endpoint: string) {}

  setEndpoint(url: string) {
    this.endpoint = url.replace(/\/+$/, '');
  }

  async *streamChat(request: ChatRequest, signal?: AbortSignal): AsyncGenerator<string> {
    const res = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Endpoint returned ${res.status}: ${await res.text().catch(() => '')}`);
    }
    if (!res.body) throw new Error('No response body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk: StreamChunk = JSON.parse(line);
          if (chunk.message?.content) yield chunk.message.content;
        } catch { /* skip */ }
      }
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const res = await fetch(`${this.endpoint}/api/tags`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.models ?? [];
  }

  async checkHealth(): Promise<{ ok: boolean; models: number; latency: number; error?: string }> {
    const start = Date.now();
    try {
      const models = await this.listModels();
      return { ok: true, models: models.length, latency: Date.now() - start };
    } catch (err) {
      return { ok: false, models: 0, latency: Date.now() - start, error: (err as Error).message };
    }
  }
}
