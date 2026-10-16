import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { comlink } from 'vite-plugin-comlink';

export default defineConfig(({ mode }) => ({
  // Environment variable configuration
  envDir: './',
  envPrefix: 'VITE_',

  plugins: [
    comlink(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    })
  ],
  worker: {
    format: 'es',
    plugins: () => [comlink()]
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        debug: 'debug.html'
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        // Bundle dependencies for offline operation
        manualChunks: {
          'transformers': ['@huggingface/transformers'],
          'pdf-lib': ['pdfjs-dist']
        }
      }
    },
    // Optimize for offline usage
    target: 'es2020',
    cssCodeSplit: false, // Keep CSS in single file
    sourcemap: false, // Reduce build size for production
    minify: 'terser',
    terserOptions: {
      compress: {
        // Keep console logs for debugging in production
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..']
    },
    // Headers for CORS and model loading
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  preview: {
    port: 3000
  },
  // Include AI model files and assets
  assetsInclude: ['**/*.onnx', '**/*.webp', '**/*.json', '**/*.wasm', '**/*.worker.mjs'],
  appType: 'mpa',
  // Optimize dependencies for bundling
  optimizeDeps: {
    include: ['pdfjs-dist', '@huggingface/transformers'],
    exclude: ['onnxruntime-web'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
}));