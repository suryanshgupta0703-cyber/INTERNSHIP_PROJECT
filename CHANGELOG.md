# Changelog

All notable changes to this project are documented here, derived from the full git commit history.
Changes are listed from most recent to oldest.

---

## [Unreleased] — 2026-10-16 — Skill Match Map UI, documentation overhaul, and project cleanup

### `src/types/index.ts` — Modified
- Added `SkillMatchSummary` interface:
  ```ts
  interface SkillMatchSummary {
      matched: string[];
      missing: string[];
      resumeSkills: string[];
      jobSkills: string[];
  }
  ```
- Added optional `skillMatch?: SkillMatchSummary` field to `ATSAnalysisResult`.

### `src/core/ats-engine.ts` — Modified
- Added `missingSkills: string[]` array computed by iterating over `extractedJobSkills` and collecting any skill not present in `extractedResumeSkills`.
- `score()` result now includes a `skillMatch` object:
  ```ts
  skillMatch: {
      matched: Array.from(matchedSkills).sort(),
      missing: missingSkills.sort(),
      resumeSkills: Array.from(extractedResumeSkills).sort(),
      jobSkills: Array.from(extractedJobSkills).sort()
  }
  ```

### `src/ui/analysis.ts` — Modified (significant feature addition)
- Added `renderSkillMatchMap(result: ATSAnalysisResult): void` export.
  - Renders a **Skill Match Map** section inside `#skillAnalysis`:
    - Summary line: "N of M job skills found on your resume (X%)".
    - Two side-by-side columns: **Matched** chips (green highlight) and **Missing from resume** chips (red).
    - Chips are capped at 18 per column via `SKILL_CHIP_LIMIT`; extra count shown as "+N more".
  - Two action buttons:
    - **Copy missing skills** — copies a plain-text list of missing skills to clipboard.
    - **Copy score card** — copies a formatted score card (score, confidence, domain %, skill depth %, matched/missing skill lists) to clipboard.
  - `escapeHtml()` helper prevents XSS in skill chip rendering.
  - `copyText()` async helper writes to clipboard and calls `showSuccess()` / `showError()`.
  - `formatMissingSkills()` and `formatScoreCard()` text formatters for clipboard output.
  - `lastAnalysisResult` module-level variable for future reference.
- Added imports: `showSuccess`, `showError` from `./alerts.ts`; `ATSAnalysisResult` type.

### `src/main.ts` — Modified
- Imported `renderSkillMatchMap` from `./ui/analysis.ts`.
- Called `renderSkillMatchMap(result)` inside `setScore()` after `updateOverviewTab()`, so the Skill Match Map is populated on every completed analysis.

