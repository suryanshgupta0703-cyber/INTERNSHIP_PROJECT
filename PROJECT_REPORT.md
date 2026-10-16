# ATS Resume Analyzer — Project Report

**Status:** Production Deployed  
**Platform:** Cloudflare Workers + Pages  
**Version:** 1.0.0 (Beta)

---

## Executive Summary

The ATS Resume Analyzer is a browser-based AI application that performs resume-to-job-description compatibility analysis entirely on the user's device. It uses a pre-trained sentence transformer model running via WebAssembly, with zero server-side data processing. The result is a production-grade, privacy-preserving tool deployed at global scale on Cloudflare's edge network at no infrastructure cost.

**Key outcome:** A fully functional AI scoring system that runs ML inference in-browser, proxies model files through a Cloudflare Worker to avoid CORS issues, and delivers real-time ATS compatibility analysis with semantic similarity, domain detection, and skill taxonomy matching.

---

## 1. Problem Statement

Applicant Tracking Systems (ATS) are used by the majority of employers to screen resumes automatically. Job seekers face two problems:

1. **Opacity** — They cannot easily know how their resume ranks against a specific job description before applying.
2. **Privacy** — Existing ATS analysis tools require uploading resumes to third-party servers, creating unnecessary data privacy risks.

This project addresses both by providing a local, transparent, and auditable ATS scoring tool.

---

## 2. Solution Design

### Core Principles
- **Privacy-first**: All text processing stays in the browser. Nothing is transmitted.
- **Zero infrastructure**: No backend database, no API server, no per-request cost.
- **Transparency**: The full scoring logic is open-source and auditable.
- **Cloudflare-native**: Leverages Cloudflare Worker as a same-origin model proxy to sidestep CORS without a real backend.

### What the App Does
1. User inputs a resume (text paste or PDF upload) and a job description.
2. Both inputs are sent to a Web Worker thread via Comlink RPC.
3. The worker loads `Xenova/all-MiniLM-L6-v2` (if not cached) from Hugging Face through the `/models-proxy/*` edge proxy.
4. Embeddings are computed for both texts using mean-pooled, normalized vectors.
5. Cosine similarity (dot product), domain compatibility, and skill taxonomy matching are combined into a final ATS score (0–100).
6. Results — score, confidence, matched/missing skills, recommendations — are rendered in the UI.

---

## 3. Technical Architecture

