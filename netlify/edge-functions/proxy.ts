// @ts-nocheck
// deno-lint-ignore-file

// Path-proxy pro Netlify Edge.
// /p/h/<host>/<cokoliv>  ->  https://<host>/<cokoliv>?<query>
export default async function handler(request, _context) {
  try {
    const reqUrl = new URL(request.url);             // https://tvoje-domena/p/h/host/...
    const path = reqUrl.pathname.replace(/^\/p\/?/, '');
    const seg = path.split('/').filter(Boolean);     // ["h", "<host>", ...zbytek]

    if (seg.length < 2 || seg[0] !== 'h') {
      return new Response('Bad path. Use /p/h/<host>/<path>', { status: 400 });
    }

    const host = seg[1];
    const restPath = '/' + seg.slice(2).join('/');   // "/","/index.html","/css/app.css", ...

    // povol jen hosty, které chceš vkládat
    const ALLOW = new Set([
      'pragoline.cz', 'www.pragoline.cz',
      'hawks-security.com', 'www.hawks-security.com',
      'decorartstudio.netlify.app',
      'falafe-lova.cz', 'www.falafe-lova.cz',
    ]);
    if (!ALLOW.has(host)) {
      return new Response('Domain not allowed', { status: 403 });
    }

    // cílová adresa
    const target = new URL('https://' + host + restPath + reqUrl.search);

    // připrav forwarding (bez přísných TS typů)
    const fHeaders = new Headers();
    // přepošli pár bezpečných hlaviček
    const src = request.headers;
    const copy = (name) => { const v = src.get(name); if (v) fHeaders.set(name, v); };
    copy('accept'); copy('accept-language'); copy('user-agent');
    const init = { method: request.method, headers: fHeaders, redirect: 'follow' };

    // tělo jen když je
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      init.body = request.body;
      const ct = src.get('content-type');
      if (ct) fHeaders.set('content-type', ct);
    }

    const upstream = await fetch(target.href, init);

    // zahoď hlavičky blokující <iframe>
    const out = new Headers(upstream.headers);
    out.delete('x-frame-options');
    out.delete('content-security-policy');
    out.set('cache-control', 'no-store');

    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (err) {
    return new Response('Proxy error: ' + (err?.message ?? String(err)), { status: 502 });
  }
}
