/**
 * Cloudflare Worker: proxies Stocktwits public trending JSON with CORS for static sites.
 * Deploy: from this directory, `npx wrangler deploy`
 * No API keys. Paste the workers.dev URL into STOCKTWITS_TRENDING_PROXY_URL in index.html.
 */
const UPSTREAM = 'https://api.stocktwits.com/api/2/trending/symbols.json';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request) {
    const ch = corsHeaders();
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: ch });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: ch });
    }
    const upstream = await fetch(UPSTREAM, {
      headers: { Accept: 'application/json' },
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...ch,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=120',
      },
    });
  },
};
