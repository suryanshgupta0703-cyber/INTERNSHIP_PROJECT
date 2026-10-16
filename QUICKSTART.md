# Quick Start Guide

Get ATS Resume Analyzer up and running in minutes.

## Local Development

### 1. Clone and Install

```bash
git clone https://github.com/suryanshgupta0703-cyber/INTERNSHIP_PROJECT.git
cd INTERNSHIP_PROJECT
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
VITE_MODEL_SOURCE=remote
VITE_MODEL_BASE_URL=https://huggingface.co
VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DEBUG_MODE=true
VITE_ENABLE_CACHE=true
```

### 3. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

**Note**: Models are automatically downloaded from HuggingFace on first use. No manual download required.

## Production Deployment

### Quick Deploy to Cloudflare Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **Deploy on Cloudflare Pages**:
   - Go to [Cloudflare Pages](https://dash.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables (see below)
   - Click "Save and Deploy"

### Environment Variables

Add these in Cloudflare Pages dashboard:

```bash
VITE_MODEL_SOURCE=remote
VITE_MODEL_BASE_URL=https://huggingface.co
VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
VITE_DEBUG_MODE=false
VITE_ENABLE_CACHE=true
```

## Testing

### Test the Application

1. Open the deployed URL
2. Paste a sample resume (or use the built-in samples)
3. Paste a job description
4. Click "Run AI Analysis"
5. Wait for the analysis to complete (first load: 10-30s for model download)
6. Review the results and recommendations

### Sample Resumes

The app includes sample resumes for:
- Tech professionals
- Marketing roles
- Design positions
- Finance careers

Click "Try a sample" to load these quickly.

### PDF Upload

1. Click "Upload PDF" tab
2. Upload your resume PDF
3. Text will be extracted automatically
4. Proceed with analysis

## Common Issues

### Models not loading?
- Check your environment variables are set correctly
- Verify you have an internet connection (models download from HuggingFace)
- Check browser console for errors
- Try clearing browser cache

### Build failing?
- Ensure Node.js v18+ is installed
- Run `npm install` again
- Delete `node_modules` and `rm package-lock.json`, then reinstall

### Analysis not working?
- Wait for models to load (first load takes 10-30 seconds)
- Check browser console for errors
- Verify both resume and job description are provided
- Ensure the text has sufficient length (resume: 50+ chars, job: 30+ chars)

### PDF upload not working?
- Ensure the PDF is not password-protected
- Check that the PDF contains selectable text (not scanned images)
- Try copying text directly instead

## Performance Notes

- **First Load**: 10-30 seconds (model download from HuggingFace)
- **Subsequent Loads**: <1 second (browser cache)
- **Analysis Time**: 0.5-2 seconds
- **Memory Usage**: ~150MB (for model inference)

## Next Steps

- Read the full [README.md](README.md) for project documentation
- Check [PROJECT_REPORT.md](PROJECT_REPORT.md) for detailed technical report
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment options
- Customize the UI and features as needed

## Live Demo

Try the live application: https://internship-project.suryanshgupta0703.workers.dev

---

**Developed by Suryansh Gupta** | AI/ML Internship Project 2025
