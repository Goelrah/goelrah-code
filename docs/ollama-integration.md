# GOELRAH — Ollama Browser Integration Contract

## 1. Default Endpoint

`https://rahulollama.loca.lt`

Configurable by the user in Settings. Stored in localStorage.

## 2. API Contract

### Chat (Streaming)
```
POST {endpoint}/api/chat
Content-Type: application/json

{
  "model": "llama3",
  "messages": [
    { "role": "system", "content": "You are a coding assistant." },
    { "role": "user", "content": "Explain async/await" }
  ],
  "stream": true,
  "options": {
    "temperature": 0.7,
    "num_predict": 4096
  }
}
```

Response: NDJSON stream
```
{"model":"llama3","message":{"role":"assistant","content":"Async"},"done":false}
{"model":"llama3","message":{"role":"assistant","content":"/await"},"done":false}
{"model":"llama3","message":{"role":"assistant","content":""},"done":true,"total_duration":1234567890}
```

### List Models
```
GET {endpoint}/api/tags

Response:
{
  "models": [
    { "name": "llama3:latest", "size": 4661224676, ... },
    { "name": "mistral:latest", "size": 4372824384, ... },
    { "name": "gemma:latest", "size": 5011853225, ... }
  ]
}
```

## 3. Client Features

| Feature | Implementation |
|---------|---------------|
| Streaming | `fetch()` + `ReadableStream` NDJSON parser |
| Timeout | 120s default, `AbortController` |
| Retry | 2 retries with exponential backoff for 502/503/504 |
| Abort | User can stop generation, `AbortController.abort()` |
| Health check | `GET /api/tags` with 10s timeout |
| Non-streaming fallback | `stream: false` for compatibility |

## 4. Error Mapping

| Scenario | Detection | User Message |
|----------|-----------|-------------|
| Endpoint unreachable | fetch TypeError | "Cannot reach endpoint. Check URL and server status." |
| CORS blocked | fetch TypeError (opaque) | "CORS error. Configure your server to allow this origin." |
| Mixed content | browser blocks | "Endpoint must use HTTPS when this site is on HTTPS." |
| Model not found | HTTP 404 | "Model not found. Pull it: ollama pull {model}" |
| Model loading | HTTP 503 / done_reason: "load" | "Model is loading. Please wait." |
| Timeout | AbortSignal | "Request timed out." |
| Server error | HTTP 500 | "Server error. Check Ollama logs." |
| Bad gateway | HTTP 502 | "Reverse proxy cannot reach Ollama." |
| Rate limited | HTTP 429 | "Too many requests. Wait and try again." |
| User abort | AbortError | (silent, partial response preserved) |

## 5. Retry Strategy

```
Attempt 1: immediate
Attempt 2: wait 1s
Attempt 3: wait 2s

Retryable: 502, 503, 504, network errors
Not retryable: 400, 404, 413, 429, user abort
```
