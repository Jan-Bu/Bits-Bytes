// @ts-nocheck
// deno-lint-ignore-file

// Minimal reverse proxy pro Netlify Edge – bez HTMLRewriteru
export default async function handler(request, _context) {
  try {
    const reqUrl = new URL(request.url);
    const targetRaw = reqUrl.searchParams.get('url');
    if (!targetRaw) return new Response('Missing ?url=', { status: 400 });

    let target;
    try { target = new URL(targetRaw); }
    catch { return new Response('Bad url', { status: 400 }); }

    // Povolené domény
    const ALLOW = new Set([
      'pragoline.cz', 'www.pragoline.cz',
      'hawks-security.com', 'www.hawks-security.com',
    ]);
    if (!ALLOW.has(target.hostname)) {
      return new Response('Domain not allowed', { status: 403 });
    }

    // Forward hlaviček
    const headers = {
      'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
      'Accept': request.headers.get('Accept') || '*/*',
      'Accept-Language': request.headers.get('Accept-Language') || 'cs,en;q=0.8',
    };
    const init = { method: request.method, headers, redirect: 'follow' };

    // Tělo jen pro metody s payloadem
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      init.body = request.body;
      const ct = request.headers.get('Content-Type');
      if (ct) init.headers['Content-Type'] = ct;
    }

    const upstream = await fetch(target.href, init);

    // Zahoď hlavičky blokující <iframe>
    const out = new Headers(upstream.headers);
    out.delete('x-frame-options');
    out.delete('content-security-policy');
    out.set('cache-control', 'no-store');

    return new Response(upstream.body, {
      status: upstream.status,
      headers: out,
    });
  } catch (err) {
    return new Response('Proxy error: ' + (err && err.message ? err.message : String(err)), { status: 502 });
  }
}
