# Deployment Guide

This guide will help you deploy the ATS Resume Analyzer online. The application is designed to be flexible and can be deployed on various platforms with zero infrastructure costs.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A hosting platform account (Cloudflare Pages, Netlify, Vercel, or GitHub Pages)

## Current Deployment Status

**Live Application**: https://internship-project.suryanshgupta0703.workers.dev  
**Platform**: Cloudflare Pages  
**Status**: Production Ready  

## Step 1: Configure Your Models

### Using Xenova Models (Recommended for Browser AI)

The application uses Xenova models optimized for browser deployment:

1. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```bash
   VITE_MODEL_SOURCE=remote
   VITE_MODEL_BASE_URL=https://huggingface.co
   VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   VITE_DEBUG_MODE=false
   VITE_ENABLE_CACHE=true
   ```

2. **Why Xenova Models?**
   - Specifically optimized for Transformers.js
   - Quantized for browser deployment (~90MB)
   - Fast inference with WebAssembly
   - No manual download required - automatic from HuggingFace

### Alternative: Custom HuggingFace Models

If you want to use custom models:

1. **Choose appropriate models from HuggingFace**:
   - Semantic model: Look for sentence-transformers or embedding models
   - Domain model: Look for classification models

2. **Update environment variables**:
   ```bash
   VITE_SEMANTIC_MODEL_PATH=your-username/your-semantic-model
   VITE_DOMAIN_MODEL_PATH=your-username/your-domain-model
   ```

3. **Ensure models are publicly accessible** on HuggingFace

## Step 2: Build the Project

```bash
npm install
npm run build
```

This will create a `dist/` directory with all the production files.

**Build Time**: ~30 seconds  
**Output Size**: ~50MB (including optimized assets)

## Step 3: Choose Your Deployment Platform

### Option 1: Cloudflare Pages (Recommended - Currently Used)

**Advantages**: Free, fast global CDN, automatic HTTPS, easy setup, zero infrastructure costs

**Steps**:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
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
   VITE_SEMANTIC_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   VITE_DOMAIN_MODEL_PATH=Xenova/all-MiniLM-L6-v2
   VITE_DEBUG_MODE=false
   VITE_ENABLE_CACHE=true
   ```

4. **Deploy**:
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your site
   - Build time: ~1-2 minutes
   - Global CDN: Instant worldwide availability

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

4. **Note**: GitHub Pages doesn't support environment variables for static sites. You'll need to hardcode your model paths in the code or use a different platform.

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

## Step 4: Configure Your Domain (Optional)

### Cloudflare Pages:
- Go to Custom Domains in your project settings
- Add your domain
- Update DNS records as instructed
- Free SSL certificate automatically provided

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
   - Paste a sample resume (or use built-in samples)
   - Paste a job description
   - Click "Run AI Analysis"
   - Wait for model download (first load: 10-30 seconds)
   - Verify that analysis completes successfully

3. **Check browser console** for any errors
4. **Test PDF upload** functionality
5. **Test on mobile devices** for responsiveness

## Performance Optimization

### First Load Optimization
- Models are cached by browser after first download
- Service Worker caches static assets
- CDN delivers content globally

### Expected Performance
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Model Download**: 10-30s (first load only)
- **Analysis Time**: 0.5-2s
- **Subsequent Loads**: <1s

## Troubleshooting

### Models not loading:
- Check that your HuggingFace model paths are correct
- Verify the models are public on HuggingFace
- Check browser console for CORS errors
- Ensure environment variables are set correctly
- Verify internet connection (models download from HuggingFace)

### Build errors:
- Ensure you're using Node.js v18 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check that all dependencies are installed
- Review build logs for specific errors

### Deployment issues:
- Verify your build command and output directory
- Check platform-specific documentation
- Review build logs for errors
- Ensure environment variables are set in the platform dashboard

### Performance issues:
- Ensure you're using quantized models (Xenova models are already quantized)
- Enable caching in your hosting platform
- Check CDN configuration
- Monitor browser console for warnings

### PDF upload not working:
- Ensure PDF.js worker is loading correctly
- Check browser console for worker errors
- Verify PDF contains selectable text (not scanned images)
- Try with a different PDF file

## Recommended Model Setup

### For Production (Current Configuration)

**Semantic Model**: Xenova/all-MiniLM-L6-v2
- Size: ~90MB (quantized)
- Speed: Fast inference (~500ms)
- Accuracy: Good for semantic similarity

**Domain Model**: Xenova/all-MiniLM-L6-v2
- Same as semantic model
- Used for domain compatibility analysis

### Alternative Models

If you need higher accuracy:
- `sentence-transformers/all-mpnet-base-v2` (More accurate, larger, slower)
- Custom fine-tuned models for specific domains

Update your environment variables accordingly.

## Security Considerations

1. **Never commit `.env` files** to your repository (in .gitignore)
2. **Use environment variables** for sensitive configuration
3. **Keep your dependencies updated**: `npm audit` and `npm update`
4. **Enable HTTPS** (most platforms do this automatically)
5. **Review and update** your models regularly
6. **Monitor for security vulnerabilities** in dependencies

## Monitoring and Maintenance

1. **Monitor your site** for uptime and performance
2. **Check build logs** for any issues
3. **Update dependencies** regularly
4. **Review model performance** and update if needed
5. **Keep your deployment platform** updated
6. **Monitor Cloudflare analytics** (if available)

## Cost Analysis

### Cloudflare Pages (Current)
- **Hosting**: Free
- **Bandwidth**: Free (up to 100GB/month)
- **Builds**: Free (up to 500/month)
- **SSL**: Free
- **Total Cost**: $0/month

### Other Platforms
- **Netlify**: Free tier available
- **Vercel**: Free tier available
- **GitHub Pages**: Free
- **Custom VPS**: $5-20/month (not needed)

### Model Costs
- **HuggingFace**: Free for public models
- **Bandwidth**: Included in hosting
- **Total AI Costs**: $0

## Support

For issues specific to:
- **Cloudflare Pages**: [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- **Netlify**: [Netlify Docs](https://docs.netlify.com/)
- **Vercel**: [Vercel Docs](https://vercel.com/docs)
- **GitHub Pages**: [GitHub Pages Docs](https://docs.github.com/en/pages)
- **Transformers.js**: [HuggingFace Docs](https://huggingface.co/docs/transformers.js)

## Next Steps

After deployment:
1. Share your deployed URL
2. Test with real resumes and job descriptions
3. Gather feedback from users
4. Monitor performance and uptime
5. Plan future improvements
6. Consider adding analytics (optional, with privacy considerations)

## Scaling Considerations

This architecture scales automatically:
- **Cloudflare Pages**: Auto-scales globally
- **No backend needed**: All processing is client-side
- **CDN delivery**: Fast worldwide access
- **No database**: No data storage required
- **Unlimited users**: Limited only by CDN bandwidth

---

**Developed by Suryansh Gupta** | AI/ML Internship Project 2025
