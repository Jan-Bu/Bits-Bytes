// Netlify Edge Function – reverse proxy s přepisem odkazů pro iframe embed

// TS nezná globální HTMLRewriter (je až v Deno runtime) → deklarace:
declare var HTMLRewriter: any;

// util: relativní → absolutní URL
function absolutize(base: URL, href: string | null): string | null {
  if (!href) return null;
  try { return new URL(href, base).href; } catch { return null; }
}

// util: přepis srcset (více URL)
function mapSrcSet(base: URL, srcset: string | null): string | null {
  if (!srcset) return null;
  const parts = srcset.split(',').map(p => p.trim());
  const mapped = parts.map(p => {
    const [url, descriptor] = p.split(/\s+/, 2);
    const abs = absolutize(base, url);
    if (!abs) return p;
    return `/proxy?url=${encodeURIComponent(abs)}${descriptor ? ' ' + descriptor : ''}`;
  });
  return mapped.join(', ');
}

// hlavní handler – není potřeba nic importovat
export const handler = async (event: any): Promise<Response> => {
  const reqUrl = new URL(event.request.url);
  const targetRaw = reqUrl.searchParams.get('url');
  if (!targetRaw) return new Response('Missing ?url=', { status: 400 });

  let target: URL;
  try { target = new URL(targetRaw); }
  catch { return new Response('Bad url', { status: 400 }); }

  // povolené domény
  const ALLOW = new Set([
    'pragoline.cz', 'www.pragoline.cz',
    'hawks-security.com', 'www.hawks-security.com',
  ]);
  if (!ALLOW.has(target.hostname)) {
    return new Response('Domain not allowed', { status: 403 });
  }

  // předání metody/hlaviček/těla
  const init: RequestInit = {
    method: event.request.method,
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': '*/*',
      'Accept-Language': event.request.headers.get('Accept-Language') ?? 'cs,en;q=0.8',
    }
  };
  const m = event.request.method;
  if (m === 'POST' || m === 'PUT' || m === 'PATCH') {
    (init as any).body = event.request.body;
    const ct = event.request.headers.get('Content-Type');
    if (ct) (init.headers as any)['Content-Type'] = ct;
  }

  const upstream = await fetch(target.href, { ...init, redirect: 'follow' });

  // strhni hlavičky, které brání iframu
  const headers = new Headers(upstream.headers);
  headers.delete('x-frame-options');
  headers.delete('content-security-policy');
  headers.set('cache-control', 'no-store');

  const ct = headers.get('content-type') || '';

  // ne-HTML obsah jen pošli dál
  if (!ct.includes('text/html')) {
    return new Response(upstream.body, { status: upstream.status, headers });
  }

  // HTML → přepis URL na /proxy
  const base = target;
  const rewriter = new HTMLRewriter()
    .on('a[href]', {
      element(e: any) {
        const abs = absolutize(base, e.getAttribute('href'));
        if (abs) e.setAttribute('href', `/proxy?url=${encodeURIComponent(abs)}`);
      }
    })
    .on('[src]', {
      element(e: any) {
        const abs = absolutize(base, e.getAttribute('src'));
        if (abs) e.setAttribute('src', `/proxy?url=${encodeURIComponent(abs)}`);
      }
    })
    .on('link[href]', {
      element(e: any) {
        const abs = absolutize(base, e.getAttribute('href'));
        if (abs) e.setAttribute('href', `/proxy?url=${encodeURIComponent(abs)}`);
      }
    })
    .on('img[srcset], source[srcset]', {
      element(e: any) {
        const mapped = mapSrcSet(base, e.getAttribute('srcset'));
        if (mapped) e.setAttribute('srcset', mapped);
      }
    })
    .on('form[action]', {
      element(e: any) {
        const abs = absolutize(base, e.getAttribute('action'));
        if (abs) e.setAttribute('action', `/proxy?url=${encodeURIComponent(abs)}`);
      }
    })
    .on('meta[http-equiv="refresh"][content]', {
      element(e: any) {
        const content = e.getAttribute('content')!;
        const m = content.match(/^[^;]*;\s*url\s*=\s*(.+)$/i);
        if (m) {
          const abs = absolutize(base, m[1].trim());
          if (abs) e.setAttribute('content', `0; url=/proxy?url=${encodeURIComponent(abs)}`);
        }
      }
    })
    .on('head', {
      element(e: any) {
        e.append(
          `<base href="${base.origin}/">` +
          `<script>(function(){if('serviceWorker'in navigator){try{navigator.serviceWorker.register=function(){return Promise.resolve({});}}catch(e){}}})();</script>`,
          { html: true }
        );
      }
    });

  const transformed = rewriter.transform(upstream);
  return new Response(transformed.body, { status: upstream.status, headers });
};
