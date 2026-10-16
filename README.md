<div align="center">
  <img src="public/favicon.svg" alt="ATS Resume Analyzer logo" width="84" />
  <h1>ATS Resume Analyzer</h1>
  <p><strong>Private • Local • Instant AI Resume Analysis</strong></p>
  <p>
    <img src="https://img.shields.io/badge/status-beta-6C5CE7?style=for-the-badge&labelColor=0A0E27" alt="Beta status" />
  </p>
</div>

An AI-powered ATS resume analyzer built by **Suryansh Gupta** during an AI/ML internship. This browser-based application runs transformer models locally on your device using WebAssembly, ensuring complete privacy. Resume and job description data are processed in-browser and are never uploaded to external servers.

## Why ATS Resume Analyzer

- **Privacy-first workflow**: No account required, no backend resume processing, zero data collection
- **Local AI inference**: Runs Transformer models directly in the browser using Transformers.js and ONNX Runtime Web
- **Semantic similarity analysis**: Uses state-of-the-art sentence transformers for deep semantic understanding
- **Multiple input formats**: Supports pasted text and PDF input with intelligent text extraction
- **Fast compatibility scoring**: Real-time ATS compatibility scoring with semantic and domain checks
- **Open source and auditable**: Complete transparency in AI processing and scoring logic
- **Mobile responsive**: Optimized for all devices with progressive web app capabilities

## Current Status

This project is in **beta** phase. Core analysis is production-ready with successful deployment on Cloudflare Pages. The application demonstrates practical implementation of AI/ML concepts in a real-world scenario.

## Quick Start (Local Development)

```bash
git clone https://github.com/suryanshgupta0703-cyber/INTERNSHIP_PROJECT.git
cd INTERNSHIP_PROJECT
npm install
npm run dev
```

Open the dev server URL shown by Vite (typically `http://localhost:3000`).

**Note**: Models are automatically downloaded from HuggingFace on first use. No manual model download required.

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build production assets to `dist/` |
| `npm run preview` | Preview built app |
| `npm run serve` | Preview on port `3000` |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI-style) |
| `npm run test:ui` | Run Vitest UI |

## Environment Configuration

The application uses environment variables for model configuration. Create a `.env` file in the root directory:

```bash
# Model source: 'remote' uses HuggingFace CDN (recommended)
VITE_MODEL_SOURCE=remote

# Base URL for models (HuggingFace for remote mode)
VITE_MODEL_BASE_URL=https://huggingface.co

# Model names - using Xenova models optimized for browser AI
VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2

# Feature flags
VITE_DEBUG_MODE=true
VITE_ENABLE_CACHE=true
```

The app reads model settings from [`src/config/model-config.ts`](src/config/model-config.ts).

## AI/ML Models Used

This project demonstrates practical application of modern AI/ML techniques:

### Primary Model: Xenova/all-MiniLM-L6-v2
- **Type**: Sentence Transformer (DistilBERT-based)
- **Purpose**: Semantic similarity analysis and embeddings generation
- **Size**: ~90MB (quantized)
- **Optimization**: Specifically optimized for Transformers.js and browser deployment
- **Use Case**: Computes semantic similarity between resume and job descriptions

### Domain Model: Xenova/all-MiniLM-L6-v2
- **Type**: Sentence Transformer (shared with semantic model)
- **Purpose**: Domain compatibility analysis
- **Use Case**: Identifies domain alignment between resume and job requirements

### Skill Extraction
- **Technology**: Natural Language Processing (NLP) with custom taxonomy
- **Purpose**: Extracts and matches skills from resume and job descriptions
- **Method**: Pattern-based extraction with domain-specific keywords

## Deployment Options

### Option 1: Cloudflare Pages (Recommended - Currently Deployed)

The project is currently deployed at: https://internship-project.suryanshgupta0703.workers.dev

**To deploy your own version:**

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy command: `npx wrangler deploy` (if using Cloudflare Workers)

3. **Environment variables** (configured in Cloudflare dashboard):
   ```
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   ```

### Option 2: Netlify/Vercel

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Connect your repository to Netlify or Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables in the platform dashboard

### Option 3: Static Hosting (GitHub Pages, Surge, etc.)

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

## Tech Stack

### Frontend Framework
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **Vanilla JavaScript**: No framework dependencies for maximum performance

### AI/ML Technologies
- **Transformers.js**: Hugging Face transformers library for browser
- **ONNX Runtime Web**: Optimized inference engine for WebAssembly
- **Sentence Transformers**: State-of-the-art semantic similarity models
- **NLP**: Natural language processing for skill extraction

### Browser Technologies
- **Web Workers**: Off-main-thread ML inference for non-blocking UI
- **Comlink**: Type-safe RPC for worker communication
- **WebAssembly**: High-performance execution of ML models
- **Service Workers**: Offline capabilities and caching

### Data Processing
- **PDF.js**: PDF text extraction and parsing
- **Compromise.js**: Natural language processing library

