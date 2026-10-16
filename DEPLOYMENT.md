# Deployment Guide

This guide will help you deploy the ATS Resume Analyzer online. The application is designed to be flexible and can be deployed on various platforms.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A hosting platform account (Cloudflare Pages, Netlify, Vercel, or GitHub Pages)

## Step 1: Configure Your Models

### Option A: Use HuggingFace Models (Recommended)

1. **Choose appropriate models from HuggingFace**:
   - Semantic model: Look for sentence-transformers or embedding models
   - Domain model: Look for classification models

2. **Update environment variables**:
   Create a `.env.production` file:
   ```bash
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=your-username/your-semantic-model
   VITE_DOMAIN_MODEL_PATH=your-username/your-domain-model
   VITE_DEBUG_MODE=false
   VITE_ENABLE_CACHE=true
   ```

3. **Test locally with remote models**:
   ```bash
   cp .env.production .env.development
   npm run dev
   ```

### Option B: Use Local Models (Development Only)

For development, you can download models locally:

```bash
cp .env.example .env.development
npm run download-models
npm run dev
```

## Step 2: Build the Project

```bash
npm install
npm run build
```

This will create a `dist/` directory with all the production files.

## Step 3: Choose Your Deployment Platform

### Option 1: Cloudflare Pages (Recommended)

**Advantages**: Free, fast global CDN, automatic HTTPS, easy setup

**Steps**:

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/ats-resume-analyzer.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Build output directory: `dist`
     - Root directory: (leave empty)

3. **Add environment variables**:
   In Cloudflare Pages dashboard, go to Settings → Environment Variables and add:
   ```
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=your-username/your-semantic-model
   VITE_DOMAIN_MODEL_PATH=your-username/your-domain-model
   VITE_DEBUG_MODE=false
   VITE_ENABLE_CACHE=true
   ```

4. **Deploy**:
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your site

### Option 2: Netlify

**Advantages**: Easy to use, continuous deployment, form handling

**Steps**:

1. **Push your code to GitHub** (same as above)

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add environment variables**:
   In Netlify dashboard, go to Site settings → Environment variables and add the same variables as above

5. **Deploy**:
   - Click "Deploy site"

### Option 3: Vercel

**Advantages**: Fast, excellent developer experience, automatic HTTPS

**Steps**:

1. **Push your code to GitHub** (same as above)

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com/)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure build settings**:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add environment variables**:
   In Vercel dashboard, go to Settings → Environment Variables and add the same variables as above

5. **Deploy**:
   - Click "Deploy"

### Option 4: GitHub Pages

**Advantages**: Free, integrated with GitHub, simple

**Steps**:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Create a gh-pages branch**:
   ```bash
   git checkout -b gh-pages
   git add -f dist
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages / (root)
   - Click Save

4. **Note**: GitHub Pages doesn't support environment variables for static sites, so you'll need to hardcode your model paths in `.env.example` and include it in your build.

### Option 5: Cloudflare Workers

**Steps**:

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Configure wrangler.jsonc**:
   Update the `name` field if needed

4. **Deploy**:
   ```bash
   npm run build
   npx wrangler deploy
   ```

5. **Add environment variables**:
   ```bash
   npx wrangler secret put VITE_MODEL_SOURCE
   npx wrangler secret put VITE_MODEL_BASE_URL
   npx wrangler secret put VITE_SEMANTIC_MODEL_PATH
   npx wrangler secret put VITE_DOMAIN_MODEL_PATH
   ```

## Step 4: Configure Your Domain (Optional)

### Cloudflare Pages:
- Go to Custom Domains in your project settings
- Add your domain
- Update DNS records as instructed

### Netlify:
- Go to Domain settings
- Add custom domain
- Update DNS records

### Vercel:
- Go to Settings → Domains
- Add your domain
- Update DNS records

## Step 5: Test Your Deployment

1. **Visit your deployed URL**
2. **Test the analysis feature**:
   - Paste a sample resume
   - Paste a job description
   - Click "Run AI Analysis"
   - Verify that models load and analysis completes

3. **Check browser console** for any errors

## Troubleshooting

### Models not loading:
- Check that your HuggingFace model paths are correct
- Verify the models are public on HuggingFace
- Check browser console for CORS errors
- Ensure environment variables are set correctly

### Build errors:
- Ensure you're using Node.js v18 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check that all dependencies are installed

### Deployment issues:
- Verify your build command and output directory
- Check platform-specific documentation
- Review build logs for errors

### Performance issues:
- Ensure you're using quantized models for faster loading
- Consider using a CDN for model files
- Enable caching in your hosting platform

## Recommended Model Setup

For production, consider using these HuggingFace models or similar:

**Semantic Model:**
- `sentence-transformers/all-MiniLM-L6-v2` (Lightweight, fast)
- `sentence-transformers/all-mpnet-base-v2` (More accurate, larger)

**Domain Model:**
- Custom classification model trained on job descriptions
- Or use the same semantic model for both

Update your `.env.production` accordingly:
```bash
VITE_SEMANTIC_MODEL_PATH=sentence-transformers/all-MiniLM-L6-v2
VITE_DOMAIN_MODEL_PATH=sentence-transformers/all-MiniLM-L6-v2
```

## Security Considerations

1. **Never commit `.env` files** to your repository
2. **Use environment variables** for sensitive configuration
3. **Keep your dependencies updated**: `npm audit` and `npm update`
4. **Enable HTTPS** (most platforms do this automatically)
5. **Review and update** your models regularly

## Monitoring and Maintenance

1. **Monitor your site** for uptime and performance
2. **Check analytics** (if you add any) for usage patterns
3. **Update dependencies** regularly
4. **Review model performance** and update if needed
5. **Keep your deployment platform** updated

## Support

For issues specific to:
- **Cloudflare Pages**: [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- **Netlify**: [Netlify Docs](https://docs.netlify.com/)
- **Vercel**: [Vercel Docs](https://vercel.com/docs)
- **GitHub Pages**: [GitHub Pages Docs](https://docs.github.com/en/pages)

## Next Steps

After deployment:
1. Share your deployed URL
2. Test with real resumes and job descriptions
3. Gather feedback from users
4. Consider adding analytics (optional)
5. Plan future improvements

---

**Developed by Suryansh Gupta** | Internship Project 2025
