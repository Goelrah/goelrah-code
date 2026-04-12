# Rahul Goel AI Studio — Server Setup Guide

## Current Setup

Your Ollama is running at `https://rahulollama.loca.lt` via localtunnel. This works for development. For production, use a proper reverse proxy.

## Minimal Architecture

```
Browser (GitHub Pages)
    │ HTTPS
    ▼
Reverse Proxy (Caddy/Nginx)
    │ :443 → :11434
    ▼
Ollama (localhost:11434)
```

The AI Studio frontend calls your server directly from the browser. All real security lives on your server — the frontend has zero secrets.

## Option 1: localtunnel (Current — Dev Only)

```bash
# Install
npm install -g localtunnel

# Expose Ollama
lt --port 11434 --subdomain rahulollama
```

Pros: zero config, instant HTTPS
Cons: unstable, no auth, public URL, not for production

## Option 2: Caddy (Recommended — Production)

Caddy auto-provisions TLS via Let's Encrypt.

```
# /etc/caddy/Caddyfile

ollama.yourdomain.com {
    # CORS — allow your GitHub Pages origin
    @cors_preflight method OPTIONS
    handle @cors_preflight {
        header Access-Control-Allow-Origin "https://yourusername.github.io"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "Content-Type, Authorization"
        header Access-Control-Max-Age "86400"
        respond "" 204
    }
    header Access-Control-Allow-Origin "https://yourusername.github.io"

    # Optional: basic auth
    # basicauth {
    #     rahul $2a$14$hashedpasswordhere
    # }

    # Rate limiting (requires caddy-ratelimit plugin)
    # rate_limit {
    #     zone api {
    #         key {remote_host}
    #         events 30
    #         window 1m
    #     }
    # }

    # Proxy to Ollama — buffering off for streaming
    reverse_proxy localhost:11434 {
        flush_interval -1
    }
}
```

```bash
# Install Caddy
sudo apt install -y caddy

# Start
sudo systemctl enable caddy
sudo systemctl start caddy
```

## Option 3: Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name ollama.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/ollama.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ollama.yourdomain.com/privkey.pem;

    # CORS
    add_header Access-Control-Allow-Origin "https://yourusername.github.io" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    if ($request_method = OPTIONS) {
        return 204;
    }

    # Optional: basic auth
    # auth_basic "AI Studio";
    # auth_basic_user_file /etc/nginx/.htpasswd;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    location / {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:11434;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection '';
        proxy_buffering off;          # Required for streaming
        proxy_read_timeout 300;       # Long timeout for generation
        proxy_send_timeout 300;
    }
}
```

## CORS Configuration

Your server MUST return these headers for the browser to connect:

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | `https://yourusername.github.io` (or `*` for dev) |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |
| `Access-Control-Max-Age` | `86400` |

The `OPTIONS` preflight request must return `204` with these headers.

## TLS/HTTPS

Required. The browser will block mixed content (HTTPS page → HTTP endpoint).

| Method | Effort | Notes |
|--------|--------|-------|
| Caddy (auto) | Low | Auto Let's Encrypt, zero config |
| Certbot + Nginx | Medium | `certbot --nginx -d ollama.yourdomain.com` |
| localtunnel | Zero | Built-in HTTPS, dev only |
| Cloudflare Tunnel | Low | Free, no port forwarding needed |

## Authentication Options

| Method | How | Frontend Support |
|--------|-----|-----------------|
| None | Open endpoint | Works out of the box |
| Basic auth | Reverse proxy `auth_basic` | Browser prompts for credentials |
| Bearer token | Check `Authorization` header | Add token in Settings (future) |
| IP allowlist | Firewall / reverse proxy rules | No frontend change needed |
| Cloudflare Access | Zero-trust tunnel | Browser handles auth flow |
| VPN / Tailscale | Network-level | No frontend change needed |

For basic auth with Caddy:
```bash
caddy hash-password
# Enter password, get bcrypt hash
# Add to Caddyfile basicauth block
```

## Rate Limiting

Protect against abuse. Recommended limits:

| Endpoint | Limit |
|----------|-------|
| `/api/chat` | 30 requests/minute |
| `/api/tags` | 60 requests/minute |

## Health Endpoint

The AI Studio frontend checks health by calling `GET /api/tags`. If Ollama returns 200 with a models array, it's healthy. No extra endpoint needed.

## Ollama Setup

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3
ollama pull mistral
ollama pull gemma

# Ollama runs on localhost:11434 by default
# Do NOT expose port 11434 directly to the internet
```

## Verified Models (Your Server)

| Model | Size | Status |
|-------|------|--------|
| llama3:latest | 4.7GB | ✓ Working |
| mistral:latest | 4.4GB | ✓ Working |
| gemma:latest | 5.0GB | ✓ Working |
| bjoernb/claude-sonet-4-5:latest | remote | ✓ Available |

## Quick Checklist

- [ ] Ollama installed and running with models pulled
- [ ] Reverse proxy configured with TLS
- [ ] CORS headers set for your GitHub Pages URL
- [ ] Streaming works (`proxy_buffering off` / `flush_interval -1`)
- [ ] Optional auth configured
- [ ] Test from browser: open AI Studio, go to Health page