### 3.1 System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│                                                          │
│  ┌────────────────┐  Comlink RPC  ┌──────────────────┐  │
│  │  Main Thread   │◄─────────────►│   Web Worker     │  │
│  │  (UI / DOM)    │               │  (ATSEngine)     │  │
│  └────────────────┘               └──────────────────┘  │
│          │                               │               │
│          │                               ▼               │
│          │                    ┌──────────────────┐       │
│          │                    │ Transformers.js   │       │
│          │                    │ (ONNX WASM)       │       │
│          │                    └──────────────────┘       │
│          │                               │               │
│          ▼                               ▼               │
│  ┌────────────────┐          /models-proxy/* fetch       │
│  │ PDF.js Worker  │                      │               │
│  │(PDF extraction)│          ┌───────────┴──────────┐    │
│  └────────────────┘          │  Cloudflare Worker   │    │
│                              │  (worker.js)         │    │
└──────────────────────────────│──────────────────────│────┘
                               │                      │
                               ▼                      ▼
                    Hugging Face CDN          Static dist/ assets
                    (model files)            (Cloudflare Pages)
```

### 3.2 Key Architectural Decisions

**Cloudflare Worker as Model Proxy**

Hugging Face does not consistently return CORS headers when requested from arbitrary origins. Rather than relying on a third-party CORS proxy, `worker.js` is deployed as a Cloudflare Worker that intercepts all requests to `/models-proxy/*` and forwards them to `huggingface.co` with proper CORS headers. The Worker also caches model responses for 7 days at the edge (`Cache-Control: public, max-age=604800, immutable`), dramatically reducing cold-start latency for returning users.

**Web Worker + Comlink**

ML model loading and inference (embedding generation, similarity calculation) are dispatched to a dedicated Web Worker. Comlink provides a transparent RPC layer, making the worker API appear as a regular async TypeScript class from the main thread. This keeps the UI fully interactive even while models are loading.

**Dynamic Model Configuration**

`src/config/model-config.ts` distinguishes between local development (direct Hugging Face URLs) and production (same-origin Worker proxy URLs). In production builds, the configuration is hardcoded to route through the Worker proxy regardless of environment variables, ensuring correct behavior on Cloudflare.

**PDF.js Worker Fallback**

PDF.js requires a dedicated worker for its parsing engine. In production builds, the worker is loaded from a CDN (`cdnjs.cloudflare.com`) as a fallback, since bundling the PDF.js worker in a WASM-heavy build can conflict with Content Security Policy headers. The primary path resolves the worker relative to `import.meta.url`.

### 3.3 Technology Stack

| Category | Technology | Version |
|---|---|---|
| Build System | Vite | 6.x |
| Language | TypeScript | 5.x |
| AI Framework | Transformers.js (`@huggingface/transformers`) | 3.7.x |
| ML Runtime | ONNX Runtime Web | 1.22.0-dev |
| Worker Bridge | Comlink | 4.4.x |
| PDF Processing | PDF.js (`pdfjs-dist`) | 5.7.x |
| NLP | Compromise.js | 14.x |
| Styling | Vanilla CSS + Tailwind CSS (dev) | — |
| Deployment | Cloudflare Workers + Pages | — |
| Testing | Vitest | 3.x |

---

## 4. AI/ML Pipeline

### 4.1 Model: `Xenova/all-MiniLM-L6-v2`

- **Architecture**: DistilBERT with 6 transformer layers, 66 M parameters
- **Task**: Sentence embedding (feature extraction)
- **Embedding dimension**: 384
- **Quantization**: int8, WASM-optimized (~90 MB on disk)
- **Why this model**: Specifically packaged for Transformers.js (Xenova namespace), avoids CORS issues, fast inference in WASM

**Embedding computation:**
```typescript
const output = await model(text, { pooling: 'mean', normalize: true });
// output.data → Float32Array of 384 dimensions
```

**Similarity calculation (dot product of normalized vectors = cosine similarity):**
```typescript
const similarity = dot(resumeEmbedding.data, jobEmbedding.data);
// Range: [0, 1] after normalization
```

Text is truncated to 10,000 characters before embedding to stay within practical token limits.

### 4.2 Skill Extraction Pipeline

The skill extractor uses a dictionary-based approach loaded from `public/skills_taxonomy.json` (~6 MB):

1. **Tokenize** — Split text on whitespace and delimiters (`,-•*()[]/\n\r\t`), filter tokens under 2 characters.
2. **N-gram generation** — Generate all possible phrases of 1 to 5 tokens from the token list.
3. **Sort by length** — Longer phrases are matched first to prefer specific multi-word skills.
4. **Dictionary lookup** — Check each phrase against the taxonomy map. The map normalizes variations to canonical skill labels.

Both resume and job description are processed independently. The intersection gives matched skills; the remainder from the job side gives missing skills.

### 4.3 Scoring Formula

```
Base Score    = semantic_similarity × 100

Domain Boost:
  isSameDomain = domain_similarity > 0.5
  if (isSameDomain AND skill_match_factor > 0.3):
    score = 50 + (Base Score × 0.5)
  else:
    score = Base Score

Skill Penalty (non-linear):
  skill_match_factor = matched_skills / avg(resume_skills, job_skills)
  if skill_match_factor < 0.10 → score × 0.50
  if skill_match_factor < 0.30 → score × 0.70
  if skill_match_factor < 0.50 → score × 0.85

Additional penalty:
  if matched_skills == 0 → score − 20

Final Score = clamp(0, 100, adjusted_score)

Confidence = (semantic_similarity × 0.7 + |domain_similarity| × 0.3) × 100

Domain Compatibility (UI display) = clamp(0, 100, domain_similarity × 50 + 50)

Skill Depth (UI display) = skill_match_factor × 100
```

### 4.4 Recommendations

Generated from the semantic similarity value:

| Similarity Range | Recommendation Type | Priority |
|---|---|---|
| < 0.4 | Major content overhaul needed | High |
| 0.4 – 0.6 | Content alignment improvements | High |
| 0.6 – 0.8 | Fine-tune language to mirror job posting | Medium |
| ≥ 0.8 | Focus on quantifying achievements | Low |

A quantification suggestion is also added when the overall score is below 85.

---

## 5. Feature Set

### 5.1 Input Options
- **Text paste** — Direct textarea input for resume and job description
- **PDF upload** — Drag-and-drop or click-to-upload with PDF.js text extraction (up to 10 MB)
- **Sample data** — Built-in samples for tech, marketing, design, and finance roles

### 5.2 Analysis Output
- **Overall ATS Score** (0–100) with color-coded rating
- **Confidence Score** — How certain the model is about the similarity
- **Domain Compatibility** — Same-domain alignment indicator
- **Skill Depth** — Proportion of skills matched
- **Matched Skills** — Taxonomy-normalized list of skills found in both documents
- **Missing Skills** — Skills required by the job but absent from the resume
- **Recommendations** — Prioritized actions (immediate / strategic / formatting)
- **Warnings** — Flagged issues (e.g., no skills detected, zero matched skills)

### 5.3 UX Features
- Real-time progress indicators during model loading and inference
- Tab-based navigation between resume/job input sections
- Modal dialogs for model info, settings, and detailed results
- Mobile-responsive layout with device-specific optimizations
- PWA-capable (offline via Service Worker after first load)

---

## 6. Deployment Configuration

### Cloudflare Worker (`wrangler.jsonc`)
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

`run_worker_first` ensures that model proxy requests reach `worker.js` before Cloudflare tries to serve a static file from `dist/`.

### Response Headers (`public/_headers`)

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
```

`COEP: credentialless` (rather than `require-corp`) was chosen because model files fetched through the Worker proxy return CORS headers that satisfy credentialless mode, while `require-corp` required explicit Cross-Origin-Resource-Policy headers on every asset — creating brittle configuration.

### Deploy Command
```bash
npm run build
npx wrangler deploy
```

---

## 7. Performance Characteristics

| Metric | Typical Value |
|---|---|
| First Contentful Paint | < 1.5 s |
| Time to Interactive | < 3 s |
| Model download (first load) | 10–30 s (from HF CDN) |
| Model load from cache | < 1 s |
| Analysis time (inference) | 0.5–2 s |
| Peak memory (model loaded) | ~150 MB |
| Bundle size (JS, gzipped) | ~8 MB (excl. model) |
| Edge CDN build time | ~30 s |

Model files are cached both at the Cloudflare edge (7 days) and in the browser's cache storage via the Service Worker (indefinite until cache eviction).

---

## 8. Engineering Challenges & Solutions

### Challenge 1 — CORS on Hugging Face Model Files
**Problem**: Hugging Face CDN responses sometimes omit `Access-Control-Allow-Origin` headers, causing `fetch()` to fail in the browser.

**Solution**: A Cloudflare Worker (`worker.js`) proxies all model requests through the same origin. Every response from the Worker includes explicit CORS headers and a 7-day cache directive.

### Challenge 2 — PDF.js Worker in Production Build
**Problem**: Vite's bundle output changed the path of the PDF.js worker file, causing a 404 at runtime in production.

**Solution**: The worker source is resolved using `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`. A try/catch falls back to loading the worker from the CDN if the URL resolution fails. This covers both bundled and unbundled deployment scenarios.

### Challenge 3 — `Cross-Origin-Embedder-Policy` Compatibility
**Problem**: ONNX Runtime Web requires `SharedArrayBuffer` for multi-threaded WASM, which requires `COEP: require-corp`. But `require-corp` blocked external assets (Google Fonts, CDN resources) unless they included `CORP` headers.

**Solution**: Used `COEP: credentialless` instead of `require-corp`. This satisfies the WASM threading requirement while allowing credentialless cross-origin fetches without requiring `CORP` on every resource.

### Challenge 4 — UI Blocking During ML Inference
**Problem**: Loading and running transformer models on the main thread would freeze the UI for several seconds.

**Solution**: The entire `ATSEngine` (model loading + inference) runs inside a Web Worker. Comlink provides transparent async RPC so the main thread calls `worker.score(resume, job)` as a normal async function. Status updates from the worker flow back via `self.postMessage` and are rendered as progress indicators.

---

## 9. Security & Privacy

| Property | Implementation |
|---|---|
| Data transmission | None — all text stays in-browser |
| External requests | Only to Hugging Face (via Worker proxy) for model download |
| Analytics / Telemetry | None |
| Authentication | Not required |
| Code transparency | Open source, full scoring logic auditable |
| CSP / Security headers | Configured in `public/_headers` |

---

## 10. Future Roadmap

| Feature | Notes |
|---|---|
| WebGPU backend | Would significantly speed up inference on capable devices |
| Additional models | BERT-base, RoBERTa for higher accuracy |
| NER-based skill extraction | ML-based instead of dictionary lookup |
| Export report | PDF or JSON download of analysis results |
| Multi-language support | Non-English resumes and JDs |
| Skill gap visualization | Interactive chart of matched vs. missing skills |

---

## 11. References

- Reimers, N. & Gurevych, I. (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*. EMNLP 2019.
- Sanh, V. et al. (2019). *DistilBERT, a distilled version of BERT*. NeurIPS 2019.
- Vaswani, A. et al. (2017). *Attention Is All You Need*. NeurIPS 2017.
- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)

---

## Appendix A: Dependency Versions

### Production
| Package | Version |
|---|---|
| `@huggingface/transformers` | 3.7.3 |
| `onnxruntime-web` | 1.22.0-dev.20250409 |
| `comlink` | 4.4.2 |
| `pdfjs-dist` | 5.7.284 |
| `compromise` | 14.14.4 |
| `email-regex` | 6.1.0 |

### Development
| Package | Version |
|---|---|
| `vite` | 6.x |
| `typescript` | 5.9.x |
| `vitest` | 3.2.x |
| `tailwindcss` | 3.4.x |

---

## Appendix B: Source Structure Summary

```
Language       Files    Est. Lines
──────────────────────────────────
TypeScript       15      ~5,000
CSS               4        ~800
HTML              2        ~400
JavaScript        1         ~83
──────────────────────────────────
Total            22      ~6,283
```

---

*Last updated: October 2026 | Status: Production Deployed*