### `index.html` — Modified
- Added a new FAQ item (#6): *"Why is the first analysis slower?"* — explains the model download, cache behaviour, and why the button starts disabled.
- Footer year updated from `2025` to `2026`.

### `package.json` — Modified
- Cleared `"author"` field (removed personal name).

### Documentation — Complete rewrite
- **`README.md`**: Rewritten to reflect actual architecture (Worker proxy, scoring formula, real tech stack). Removed all personal/internship references.
- **`PROJECT_REPORT.md`**: Rewritten as a professional technical document. Removed internship framing, evaluator fields, and personal name. Added accurate system diagram, scoring formula extracted from source, and engineering challenges/solutions.
- **`DEPLOYMENT.md`**: Restructured around Cloudflare Worker deployment. Added troubleshooting specific to current CORS/COEP/PDF.js issues.
- **`QUICKSTART.md`**: Simplified to essentials — install, configure, run, deploy.
- **`CHANGELOG.md`**: Created — full modification history derived from git log and diffs across all 15 commits.

---

## [HEAD] — 2026-10-16 — Fix Cloudflare AI model loading via same-origin Hugging Face proxy

**Commit:** `e5822f9`  
**Root cause fixed:** The Service Worker was intercepting `fetch()` calls made by Transformers.js for model files from HuggingFace. Because those responses came from a cross-origin URL, the SW stripped CORS headers, causing the browser to block the response. This left the "Run AI Analysis" button permanently disabled in production.

### `worker.js` — **New file**
- Created a Cloudflare Worker script that serves as a same-origin reverse proxy.
- All requests to `/models-proxy/*` are forwarded to `https://huggingface.co/<path>`.
- The Worker attaches explicit CORS headers (`Access-Control-Allow-Origin: *`, exposes `Content-Length`, `Content-Range`, `Accept-Ranges`) on every proxied response.
- Supports `Range` request forwarding for partial/chunked model file downloads.
- Sets `Cache-Control: public, max-age=604800, immutable` (7-day edge + browser cache) on all model responses.
- Handles `OPTIONS` preflight requests with `204 No Content`.
- Rejects `..` path traversal attempts with `400 Bad Request`.

### `wrangler.jsonc` — Modified
- Added `"main": "worker.js"` to register the Worker entry point.
- Added `"binding": "ASSETS"` to the assets block so the Worker can serve static files via `env.ASSETS.fetch(request)`.
- Added `"run_worker_first": ["/models-proxy/*"]` so model proxy paths are routed through the Worker before Cloudflare tries to serve a static file.

### `src/config/model-config.ts` — Modified
- Changed `remotePathTemplate` from `'{model}/resolve/main/'` to `'models-proxy/{model}/resolve/main/'` so Transformers.js resolves model file URLs through the same-origin proxy instead of HuggingFace directly.
- `getRemoteHost()` now uses `globalThis.location.origin` (works in both main thread and Web Worker context) instead of `window.location.origin`.
- Production builds now force `modelSource = 'remote'` regardless of env vars.
- `getPaths()` hardcodes `Xenova/all-MiniLM-L6-v2` for both semantic and domain models in production builds.
- Added `console.log` statements for model config and model path logging to aid production debugging.

### `public/sw.js` — Modified
- Bumped cache name from `ats-analyzer-cache-v1` to `ats-analyzer-cache-v2` to force cache refresh on deploy.
- Added early-return guards in the `fetch` event handler:
  - Skip non-`GET` requests.
  - Skip cross-origin requests (`url.origin !== self.location.origin`) — this was the fix; the SW no longer intercepts HuggingFace model downloads.
  - Skip `/models-proxy/*` paths — these must reach the Cloudflare Worker, not the SW cache.
- Simplified the cache-match fallback logic.

### `src/core/ats-engine.ts` — Modified
- Added `env.useBrowserCache = true` to the Transformers.js environment config.
- Wrapped semantic model load in try/catch with explicit error re-throw.
- Added `progress_callback` to the semantic model pipeline call — emits `statusUpdate` events with `Downloading model... N%` during download.
- If domain model fails to load, falls back to reusing the semantic model instance rather than throwing.
- Removed all ONNX ensemble model loading (`polyFeatures`, `scoreMapper`, `neuralMapper`) and ensemble weights fetch from the `loadModel()` path — these are now permanently disabled. Skill extractor is initialized unconditionally.

### `src/main.ts` — Modified
- PDF.js worker configuration wrapped in try/catch: primary path uses `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`, fallback uses CDN URL (`cdnjs.cloudflare.com`).
- `atsWorker.on('error', ...)` handler now extracts a human-readable message from the event data and calls `showError()` + `updateStatus()`.
- `atsWorker.initialize()` result is checked: if `success === false`, throws with a user-facing message prompting a page refresh.
- Added `console.log` in the `ready` event handler.

### `.env.example` — Modified
- Simplified comments to reflect proxy-based production setup.

---

## 2026-10-16 — Revert worker proxy approach, use direct HuggingFace with CORS

**Commit:** `de069f5`  
*(This commit was an intermediate approach that was superseded by `e5822f9` above.)*

- Removed `_worker.js` (a Cloudflare Pages `_worker.js` variant that was incompatible with Cloudflare Pages routing).
- Reverted `model-config.ts` to use direct HuggingFace URLs.
- Added `env.useBrowserCache = true` as an attempted CORS workaround.
- Removed `wrangler.jsonc` `main` entry.

---

## 2026-10-16 — Fix Web Worker compatibility by using `self.location.origin`

**Commit:** `4db67be`

### `src/config/model-config.ts` — Modified
- `getRemoteHost()` changed to use `globalThis.location.origin` instead of `window.location.origin`.
- Web Workers do not have a `window` object; accessing it caused `ReferenceError: Can't find variable: window` inside the worker thread.
- Added a `'location' in globalThis` guard before accessing `globalThis.location.origin`.

---

## 2026-10-16 — Add Cloudflare Worker proxy to bypass HuggingFace CORS restrictions

**Commit:** `eaafad3`  
*(First attempt at the Worker proxy pattern, using `_worker.js` — later replaced by `worker.js`.)*

- Created `_worker.js` to proxy `/models-proxy/*` requests to HuggingFace.
- Updated `model-config.ts` to route model URLs through the proxy in production.
- Updated `wrangler.jsonc` to include the worker entry.

---

## 2026-10-16 — Fix Cloudflare Pages model loading by forcing Xenova models in production

**Commit:** `e1a59ae`

### `src/config/model-config.ts` — Modified
- Added production-specific branch in `getPaths()` that hardcodes `Xenova/all-MiniLM-L6-v2` for both semantic and domain models.
- Added `isProduction` guard: production builds force `modelSource = 'remote'` regardless of `VITE_MODEL_SOURCE` env var.

### `src/core/ats-engine.ts` — Modified
- Added `progress_callback` to `pipeline()` call to emit `statusUpdate` events showing download percentage.
- Added structured try/catch around model load with explicit error logging.

---

## 2026-10-16 — Fix Cloudflare `_headers` syntax and improve PDF text extraction reliability

**Commit:** `7d9a1c8`

### `public/_headers` — Modified
- Fixed syntax errors: unindented route path specifiers (Cloudflare Pages requires paths to start at column 0).
- Changed WASM asset cache pattern from `/public/assets/*.wasm` to `/assets/*` (correct Cloudflare Pages path).
- Added `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` to satisfy `SharedArrayBuffer` requirements for multi-threaded WASM.

### `src/main.ts` — Modified
- PDF.js worker configuration changed to try `import.meta.url`-relative path first, falling back to CDN.

### `src/services/pdf.ts` — Modified
- `getDocument()` call changed from accepting a plain `Uint8Array` to accepting a config object with:
  - `data: typedArray`
  - `cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/cmaps/'` — character maps for accurate Unicode rendering
  - `cMapPacked: true`
  - `standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/standard_fonts/'` — standard PDF fonts
- Updated `getDocument` TypeScript type declaration to include the config object overload.
- Added `loadingTask.promise.catch()` handler that distinguishes worker load errors from general PDF parse errors and emits specific `PDFProcessingError` error codes.
- Text item extraction changed from `item.str` to `(typeof item?.str === 'string' ? item.str : '')` with a `.filter(Boolean)` call — prevents crashes on non-text PDF content items.

### `src/config/model-config.ts` — Minor
- Debug logging adjustments.

---

## 2026-10-16 — Add Cloudflare Pages headers and debug model configuration

**Commit:** `1c7d2e0`

### `public/_headers` — **New file**
- Initial creation of the Cloudflare Pages headers file.
- Added CORS headers (`Access-Control-Allow-Origin: *`, methods, headers, max-age).
- Added security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.
- Added asset cache rules.

### `src/config/model-config.ts` — Modified
- Added `console.log` at config resolution time to debug production model loading.
- Logged: `source`, `allowLocalModels`, `allowRemoteModels`, `remoteHost`, `remotePathTemplate`, `semanticModel`, `isProduction`, `envSource`.

---

## 2026-10-16 — Fix Cloudflare Worker name to match deployment

**Commit:** `a1192b4`

### `wrangler.jsonc` — Modified
- Changed `"name"` from `"ats-resume-analyzer"` to `"internship-project"` to match the existing Cloudflare Pages project name and resolve a worker name mismatch warning on deployment.

---

## 2026-10-16 — Enable console logs in production for debugging

**Commit:** `5d134a0`

### `vite.config.js` — Modified
- Changed `drop_console: true` to `drop_console: false` in Terser options.
- Console logs are now kept in the production bundle to allow debugging on the live deployment via browser DevTools.

---

## 2026-10-16 — Update documentation

**Commit:** `e4f2e58`

- Created `PROJECT_REPORT.md` (initial version).
- Updated `README.md`, `QUICKSTART.md`, `DEPLOYMENT.md` with AI/ML focus and Cloudflare deployment instructions.

---

## 2026-10-16 — Fix model loading and add debug logging for production deployment

**Commit:** `477b947`

### `package.json` — Modified
- Updated `pdfjs-dist` to `^5.7.284`.
- Added `onnxruntime-web` version override.

### `src/config/model-config.ts` — Modified
- Switched default model names from custom `ats-semantic-v1-en` / `ats-domain-v1-en` to `Xenova/all-MiniLM-L6-v2` for both semantic and domain models.
- Simplified `getPaths()` to use the Xenova model for all environments.

### `src/core/ats-engine.ts` — Modified
- Added try/catch around domain model loading with a fallback to the semantic model.
- Added progress logging throughout `loadModel()`.

### `src/main.ts` — Modified
- Updated PDF.js worker source to CDN URL for reliable production deployment.
- Added `initResult.success` check after `atsWorker.initialize()`.

### `src/workers/ats-worker-client.ts` — Modified
- Added logging on worker message receipt.

### `src/workers/ats-worker.ts` — Modified
- Added `console.log('[ATSWorker] Worker script started.')` as first line for initialization tracing.

---

## 2026-10-16 — Simplify ATS engine to work with standard HuggingFace models

**Commit:** `2ad3486`

### `src/core/ats-engine.ts` — Modified (significant refactor)
- **Removed** all ONNX ensemble model loading from `loadModel()`:
  - `polyFeatures` (ONNX `InferenceSession`)
  - `scoreMapper` (ONNX `InferenceSession`)
  - `neuralMapper` (ONNX `InferenceSession`)
  - `ensembleWeights` (JSON fetch from `universal_score_weights.json`)
- These models were custom artifacts that don't exist on standard HuggingFace model repos.
- **Removed** `calculateEnsembleScore()` call from `calculateFinalATSScore()`.
- Replaced ensemble scoring with semantic similarity-based scoring:
  - `Base Score = semantic_similarity × 100`
  - Domain boost: if same domain AND skill match > 30% → `50 + (base × 0.5)`
  - Non-linear skill match penalties: < 10% → ×0.5; < 30% → ×0.7; < 50% → ×0.85
- Skill extractor is now initialized unconditionally (not inside a try/catch that skips it on ONNX failure).

---

## 2026-10-16 — Configure to use standard HuggingFace models for immediate functionality

**Commit:** `1d79575`

### `src/config/model-config.ts` — Modified
- Changed remote model defaults from non-existent `ats-semantic-v1-en` / `ats-domain-v1-en` to `sentence-transformers/all-MiniLM-L6-v2` (later changed to `Xenova/` namespace in `477b947`).
- Updated base URL logic to default to `https://huggingface.co` for remote mode.

### `.env.example` — Modified
- Removed custom model path references.
- Added clear comments for `VITE_MODEL_SOURCE`, `VITE_MODEL_BASE_URL`, `VITE_SEMANTIC_MODEL_PATH`, `VITE_DOMAIN_MODEL_PATH`.

---

## 2026-10-16 — Fix PDF.js worker configuration for Cloudflare Pages deployment

**Commit:** `20863fa`

### `src/main.ts` — Modified
- Changed PDF.js worker source from `import.meta.url`-relative path (which broke in the Cloudflare Pages build output) to a hardcoded CDN URL: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs`.
- This fixed the "No text could be extracted from PDF" error in production caused by the worker failing to load.

---

## 2026-10-16 — Initial project setup

**Commit:** `c19e164`  
Full initial codebase commit. All source files added.

### Files added (58 files total)
| File | Description |
|---|---|
| `src/core/ats-engine.ts` | Main ML engine: model loading, embedding, scoring, recommendations |
| `src/core/text-parser.ts` | Text preprocessing and normalization |
| `src/core/skill-extractor.ts` | N-gram skill matching against taxonomy dictionary |
| `src/core/errors.ts` | `ATSEngineError` typed error class |
| `src/workers/ats-worker.ts` | Web Worker: exposes `ATSEngine` via Comlink |
| `src/workers/ats-worker-client.ts` | Main thread Comlink client for the worker |
| `src/config/model-config.ts` | Dynamic model URL resolution (local vs. remote) |
| `src/services/pdf.ts` | PDF upload, drag-and-drop, PDF.js text extraction |
| `src/services/samples.ts` | Built-in sample resumes and job descriptions |
| `src/ui/analysis.ts` | Progress simulation, results rendering, skill match map |
| `src/ui/modals.ts` | Modal dialogs |
| `src/ui/navigation.ts` | Tab navigation, FAQ toggles, mobile menu |
| `src/ui/alerts.ts` | Status/toast notifications |
| `src/ui/app.ts` | App-level UI init stub |
| `src/utils/dom.ts` | Type-safe DOM query helpers |
| `src/utils/device.ts` | Mobile detection and layout optimizations |
| `src/utils/helpers.ts` | `debounce`, `formatFileSize`, etc. |
| `src/types/index.ts` | All shared TypeScript interfaces and type guards |
| `src/main.ts` | Application entry point |
| `src/transformers-config.ts` | Transformers.js environment pre-configuration |
| `src/styles/` | Full CSS design system (main, components, sections, results, layout, base, utilities) |
| `public/skills_taxonomy.json` | ~6 MB flat dictionary: skill variation → canonical label |
| `public/sw.js` | Service Worker for offline caching |
| `public/manifest.json` | PWA manifest |
| `public/favicon.svg` + icons | App icons |
| `index.html` | Main HTML shell |
| `debug.html` | Debug/diagnostic HTML page |
| `vite.config.js` | Vite build configuration |
| `wrangler.jsonc` | Cloudflare Wrangler configuration |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript compiler config |
| `tailwind.config.cjs` | Tailwind CSS config |
| `tests/` | Unit and integration tests (Vitest) |
| `scripts/download-models.js` | Script to download models for local/offline development |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore rules |
| `LICENSE` | Apache 2.0 |

---

## Summary of All Modified Files Across All Commits

| File | What Changed |
|---|---|
| `worker.js` | Created — Cloudflare Worker: model proxy + static asset serving |
| `wrangler.jsonc` | Worker name, `main` entry, `ASSETS` binding, `run_worker_first` |
| `public/_headers` | Created — CORS, COEP, COOP, security, and cache headers |
| `public/sw.js` | Cache name bump; skip cross-origin and `/models-proxy/*` fetches |
| `src/config/model-config.ts` | Force remote mode in prod; proxy URL template; Xenova model hardcodes; `globalThis` fix |
| `src/core/ats-engine.ts` | Removed ONNX ensemble; simplified scoring; progress callback; domain model fallback |
| `src/services/pdf.ts` | cMapUrl + standardFontDataUrl; loading error handler; robust text item parsing |
| `src/main.ts` | PDF.js worker try/catch CDN fallback; error handler message; init result check |
| `src/workers/ats-worker.ts` | Added startup log |
| `src/workers/ats-worker-client.ts` | Added message receipt logging |
| `vite.config.js` | `drop_console: false` for production debugging |
| `package.json` | pdfjs-dist version bump; onnxruntime-web override |
| `.env.example` | Updated model path comments and defaults |
| `README.md` | Full documentation rewrite |
| `PROJECT_REPORT.md` | Created and rewritten |
| `DEPLOYMENT.md` | Rewritten for Worker-based deployment |
| `QUICKSTART.md` | Simplified and updated |
