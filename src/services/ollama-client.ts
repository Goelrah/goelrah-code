import type { ChatRequest, OllamaStreamChunk } from '@/types/chat';
import type { ModelInfo, EndpointHealth } from '@/types/settings';

const DEFAULT_TIMEOUT = 120_000; // 2 minutes
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

export class OllamaClient {
  constructor(private endpoint: string) {}

  setEndpoint(url: string) {
    this.endpoint = url.replace(/\/+$/, '');
  }

  /**
   * Stream a chat response. Returns an abort function.
   */
  streamChat(
    request: ChatRequest,
    onToken: (token: string) => void,
    onDone: (meta?: { totalDuration?: number; evalCount?: number }) => void,
    onError: (error: string) => void,
  ): () => void {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await this.fetchWithTimeout(
          `${this.endpoint}/api/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...request, stream: true }),
            signal: controller.signal,
          },
          DEFAULT_TIMEOUT,
        );

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          onError(this.mapHttpError(res.status, text, request.model));
          return;
        }

        if (!res.body) {
          onError('No response body from server.');
          return;
        }

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
              const chunk: OllamaStreamChunk = JSON.parse(line);
              if (chunk.message?.content) {
                onToken(chunk.message.content);
              }
              if (chunk.done) {
                onDone({
                  totalDuration: chunk.total_duration,
                  evalCount: chunk.eval_count,
                });
              }
            } catch {
              // skip malformed NDJSON lines
            }
          }
        }

        // If we exit the loop without onDone being called (edge case)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          onDone(); // user cancelled
          return;
        }
        onError(this.mapFetchError(err));
      }
    })();

    return () => controller.abort();
  }

  /**
   * Non-streaming chat (fallback).
   */
  async chat(request: ChatRequest): Promise<string> {
    const res = await this.fetchWithRetry(
      `${this.endpoint}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: false }),
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(this.mapHttpError(res.status, text, request.model));
    }

    const data = await res.json();
    return data.message?.content ?? '';
  }

  /**
   * List available models.
   */
  async listModels(): Promise<ModelInfo[]> {
    const res = await this.fetchWithRetry(
      `${this.endpoint}/api/tags`,
      {},
      10_000,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.models ?? [];
  }

  /**
   * Check endpoint health.
   */
  async checkHealth(): Promise<EndpointHealth> {
    const start = Date.now();
    try {
      const models = await this.listModels();
      return {
        reachable: true,
        latencyMs: Date.now() - start,
        models,
      };
    } catch (err) {
      return {
        reachable: false,
        latencyMs: Date.now() - start,
        models: [],
        error: this.mapFetchError(err),
      };
    }
  }

  // --- Private helpers ---

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number = DEFAULT_TIMEOUT,
  ): Promise<Response> {
    const controller = new AbortController();
    const existingSignal = init.signal;

    // Combine abort signals
    if (existingSignal) {
      existingSignal.addEventListener('abort', () => controller.abort());
    }

    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    timeoutMs: number = DEFAULT_TIMEOUT,
    retries: number = MAX_RETRIES,
  ): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await this.fetchWithTimeout(url, init, timeoutMs);

        // Retry on 502, 503, 504
        if (res.status >= 502 && res.status <= 504 && attempt < retries) {
          await this.sleep(RETRY_DELAY * (attempt + 1));
          continue;
        }

        return res;
      } catch (err) {
        lastError = err;

        // Don't retry on abort
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw err;
        }

        if (attempt < retries) {
          await this.sleep(RETRY_DELAY * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mapHttpError(status: number, body: string, model: string): string {
    switch (status) {
      case 400:
        return `Bad request: ${body || 'Check message format.'}`;
      case 404:
        return `Model "${model}" not found. Pull it on your server: ollama pull ${model}`;
      case 408:
        return 'Request timed out. Try a shorter message or check your server.';
      case 413:
        return 'Message too long for this model\'s context window.';
      case 429:
        return 'Too many requests. Wait a moment and try again.';
      case 500:
        return `Server error: ${body || 'Check Ollama logs.'}`;
      case 502:
        return 'Bad gateway. Your reverse proxy cannot reach Ollama.';
      case 503:
        return 'Model is loading. Please wait and try again.';
      case 504:
        return 'Gateway timeout. The model took too long to respond.';
      default:
        return `Server error (${status}): ${body || 'Unknown error'}`;
    }
  }

  private mapFetchError(err: unknown): string {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'Request timed out. Check your endpoint URL and server status.';
    }
    if (err instanceof TypeError) {
      // TypeError from fetch = network error
      const msg = (err as Error).message.toLowerCase();
      if (msg.includes('cors') || msg.includes('opaque')) {
        return 'CORS error. Your server must allow requests from this origin. See docs/server-setup.md.';
      }
      if (msg.includes('mixed content')) {
        return 'Mixed content blocked. Your endpoint must use HTTPS when this site is on HTTPS.';
      }
      return 'Cannot reach endpoint. Check the URL, ensure the server is running, and verify CORS is configured.';
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Unknown error connecting to endpoint.';
  }
}
