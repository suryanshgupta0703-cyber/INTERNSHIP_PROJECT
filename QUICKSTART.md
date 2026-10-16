# Quick Start Guide

Get ATS Resume Analyzer up and running in minutes.

## Local Development

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ats-resume-analyzer
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.development
```

### 3. Download Models (Optional - for local mode)

```bash
npm run download-models
```

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Production Deployment

### Quick Deploy to Cloudflare Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/ats-resume-analyzer.git
   git push -u origin main
   ```

2. **Deploy on Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add environment variables (see below)
   - Click "Save and Deploy"

### Environment Variables

Add these in your deployment platform:

```bash
VITE_MODEL_SOURCE=remote
VITE_MODEL_BASE_URL=https://huggingface.co
VITE_SEMANTIC_MODEL_PATH=sentence-transformers/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=sentence-transformers/all-MiniLM-L6-v2
VITE_DEBUG_MODE=false
VITE_ENABLE_CACHE=true
```

## Testing

### Test the Application

1. Open the deployed URL
2. Paste a sample resume (or use the built-in samples)
3. Paste a job description
4. Click "Run AI Analysis"
5. Wait for the analysis to complete
6. Review the results and recommendations

### Sample Resumes

The app includes sample resumes for:
- Tech professionals
- Marketing roles
- Design positions
- Finance careers

Click "Try a sample" to load these quickly.

## Common Issues

### Models not loading?
- Check your environment variables
- Verify HuggingFace model paths are correct
- Check browser console for errors

### Build failing?
- Ensure Node.js v18+ is installed
- Run `npm install` again
- Delete `node_modules` and reinstall

### Analysis not working?
- Wait for models to load (first load takes longer)
- Check browser console for errors
- Verify both resume and job description are provided

## Next Steps

- Read the full [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment options
- Check [README.md](README.md) for project documentation
- Customize the UI and features as needed

---

**Developed by Suryansh Gupta** | Internship Project 2025
