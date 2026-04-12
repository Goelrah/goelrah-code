# goelrah-code — GitHub Pages Deployment Guide

## How It Works

1. Push to `main` branch
2. GitHub Actions builds with `GITHUB_PAGES=true` (sets base to `/goelrah-code/`)
3. `dist/` is deployed to GitHub Pages
4. `404.html` handles SPA routing — redirects all paths back to `index.html`

## Setup Steps

### 1. Repository Settings
1. Go to repo → Settings → Pages
2. Source: **GitHub Actions** (not "Deploy from a branch")

### 2. Push and Deploy
```bash
git add .
git commit -m "initial deploy"
git push origin main
```
The workflow runs automatically. Site will be at `https://username.github.io/goelrah-code/`

### 3. Custom Domain (Optional)
If using a custom domain:
1. Add `CNAME` file in `public/` with your domain
2. Set `base: '/'` in `vite.config.ts` (remove the `GITHUB_PAGES` conditional)
3. Configure DNS: CNAME → `username.github.io`
4. Enable HTTPS in repo Settings → Pages

## Base Path

- **Project pages** (`username.github.io/goelrah-code`): `base: '/goelrah-code/'` — set automatically when `GITHUB_PAGES=true`
- **Custom domain** (`goelrah.yourdomain.com`): `base: '/'`
- **Local dev**: always `base: '/'`

## SPA Routing on GitHub Pages

GitHub Pages doesn't support server-side routing. We handle this with:
1. `public/404.html` — catches all 404s, encodes the path as a query param, redirects to `index.html`
2. `index.html` — reads the query param and uses `history.replaceState` to restore the clean URL
3. Vue Router uses HTML5 history mode — clean URLs, no `#`

## Troubleshooting

### Blank page after deploy
- Check browser console for 404 errors on JS/CSS files
- Verify `GITHUB_PAGES=true` is set in the build step
- Check that Pages source is set to "GitHub Actions"

### Routes return 404
- Verify `public/404.html` exists and is included in the build
- Check that the redirect script in `index.html` is present

### Assets not loading
- Ensure Vite `base` matches your deployment path
- Content-hashed filenames prevent stale cache issues

## Release Checklist

- [ ] `npm run build` succeeds locally
- [ ] No hardcoded secrets in source
- [ ] GitHub Pages source set to "GitHub Actions"
- [ ] Workflow runs successfully
- [ ] Site loads at expected URL
- [ ] SPA routing works (navigate to `/settings`, refresh — should not 404)
- [ ] Endpoint connection works from deployed site
- [ ] Model selector loads models from endpoint
