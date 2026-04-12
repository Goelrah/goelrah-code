# GOELRAH — Risk & Mitigation Table

## Technical Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| TR-01 | CORS misconfiguration blocks all requests | High | Provide exact Caddy/Nginx configs; health check button in UI |
| TR-02 | Mixed content (HTTPS page → HTTP endpoint) | High | Document that endpoint MUST use HTTPS; detect and warn in UI |
| TR-03 | GitHub Pages base path causes blank page | Medium | Document Vite `base` config; hash-mode routing |
| TR-04 | localStorage quota exceeded | Low | Warn at 4MB; offer export/cleanup |
| TR-05 | Streaming not supported in older browsers | Low | ReadableStream supported in all modern browsers; fallback to non-streaming |
| TR-06 | Large responses cause UI lag | Medium | Virtual scrolling for long conversations; limit render buffer |

## Security Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| SR-01 | Endpoint URL visible in browser | Medium | Not a secret — real auth on server. Document clearly. |
| SR-02 | Soft gate gives false security sense | Medium | Bold warning text in UI: "Client-side only. Not real security." |
| SR-03 | No server-side auth by default | High | Document auth setup in server-setup.md; recommend basic auth minimum |
| SR-04 | XSS via AI-generated content | Medium | Sanitize rendered markdown; no v-html without sanitization |
| SR-05 | localStorage accessible to same-origin scripts | Low | No secrets stored; only preferences and chat history |

## Deployment Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| DR-01 | GitHub Actions workflow fails | Low | Simple workflow; documented troubleshooting |
| DR-02 | Custom domain DNS misconfiguration | Low | Step-by-step guide in deployment.md |
| DR-03 | Stale cache after deploy | Low | Vite content-hashes all assets |

## Assumptions

| # | Assumption | Risk if Wrong |
|---|-----------|--------------|
| A-01 | User has a private server with Ollama | App is useless without endpoint |
| A-02 | Server has HTTPS and CORS configured | Browser blocks all requests |
| A-03 | Single user / private use | No multi-user features needed |
| A-04 | Modern browser (Chrome/Firefox/Safari) | Streaming may not work |
| A-05 | Desktop-first usage | Mobile layout is secondary |
