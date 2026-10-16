<div align="center">
  <img src="public/favicon.svg" alt="ATS Resume Analyzer logo" width="84" />
  <h1>ATS Resume Analyzer</h1>
  <p><strong>Private · Local · Instant AI Resume Analysis</strong></p>
  <p>
    <img src="https://img.shields.io/badge/status-beta-6C5CE7?style=for-the-badge&labelColor=0A0E27" alt="Beta status" />
    <img src="https://img.shields.io/badge/deployed-Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white&labelColor=0A0E27" alt="Cloudflare deployment" />
    <img src="https://img.shields.io/badge/AI-Transformers.js-yellow?style=for-the-badge&labelColor=0A0E27" alt="Transformers.js" />
  </p>
</div>

A browser-based ATS (Applicant Tracking System) resume analyzer powered by on-device AI. Transformer models run entirely inside your browser via WebAssembly — your resume and job description are never sent to any server.

## Why ATS Resume Analyzer?

- **Privacy-first by design** — No account, no backend, no data collection. All processing is local.
- **On-device AI inference** — Runs `Xenova/all-MiniLM-L6-v2` via Transformers.js and ONNX Runtime Web (WASM).
- **Hybrid scoring engine** — Combines semantic similarity, domain compatibility, and taxonomy-based skill matching for a nuanced ATS score.
- **Multi-format input** — Paste text directly or upload a PDF. PDF text extraction is handled in-browser using PDF.js.
- **Web Worker architecture** — Heavy ML inference runs on a dedicated Web Worker thread via Comlink, keeping the UI fully responsive.
- **Cloudflare-native deployment** — A Cloudflare Worker acts as a same-origin proxy for Hugging Face model files, eliminating CORS issues without any backend infrastructure.
- **Progressive Web App** — Offline-capable with a Service Worker and browser-cached models after the first load.
- **Mobile optimized** — Responsive layout with device-aware optimizations.

## Current Status

**Beta** — Core analysis is production-ready and deployed on Cloudflare Pages + Workers. The app is fully functional for semantic and skill-based resume analysis.

---

## Quick Start (Local Development)

```bash
git clone <your-repo-url>
cd localATS
npm install
npm run dev
```

Open `http://localhost:3000`. Models are downloaded automatically from Hugging Face on first use.

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server (port 3000) |
| `npm run build` | Build production assets to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run serve` | Preview on port 3000 |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run test:ui` | Launch Vitest UI |

---

## Environment Configuration

Create a `.env` file in the project root:

```bash
# 'remote' fetches models via the Cloudflare Worker proxy (recommended)
# 'local' uses models from the local filesystem (for offline dev)
VITE_MODEL_SOURCE=remote

# Base URL for remote models (only used in local dev; production auto-detects origin)
VITE_MODEL_BASE_URL=https://huggingface.co

# Sentence transformer model identifiers (Xenova namespace = browser-optimized)
VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2

# Feature flags
VITE_DEBUG_MODE=true
VITE_ENABLE_CACHE=true
```

> **Production note:** In a production build (`import.meta.env.PROD === true`), `model-config.ts` automatically forces remote mode and routes all model requests through the same-origin `/models-proxy/*` path served by `worker.js`. No environment variable override is needed for Cloudflare deployments.

Configuration is managed in [`src/config/model-config.ts`](src/config/model-config.ts).

---

## AI/ML Models

### Sentence Transformer — `Xenova/all-MiniLM-L6-v2`
- **Architecture**: DistilBERT (6 layers, 66 M parameters)
- **Purpose**: Generates 384-dimensional sentence embeddings for both semantic similarity and domain compatibility analysis
- **Quantization**: int8 WASM-quantized (~90 MB)
- **Runtime**: Transformers.js + ONNX Runtime Web (WASM backend)

### Skill Extractor
- **Source**: `public/skills_taxonomy.json` — a flat JSON dictionary mapping skill variations to canonical skill labels
- **Method**: N-gram tokenization (up to 5-grams) matched against the in-memory dictionary
- **Used for**: Identifying matched and missing skills between resume and job description, and applying skill-match penalties/boosts to the final score

---

## Scoring Logic

The ATS score is a composite of three signals:

1. **Semantic Similarity** — Cosine similarity (dot product of normalized embeddings) between resume and job description.
2. **Domain Compatibility** — A second embedding pass; if both texts score > 0.5 similarity and skill match > 30%, a domain-alignment boost is applied.
3. **Skill Match Factor** — Ratio of matched skills to average total skills. Applied as a non-linear multiplier:
   - < 10% match → ×0.5
   - < 30% match → ×0.7
   - < 50% match → ×0.85
   - ≥ 50% match → no penalty

**Final score formula:**
```
Base Score    = Semantic Similarity × 100
Domain Boost  = if (same domain AND skill match > 30%): 50 + (base × 0.5)
Skill Penalty = applied as multiplier based on skill match factor
Final Score   = clamp(0, 100, adjusted score)
Confidence    = (semantic × 0.7 + |domain| × 0.3) × 100
```

