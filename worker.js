/**
 * Cloudflare Worker: serve the static app and proxy Hugging Face model files.
 *
 * Browsers (and this app's service worker) cannot reliably fetch
 * huggingface.co from a workers.dev origin because Hub responses often omit
 * CORS headers. Same-origin /models-proxy/* avoids that entirely.
 */

const HF_ORIGIN = 'https://huggingface.co';
const PROXY_PREFIX = '/models-proxy/';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(PROXY_PREFIX)) {
      return proxyHuggingFace(request, url);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function proxyHuggingFace(request, url) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  const hfPath = url.pathname.slice(PROXY_PREFIX.length);
  if (!hfPath || hfPath.includes('..')) {
    return new Response('Invalid model path', { status: 400, headers: CORS_HEADERS });
  }

  const target = `${HF_ORIGIN}/${hfPath}${url.search}`;
  const upstreamHeaders = new Headers();
  const range = request.headers.get('Range');
  if (range) {
    upstreamHeaders.set('Range', range);
  }
  upstreamHeaders.set(
    'User-Agent',
    'Mozilla/5.0 (compatible; ATS-Analyzer/1.0; +https://huggingface.co)'
  );
  upstreamHeaders.set('Accept', request.headers.get('Accept') || '*/*');

  const upstream = await fetch(target, {
    method: request.method,
    headers: upstreamHeaders,
    redirect: 'follow',
    cf: {
      cacheTtl: 604800,
      cacheEverything: true,
    },
  });

  const headers = new Headers(upstream.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  headers.set('Cache-Control', 'public, max-age=604800, immutable');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
