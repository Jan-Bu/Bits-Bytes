/* netlify/functions/path-proxy.js */

// Path-proxy přes Netlify Functions (Node 18 má fetch builtin).
// Formát cesty: /p/h/<host>/<cokoli>  ->  https://<host>/<cokoli>?<query>
// Odpověď: kopie upstreamu, ale bez X-Frame-Options/CSP. Vracíme base64 pro binárky.

export async function handler(event) {
  try {
    const { path, rawQuery } = event; // např. "/p/h/pragoline.cz/something"
    const seg = path.replace(/^\/p\/?/, "").split("/").filter(Boolean);

    if (seg.length < 2 || seg[0] !== "h") {
      return text(400, "Bad path. Use /p/h/<host>/<path>");
    }

    const host = seg[1];
    const restPath = "/" + seg.slice(2).join("/");

    // --- whitelist hostů ---
    const ALLOW = new Set([
      "pragoline.cz", "www.pragoline.cz",
      "hawks-security.com", "www.hawks-security.com",
      "decorartstudio.netlify.app",
      "falafe-lova.cz", "www.falafe-lova.cz",
    ]);
    if (!ALLOW.has(host)) {
      return text(403, "Domain not allowed");
    }

    const target = new URL("https://" + host + restPath + (rawQuery ? "?" + rawQuery : ""));

    // Připrav forward hlaviček (jen bezpečné)
    const fHeaders = new Headers();
    const copyIn = (name) => {
      const v = event.headers?.[name.toLowerCase()];
      if (v) fHeaders.set(name, v);
    };
    copyIn("accept");
    copyIn("accept-language");
    copyIn("user-agent");

    const init = { method: event.httpMethod, headers: fHeaders, redirect: "follow" };

    // tělo jen u vhodných metod
    if (["POST", "PUT", "PATCH"].includes(event.httpMethod)) {
      init.body = event.body && event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
      const ct = event.headers?.["content-type"];
      if (ct) fHeaders.set("content-type", ct);
    }

    const upstream = await fetch(target, init);

    // hlavičky z upstreamu
    const outHeaders = {};
    upstream.headers.forEach((val, key) => { outHeaders[key] = val; });

    // zahoď XFO/CSP
    delete outHeaders["x-frame-options"];
    delete outHeaders["content-security-policy"];
    outHeaders["cache-control"] = "no-store";

    // tělo jako ArrayBuffer -> base64 (bezpečné i pro binárky)
    const ab = await upstream.arrayBuffer();
    const buf = Buffer.from(ab);
    const isText = /^text\/|\/json$|\/javascript$|\/xml$|\/svg\+xml$/.test(outHeaders["content-type"] || "");

    return {
      statusCode: upstream.status,
      headers: outHeaders,
      body: buf.toString(isText ? "utf8" : "base64"),
      isBase64Encoded: !isText,
    };
  } catch (err) {
    return text(502, "Proxy error: " + (err && err.message ? err.message : String(err)));
  }
}

function text(code, msg) {
  return {
    statusCode: code,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    body: msg,
    isBase64Encoded: false,
  };
}