A 20-point penalty is applied separately if zero matching skills are found.

---

## Architecture Overview

```
Browser (Main Thread)
├── index.html + CSS
├── main.ts            → Orchestrates UI, PDF uploads, and worker communication
├── ui/                → DOM management, alerts, modals, navigation, analysis display
└── services/          → PDF text extraction (PDF.js), sample data

Browser (Web Worker Thread — via Comlink)
└── ats-worker.ts      → Hosts ATSEngine; handles model loading and inference
    └── ats-engine.ts  → Transformers.js pipeline, skill extraction, scoring

Cloudflare Worker (Edge — worker.js)
└── /models-proxy/*    → Reverse-proxies Hugging Face model files same-origin
└── ASSETS             → Serves static dist/ files
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 + TypeScript 5 |
| AI Inference | Transformers.js v3 (ONNX Runtime Web, WASM backend) |
| Worker Bridge | Comlink v4 |
| PDF Extraction | PDF.js v5 (CDN worker fallback) |
| NLP | Compromise.js, custom N-gram skill extractor |
| Styling | Vanilla CSS (custom design system) + Tailwind (dev) |
| Deployment | Cloudflare Workers + Pages |
| Testing | Vitest |

---

## Project Structure

```text
localATS/
├── src/
│   ├── core/
│   │   ├── ats-engine.ts        # ML pipeline: embedding, scoring, recommendations
│   │   ├── text-parser.ts       # Text cleaning and preprocessing
│   │   ├── skill-extractor.ts   # N-gram skill matching against taxonomy
│   │   └── errors.ts            # Typed error classes
│   ├── workers/
│   │   ├── ats-worker.ts        # Web Worker: exposes ATSEngine via Comlink
│   │   └── ats-worker-client.ts # Main thread: Comlink client for the worker
│   ├── config/
│   │   └── model-config.ts      # Dynamic model URL resolution (local vs. remote)
│   ├── services/
│   │   ├── pdf.ts               # PDF upload, drag-and-drop, PDF.js extraction
│   │   └── samples.ts           # Built-in sample resumes and job descriptions
│   ├── ui/
│   │   ├── analysis.ts          # Progress simulation, results rendering, skill map
│   │   ├── modals.ts            # Modal dialogs (settings, model details, etc.)
│   │   ├── navigation.ts        # Tab switching, FAQ, mobile menu
│   │   ├── alerts.ts            # Toast/status notifications
│   │   └── app.ts               # App-level UI init
│   ├── utils/
│   │   ├── dom.ts               # Type-safe DOM helpers
│   │   ├── device.ts            # Mobile detection and optimizations
│   │   └── helpers.ts           # Debounce, formatFileSize, etc.
│   ├── types/                   # Shared TypeScript interfaces and type guards
│   └── styles/                  # CSS: main, components, sections, results
├── public/
│   ├── _headers                 # Cloudflare Pages response headers (CORS, COEP, COOP)
│   ├── skills_taxonomy.json     # Skill dictionary (~6 MB, loaded at runtime)
│   ├── sw.js                    # Service Worker for offline caching
│   └── manifest.json            # PWA manifest
├── worker.js                    # Cloudflare Worker: model proxy + static asset serving
├── wrangler.jsonc               # Wrangler configuration
├── vite.config.js               # Vite build config
└── package.json
```

---

## Deployment — Cloudflare

This project is deployed as a **Cloudflare Worker** (not a plain Cloudflare Pages site) so the Worker can proxy Hugging Face model files same-origin.

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` configures:
- `assets.directory = ./dist` — serves the Vite build
- `assets.run_worker_first = ["/models-proxy/*"]` — routes proxy paths through `worker.js` before serving static files

The `worker.js` proxies `GET /models-proxy/<path>` → `https://huggingface.co/<path>` with:
- CORS headers on all responses
- `Cache-Control: public, max-age=604800, immutable` (7-day edge + browser cache)
- Range request forwarding for partial model file downloads

---

## Privacy & Security

- All AI inference happens in-browser. No resume or job description data is transmitted.
- The only external requests made are to Hugging Face (proxied through the Worker) to download the model files on first use.
- No analytics, no telemetry, no user accounts.
- Open source — the full scoring logic is auditable.

---

## Future Roadmap

- [ ] WebGPU acceleration (currently WASM-only)
- [ ] Support for additional sentence transformer models
- [ ] ML-based Named Entity Recognition for skill extraction
- [ ] Export analysis report as PDF or JSON
- [ ] Multi-language resume support
- [ ] Advanced skill gap visualization

---

## License

Apache 2.0. See [LICENSE](LICENSE).

---

## Acknowledgments

- **Hugging Face** — Transformers.js and `Xenova/all-MiniLM-L6-v2`
- **Mozilla** — PDF.js
- **Microsoft** — ONNX Runtime Web
- **Cloudflare** — Worker + Pages hosting infrastructure
