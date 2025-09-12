import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";

/** Base URL i bez SITE_URL env */
function getSiteUrl(event: HandlerEvent): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const proto = (event.headers["x-forwarded-proto"] || "https") as string;
  const host = (event.headers["x-forwarded-host"] || event.headers.host || "").toString();
  return `${proto}://${host}`;
}

function html(body: string): HandlerResponse {
  return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body };
}
function json(data: unknown, statusCode = 200, allowOrigin = "*"): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(data),
  };
}
function redirect(location: string): HandlerResponse {
  return { statusCode: 302, headers: { Location: location }, body: "" };
}

export const handler: Handler = async (event) => {
  const SITE_URL = getSiteUrl(event);
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  const path = event.path || "";
  const origin = event.headers.origin || SITE_URL;
  const allowOrigin = origin === "null" ? SITE_URL : origin;

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };
    return { statusCode: 204, headers, body: "" };
  }

  // Debug
  if (path.endsWith("/debug")) {
    return json(
      {
        has: {
          SITE_URL: !!SITE_URL,
          GITHUB_CLIENT_ID: !!CLIENT_ID,
          GITHUB_CLIENT_SECRET: !!CLIENT_SECRET,
        },
        siteUrl: SITE_URL,
        path,
      },
      200,
      allowOrigin
    );
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return json({ error: "Missing env: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET" }, 500, allowOrigin);
  }

  // /start → 302 redirect na GitHub
  if (path.endsWith("/start")) {
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
    const gh =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,user:email`;
    return redirect(gh);
  }

  // /callback → vyměň code→token a pošli přesný formát, který Decap očekává
  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;
    if (!code) return redirect(`${SITE_URL}/.netlify/functions/oauth/start`);

    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const j = await r.json();
    const token = (j as any)?.access_token as string | undefined;

    if (!token) {
      return html(`<!doctype html><meta charset="utf-8">
<script>
  (function(){
    var msg = 'authorization:github:error:' + ${JSON.stringify(JSON.stringify(j))};
    if (window.opener) { window.opener.postMessage(msg, '*'); window.close(); }
    else { document.body.textContent = 'OAuth exchange failed.'; }
  })();
</script>`);
    }

    // ➜ jediná zpráva, kterou pošleme (text + JSON s tokenem i providerem)
    const payload = JSON.stringify({ token, provider: "github" });
    return html(`<!doctype html><meta charset="utf-8">
<script>
  (function(){
    var msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
    try { window.opener && window.opener.postMessage(msg, '*'); } catch(e) {}
    window.close();
  })();
</script>`);
  }

  // /token → XHR fallback
  if (path.endsWith("/token")) {
    const body = event.body ? JSON.parse(event.body) : {};
    const code = body?.code;
    if (!code) return json({ error: "Missing code" }, 400, allowOrigin);

    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const j = await r.json();
    const tok = (j as any)?.access_token;
    if (!tok) return json(j, 400, allowOrigin);
    return json({ token: tok }, 200, allowOrigin);
  }

  return { statusCode: 404, body: "Not found" };
};
