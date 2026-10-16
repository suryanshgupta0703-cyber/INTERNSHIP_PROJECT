/**
 * Cloudflare Worker Proxy for HuggingFace Models
 * This worker proxies requests to HuggingFace to bypass CORS restrictions
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Check if this is a model proxy request
    if (url.pathname.startsWith('/proxy/hf/')) {
      // Extract the HuggingFace path
      const hfPath = url.pathname.replace('/proxy/hf/', '');

      // Construct the HuggingFace URL
      const hfUrl = `https://huggingface.co/${hfPath}${url.search}`;

      // Create a new request to HuggingFace
      const hfRequest = new Request(hfUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ATSResumeAnalyzer/1.0)',
          // Forward the original headers except host
          ...Object.fromEntries(
            request.headers.entries()
              .filter(([key]) => key.toLowerCase() !== 'host')
          )
        },
        body: request.body
      });

      try {
        const response = await fetch(hfRequest);

        // Clone the response and add CORS headers
        const corsResponse = new Response(response.body, response);
        corsResponse.headers.set('Access-Control-Allow-Origin', '*');
        corsResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        corsResponse.headers.set('Access-Control-Allow-Headers', '*');
        corsResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return corsResponse;
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch from HuggingFace' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    // For all other requests, fetch from the original site
    return fetch(request);
  }
};
