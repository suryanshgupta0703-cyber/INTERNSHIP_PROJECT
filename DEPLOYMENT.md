# Deployment Guide

Deploy the ATS Resume Analyzer on Cloudflare (recommended) or any static hosting platform. Because the application uses a Cloudflare Worker to proxy Hugging Face model files, Cloudflare Workers + Pages is the primary supported deployment target.

---

## Prerequisites

- Node.js v18 or higher
- npm
- Git
- A Cloudflare account (free tier is sufficient)
- Wrangler CLI (`npm install -g wrangler`)

---

## How Deployment Works

This project is deployed as a **Cloudflare Worker** — not a plain Cloudflare Pages site. The distinction matters:

- `worker.js` handles all incoming requests.
- Requests to `/models-proxy/*` are reverse-proxied to `huggingface.co` with CORS headers and a 7-day cache.
- All other requests are served from the static `dist/` build via the `ASSETS` binding.

This architecture eliminates CORS issues when loading model files in the browser, without any backend server.

---

## Step 1 — Build

```bash
npm install
npm run build
```

Output goes to `dist/`. Build time is approximately 30 seconds.

---

## Step 2 — Deploy to Cloudflare (Recommended)

### Option A: Wrangler CLI (recommended)

```bash
# Authenticate with Cloudflare
wrangler login

# Deploy
npx wrangler deploy
```

Wrangler reads `wrangler.jsonc` for configuration. The current config:

```jsonc
{
  "name": "internship-project",
  "compatibility_date": "2025-10-17",
  "main": "worker.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/models-proxy/*"]
  }
}
```

`run_worker_first` ensures that `/models-proxy/*` requests reach `worker.js` before Cloudflare attempts to serve a static file.

### Option B: Cloudflare Pages via GitHub

1. Push your code to GitHub.
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/) → Create a project.
3. Connect your GitHub repository.
4. Set:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add environment variables (see [Environment Variables](#environment-variables)).
6. Click **Save and Deploy**.

> **Note**: Cloudflare Pages automatically handles `public/_headers` to set security and CORS headers on the static assets.

---

## Environment Variables

These are build-time variables (Vite `VITE_` prefix). Set them in the Cloudflare dashboard under **Settings → Environment Variables** for Cloudflare Pages, or in `.env` for local development.

| Variable | Recommended Value | Description |
|---|---|---|
| `VITE_MODEL_SOURCE` | `remote` | Use `remote` for production; `local` for offline dev with downloaded models |
| `VITE_MODEL_BASE_URL` | `https://huggingface.co` | Base URL for model downloads (overridden in production by the Worker proxy) |
| `VITE_SEMANTIC_MODEL_PATH` | `Xenova/all-MiniLM-L6-v2` | Sentence transformer model |
| `VITE_DOMAIN_MODEL_PATH` | `Xenova/all-MiniLM-L6-v2` | Domain compatibility model (same as semantic) |
| `VITE_DEBUG_MODE` | `false` | Enables verbose console logging |
| `VITE_ENABLE_CACHE` | `true` | Enables browser model caching |

> **Important**: In production builds (`import.meta.env.PROD === true`), `model-config.ts` automatically forces remote mode and routes model requests through `/models-proxy/*`. The environment variables above are not strictly required for Cloudflare deployments, but are kept for flexibility.

---

## Step 3 — Verify Deployment

1. Open your deployment URL.
2. Open the browser DevTools → Network tab.
3. Click **Run AI Analysis** with any text.
4. Verify:
   - Model files load from `/models-proxy/Xenova/all-MiniLM-L6-v2/...` (same-origin, status 200).
   - No CORS errors in the console.
   - Analysis completes and displays a score.

---

## Alternative Platforms

### Netlify / Vercel (static only)

These platforms can serve the static `dist/` build, but **cannot** run the Cloudflare Worker proxy. Model files will be fetched directly from Hugging Face, which may fail due to CORS restrictions depending on the browser and network.

```bash
npm run build
# Upload dist/ to Netlify or Vercel
```

If you proceed with Netlify/Vercel, add the same environment variables in their respective dashboards.

### GitHub Pages

GitHub Pages serves static files only. CORS issues with Hugging Face model fetching are likely. Not recommended without a separate CORS proxy.

```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## Domain Configuration (Optional)

### Cloudflare Workers

1. Go to your Worker in the Cloudflare dashboard.
2. Under **Triggers → Custom Domains**, add your domain.
3. Cloudflare provisions an SSL certificate automatically.

### Cloudflare Pages

1. Go to your Pages project → **Custom Domains**.
2. Add your domain and update DNS as instructed.

---

## Troubleshooting

### Models not loading

- Check that `/models-proxy/` requests return 200 in DevTools Network tab.
- Verify `wrangler.jsonc` has `"run_worker_first": ["/models-proxy/*"]`.
- Ensure `worker.js` is deployed (run `npx wrangler deploy`, not just `wrangler pages publish`).
- Check for CORS errors in the browser console.

### PDF upload not working

- Ensure the PDF contains selectable text (not a scanned image).
- Check the browser console for PDF.js worker errors.
- The PDF.js worker is loaded from CDN (`cdnjs.cloudflare.com`) as a fallback — ensure this URL is accessible.

### `SharedArrayBuffer` / WASM threading errors

- The `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` headers in `public/_headers` are required. Verify they are present in the response headers using DevTools.
- If you see `Cannot use SharedArrayBuffer` warnings, check that both headers are served correctly.

### Build errors

- Ensure Node.js v18 or higher: `node --version`
- Delete `node_modules/` and `package-lock.json`, then run `npm install` again.
- Check for TypeScript errors: `npx tsc --noEmit`

### 404 on `/models-proxy/*`

- This means the Worker is not handling requests. Run `npx wrangler deploy` (not `wrangler pages deploy`).
- Confirm `wrangler.jsonc` has `"main": "worker.js"` and the `run_worker_first` config.

---

## Performance Expectations

| Metric | Value |
|---|---|
| First Contentful Paint | < 1.5 s |
| Time to Interactive | < 3 s |
| Model download (first load) | 10–30 s |
| Subsequent loads (cache hit) | < 1 s |
| Analysis time | 0.5–2 s |
| Cloudflare edge cache | 7 days per model file |

Model files are cached at two levels:
1. **Cloudflare edge** — `Cache-Control: public, max-age=604800, immutable` set by `worker.js`
2. **Browser cache** — Via the Service Worker (`public/sw.js`)

---

## Cost

All Cloudflare free tier limits are sufficient for this project:

| Resource | Free Tier Limit |
|---|---|
| Worker requests | 100,000 / day |
| Pages builds | 500 / month |
| Bandwidth | 100 GB / month |
| SSL certificate | Included |
| **Total monthly cost** | **$0** |

Model files are served from Cloudflare's edge cache after the first request per edge node, so bandwidth for model files is minimal.