### Styling
- **Custom CSS**: Responsive, mobile-first design
- **Tailwind CSS**: Utility-first CSS framework (development support)

## Project Structure

```text
ats-resume-analyzer/
├─ src/
│  ├─ core/              # ATS engine and ML scoring logic
│  │  ├─ ats-engine.ts   # Main ML inference engine
│  │  ├─ text-parser.ts  # Text preprocessing and parsing
│  │  ├─ skill-extractor.ts  # NLP-based skill extraction
│  │  └─ errors.ts       # Custom error handling
│  ├─ ui/                # UI behavior and interactions
│  │  ├─ app.ts          # Main UI orchestration
│  │  ├─ analysis.ts     # Analysis progress and results
│  │  ├─ modals.ts       # Modal dialogs
│  │  ├─ navigation.ts   # Tab switching and navigation
│  │  └─ alerts.ts       # Alert notifications
│  ├─ services/          # External service integrations
│  │  ├─ pdf.ts          # PDF processing service
│  │  └─ samples.ts      # Sample resume/job data
│  ├─ workers/           # Web Worker for ML inference
│  │  ├─ ats-worker.ts   # Worker-side ATS execution
│  │  └─ ats-worker-client.ts  # Main thread worker client
│  ├─ config/            # Configuration management
│  │  └─ model-config.ts # Dynamic model configuration
│  ├─ types/             # TypeScript type definitions
│  ├─ utils/             # Utility functions
│  └─ styles/            # Application styles
├─ public/               # Static assets
├─ tests/               # Unit and integration tests
├─ scripts/             # Utility scripts
├─ wrangler.jsonc       # Cloudflare Worker configuration
└─ package.json         # Dependencies and scripts
```

## AI/ML Implementation Details

### Semantic Similarity Analysis
The application uses sentence transformers to compute deep semantic similarity between resume and job descriptions:

1. **Text Preprocessing**: Clean and normalize input text
2. **Embedding Generation**: Convert text to 384-dimensional vectors using DistilBERT
3. **Similarity Computation**: Calculate cosine similarity between embeddings
4. **Score Normalization**: Map similarity to 0-100 scale

### Skill Extraction
Custom NLP pipeline for extracting skills from unstructured text:

1. **Pattern Matching**: Identify skill keywords using regex patterns
2. **Taxonomy Matching**: Match against predefined skill taxonomy
3. **Context Analysis**: Consider surrounding text for accuracy
4. **Scoring**: Calculate skill match percentage

### Domain Analysis
Domain compatibility using semantic clustering:

1. **Domain Embeddings**: Pre-computed domain-specific embeddings
2. **Similarity Calculation**: Compare resume against domain profiles
3. **Classification**: Identify most likely domain alignment
4. **Confidence Scoring**: Provide confidence metrics

## Performance Optimization

- **Web Workers**: ML inference runs in separate thread to prevent UI blocking
- **Model Quantization**: Using int8 quantized models for faster inference
- **WebAssembly**: Leverages WASM for near-native performance
- **Lazy Loading**: Models loaded only when needed
- **Caching**: Browser caching for repeated model downloads
- **Code Splitting**: Optimized bundle sizes with Vite

## Privacy & Security

- **100% Local Processing**: All AI computation happens in the browser
- **No Data Transmission**: Resume and job data never leave the device
- **No Backend Processing**: No server-side analysis or storage
- **No Tracking**: No analytics or user tracking
- **Open Source**: Full code transparency and auditability

## About the Developer

This project was developed by **Suryansh Gupta** during an AI/ML internship, demonstrating practical application of machine learning concepts in a real-world web application.

**Key Learning Outcomes:**
- Implementation of transformer models in browser environments
- Understanding of semantic similarity and NLP techniques
- Privacy-first AI architecture design
- WebAssembly and performance optimization
- Modern web development with TypeScript
- Production deployment on cloud platforms

**Technical Skills Demonstrated:**
- Machine Learning: Transformers, NLP, Semantic Similarity
- Web Technologies: WebAssembly, Web Workers, Service Workers
- Frontend Development: TypeScript, Vite, Responsive Design
- DevOps: CI/CD, Cloudflare Pages deployment
- Software Engineering: Testing, Error Handling, Code Architecture

## Future Enhancements

- [ ] Support for additional ML models (BERT, RoBERTa)
- [ ] Advanced skill extraction with ML-based classification
- [ ] Resume template matching
- [ ] Multi-language support
- [ ] Export analysis reports (PDF, JSON)
- [ ] Integration with job boards
- [ ] Advanced visualization of skill gaps

## License

Apache 2.0. See [LICENSE](LICENSE).

## Live Demo

Try the live application: https://internship-project.suryanshgupta0703.workers.dev

## Acknowledgments

- **Hugging Face**: For Transformers.js and pre-trained models
- **Xenova**: For browser-optimized AI models
- **ONNX Runtime**: For high-performance WebAssembly inference
- **Cloudflare**: For hosting and deployment infrastructure
