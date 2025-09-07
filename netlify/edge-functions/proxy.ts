// @ts-nocheck
// deno-lint-ignore-file

// Path-proxy pro Netlify Edge:
//   /p/h/<host>/<cokoliv>  ->  https://<host>/<cokoliv>?<query>
// HTML odpovědi lehce přepíšeme:
//   - odkazy/formy/meta-refresh přes proxy
//   - assety (link/script/img/…) na absolutní https://<host>/…

// (globální) HTMLRewriter je v Edge runtime k dispozici
declare const HTMLRewriter: any;

function absUrl(baseOrigin, value) {
  if (!value) return null;
  try {
    return new URL(value, baseOrigin).href; // vyřeší i "./", "../" i "/…"
  } catch {
    return null;
  }
}
function proxyPathFromAbs(abs) {
  try {
    const u = new URL(abs);
    return `/p/h/${u.hostname}${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

export default async function handler(request, _context) {
  try {
    const reqUrl = new URL(request.url);                 // https://tvoje-domena/p/h/<host>/...
    const path = reqUrl.pathname.replace(/^\/p\/?/, '');
    const seg = path.split('/').filter(Boolean);         // ["h", "<host>", ...]
    if (seg.length < 2 || seg[0] !== 'h') {
      return new Response('Bad path. Use /p/h/<host>/<path>', { status: 400 });
    }

    const host = seg[1];
    const restPath = '/' + seg.slice(2).join('/');       // "/…", případně "/"
    const targetHtmlOrigin = `https://${host}`;

    // povolené domény (doplnit dle potřeby)
    const ALLOW = new Set([
      'pragoline.cz', 'www.pragoline.cz',
      'hawks-security.com', 'www.hawks-security.com',
      'decorartstudio.netlify.app',
      'falafe-lova.cz', 'www.falafe-lova.cz',
    ]);
    if (!ALLOW.has(host)) return new Response('Domain not allowed', { status: 403 });

    // připrav forward
    const fHeaders = new Headers();
    const src = request.headers;
    const copy = (n) => { const v = src.get(n); if (v) fHeaders.set(n, v); };
    copy('accept'); copy('accept-language'); copy('user-agent');
    const init = { method: request.method, headers: fHeaders, redirect: 'follow' };

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      init.body = request.body;
      const ct = src.get('content-type'); if (ct) fHeaders.set('content-type', ct);
    }

    const targetUrl = new URL(targetHtmlOrigin + restPath + reqUrl.search);
    const upstream = await fetch(targetUrl.href, init);

    // odstraň hlavičky, které brání iframu
    const out = new Headers(upstream.headers);
    out.delete('x-frame-options');
    out.delete('content-security-policy');
    out.set('cache-control', 'no-store');

    const ctype = (out.get('content-type') || '').toLowerCase();

    // Ne-HTML: jen pošli dál (JS/CSS/obrázky/fonty…)
    if (!ctype.includes('text/html')) {
      return new Response(upstream.body, { status: upstream.status, headers: out });
    }

    // HTML: přepišme klíčové atributy
    const rewriter = new HTMLRewriter()
      // ODKAZY -> přes proxy
      .on('a[href]', {
        element(e) {
          const href = e.getAttribute('href');
          const abs = absUrl(targetHtmlOrigin, href);
          const prox = abs ? proxyPathFromAbs(abs) : null;
          if (prox) e.setAttribute('href', prox);
        }
      })
      .on('form[action]', {
        element(e) {
          const act = e.getAttribute('action');
          const abs = absUrl(targetHtmlOrigin, act);
          const prox = abs ? proxyPathFromAbs(abs) : null;
          if (prox) e.setAttribute('action', prox);
        }
      })
      .on('meta[http-equiv="refresh"][content]', {
        element(e) {
          const content = e.getAttribute('content') || '';
          const m = content.match(/^[^;]*;\s*url\s*=\s*(.+)$/i);
          if (m) {
            const abs = absUrl(targetHtmlOrigin, m[1].trim());
            const prox = abs ? proxyPathFromAbs(abs) : null;
            if (prox) e.setAttribute('content', `0; url=${prox}`);
          }
        }
      })
      // ASSETY -> absolutní https://<host>/…
      .on('link[href]', {
        element(e) {
          const href = e.getAttribute('href');
          const abs = absUrl(targetHtmlOrigin, href);
          if (abs) e.setAttribute('href', abs);
        }
      })
      .on('script[src]', {
        element(e) {
          const src = e.getAttribute('src');
          const abs = absUrl(targetHtmlOrigin, src);
          if (abs) e.setAttribute('src', abs);
        }
      })
      .on('img[src], source[src], iframe[src], audio[src], video[src]', {
        element(e) {
          const src = e.getAttribute('src');
          const abs = absUrl(targetHtmlOrigin, src);
          if (abs) e.setAttribute('src', abs);
        }
      });

    const transformed = rewriter.transform(upstream);
    return new Response(transformed.body, { status: upstream.status, headers: out });

  } catch (err) {
    return new Response('Proxy error: ' + (err?.message ?? String(err)), { status: 502 });
  }
}
