# Quick Start Guide

Get the ATS Resume Analyzer running locally or deployed to Cloudflare in a few minutes.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
VITE_MODEL_SOURCE=remote
VITE_MODEL_BASE_URL=https://huggingface.co
VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DEBUG_MODE=true
VITE_ENABLE_CACHE=true
```

An example file is provided at [`.env.example`](.env.example).

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

> Models are downloaded from Hugging Face on first use and cached in the browser. The first load takes 10–30 seconds. Subsequent loads are under 1 second.

---

## Running an Analysis

1. **Enter your resume** — paste text in the Resume tab, or use the **Upload PDF** tab to upload a PDF (up to 10 MB).
2. **Enter the job description** — paste or upload similarly.
3. Click **Run AI Analysis**.
4. Wait for model loading (progress shown in real time).
5. Review your ATS score, matched/missing skills, and recommendations.

Try the **Load Sample** button to test with pre-loaded resume and job description examples.

---

## Deploy to Cloudflare

```bash
# Build
npm run build

# Deploy (Wrangler must be authenticated)
npx wrangler deploy
```

This deploys a Cloudflare Worker that:
- Serves the static app from `dist/`
- Proxies model files from Hugging Face through `/models-proxy/*` to avoid CORS issues

For detailed deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Common Issues

### Analysis not running
- Confirm the model is loading — check the status bar at the top of the page.
- Resume must be at least 50 characters; job description must be at least 30 characters.
- Check the browser console for errors.

### Models not loading (production)
- Verify `npx wrangler deploy` was used (not just `wrangler pages publish`).
- Check DevTools Network tab — `/models-proxy/` requests should return 200.

### PDF text not extracted
- The PDF must contain selectable text (not a scanned image).
- Try opening the PDF in a viewer and copying text manually to verify.

### Build fails
- Requires Node.js v18 or higher: `node --version`
- Try `rm -rf node_modules package-lock.json && npm install`

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run test:run` | Run tests once |
| `npm run test` | Run tests in watch mode |

---

## Further Reading

- [README.md](README.md) — Full project documentation and architecture overview
- [PROJECT_REPORT.md](PROJECT_REPORT.md) — Detailed technical report (scoring logic, ML pipeline, challenges)
- [DEPLOYMENT.md](DEPLOYMENT.md) — Deployment options and troubleshooting
