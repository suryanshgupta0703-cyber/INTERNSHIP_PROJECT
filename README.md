<div align="center">
  <img src="public/favicon.svg" alt="ATS Resume Analyzer logo" width="84" />
  <h1>ATS Resume Analyzer</h1>
  <p><strong>Private • Local • Instant AI Resume Analysis</strong></p>
  <p>
    <img src="https://img.shields.io/badge/status-beta-6C5CE7?style=for-the-badge&labelColor=0A0E27" alt="Beta status" />
  </p>
</div>

An AI-powered ATS resume analyzer built by **Suryansh Gupta**. This browser-based application runs AI locally on your device, ensuring complete privacy. Resume and job description data are processed in-browser and are never uploaded to external servers.

## Why ATS Resume Analyzer

- Privacy-first workflow (no account required, no backend resume processing)
- Local inference with Transformers.js + ONNX Runtime Web
- Supports pasted text and PDF input
- Fast compatibility scoring with semantic and domain checks
- Open source and auditable
- Built as an internship project by Suryansh Gupta

## Current status

localATS is in **beta** phase. Core analysis is production-usable, while some quality and model-tuning improvements are still in progress.

## Quick start (local development)

```bash
git clone <your-repo-url>
cd ats-resume-analyzer
npm install
cp .env.example .env.development
npm run download-models
npm run dev
```

Open the dev server URL shown by Vite (typically `http://localhost:5173`).

For a quick start guide, see [QUICKSTART.md](QUICKSTART.md).

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build production assets to `dist/` |
| `npm run build:offline` | Production-mode build |
| `npm run preview` | Preview built app |
| `npm run serve` | Preview on port `3000` |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-style) |
| `npm run test:ui` | Run Vitest UI |
| `npm run download-models` | Download required HF models to `public/models` |
| `npm run setup:local` | Alias for model download |

## Environment configuration

Copy `.env.example` and choose one mode:

- Local mode (development):
  - `VITE_MODEL_SOURCE=local`
  - `VITE_MODEL_BASE_URL=/models`
  - Model files served from `public/models/...`
- Remote mode (production):
  - `VITE_MODEL_SOURCE=remote`
  - `VITE_MODEL_BASE_URL=https://<your-model-host>`
  - Use HuggingFace-style model paths (`<model>/resolve/main/...`)

The app reads model settings from [`src/config/model-config.ts`](src/config/model-config.ts).

### Setting up HuggingFace Models

For production deployment, you can use models from HuggingFace:

1. **Choose or create models**: Select appropriate semantic and domain analysis models from HuggingFace or train your own
2. **Update environment variables**:
   ```bash
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=your-username/your-semantic-model
   VITE_DOMAIN_MODEL_PATH=your-username/your-domain-model
   ```
3. **Update model configuration**: Edit `src/config/model-config.ts` if you need custom model paths

## Deployment Options

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Option 1: Cloudflare Pages (Recommended)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables in Cloudflare Pages dashboard

3. **Configure environment variables**:
   ```
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=your-username/your-semantic-model
   VITE_DOMAIN_MODEL_PATH=your-username/your-domain-model
   ```

### Option 2: Cloudflare Workers

This repo includes [`wrangler.jsonc`](wrangler.jsonc) configured to serve `dist/` as Worker assets.

```bash
npm run build
npx wrangler deploy
```

If you are deploying with remote models, ensure your production env file values are set before building.

### Option 3: Netlify/Vercel

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Connect your repository to Netlify or Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables in the platform dashboard

### Option 4: Static Hosting (GitHub Pages, Surge, etc.)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   ```bash
   # For GitHub Pages
   npm run build
   # Copy dist/ contents to your GitHub Pages branch

   # For Surge
   npm run build
   surge dist your-domain.surge.sh
   ```

## Tech stack

- Vite + TypeScript
- Transformers.js
- ONNX Runtime Web
- Comlink + Web Workers
- PDF.js
- Tailwind CSS (utility styling support)

## AI models

- Semantic model: Custom semantic analysis model
- Domain model: Custom domain classification model

Both are used for compatibility analysis between resume and job description content.

## Project structure

```text
ats-resume-analyzer/
├─ src/
│  ├─ core/           # ATS engine and scoring logic
│  ├─ ui/             # UI behavior and interactions
│  ├─ services/       # PDF and sample helpers
│  ├─ workers/        # Worker-side ATS execution
│  └─ styles/         # App styles
├─ public/            # Static assets + model files (local mode)
├─ scripts/           # Model download script
├─ tests/             # Unit and integration tests
└─ wrangler.jsonc     # Cloudflare Worker asset deploy config
```

## About the Developer

This project was developed by **Suryansh Gupta** as an internship project demonstrating modern web development skills, AI integration, and privacy-first application design.

**Key Features Implemented:**
- Complete privacy-first architecture with local AI processing
- Integration of Transformers.js and ONNX Runtime Web
- Responsive design with mobile optimization
- PDF parsing and text analysis capabilities
- Real-time ATS compatibility scoring

## License

Apache 2.0. See [LICENSE](LICENSE).
