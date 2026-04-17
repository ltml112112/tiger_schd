// Cloudflare Pages Function: same-domain CORS proxy
// Deployed automatically to https://<your-site>.pages.dev/api/proxy
// Usage: /api/proxy?url=<encoded_target_url>
//
// Whitelists specific hosts to prevent abuse.

const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'm.stock.naver.com',
  'api.upbit.com',
  'open.er-api.com',
];

const CACHE_TTL = 5; // seconds — real-time but avoid hammering upstream

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const target = url.searchParams.get('url');

  if (!target) {
    return json({ error: 'missing url param' }, 400);
  }

  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch {
    return json({ error: 'invalid url' }, 400);
  }

  if (!ALLOWED_HOSTS.some(h => targetUrl.hostname === h)) {
    return json({ error: `host not allowed: ${targetUrl.hostname}` }, 403);
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TigerETF/1.0)',
        'Accept': 'application/json,text/plain,*/*',
      },
      cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });
  } catch (e) {
    return json({ error: 'upstream fetch failed', detail: String(e) }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
