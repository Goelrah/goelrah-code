# 05 - Build browser API layer

```text
Implement the browser-side API integration layer for the static app.

Create:
- Ollama-compatible API client
- configurable base URL handling
- configurable model handling
- streaming response parser if endpoint supports it
- timeout handling
- retry handling for transient failures
- endpoint health check helper
- typed request/response contracts
- user-friendly error mapping

Also document server expectations:
- CORS config
- HTTPS/TLS
- authentication options to protect the backend
- rate limiting on my server
- reverse proxy recommendations

Important:
- no frontend secrets
- no server logic in the static site
- explain limitations clearly
```
