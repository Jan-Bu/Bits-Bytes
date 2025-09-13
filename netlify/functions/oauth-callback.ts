import type { Handler, HandlerEvent } from "@netlify/functions";

function getBaseUrl() {
  const env = process.env.SITE_URL;
  if (!env) throw new Error("Missing SITE_URL env var");
  return env.replace(/\/+$/, "");
}

async function exchangeCodeForToken(event: HandlerEvent) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET");

  const params = new URLSearchParams(event.queryStringParameters as any);
  const code = params.get("code");
  if (!code) throw new Error("Missing ?code");

  const redirect_uri = `${getBaseUrl()}/.netlify/functions/oauth-callback`;

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status} ${await res.text()}`);

  const data = await res.json() as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) throw new Error(`No access_token: ${data.error || "unknown"} ${data.error_description || ""}`);
  return data.access_token;
}

export const handler: Handler = async (event) => {
  try {
    const token = await exchangeCodeForToken(event);
    const html = `<!doctype html><meta charset="utf-8">
<title>Signing in…</title>
<style>
  html,body{background:#111;color:#eee;font:14px/1.4 system-ui;margin:0;padding:2rem}
  .box{max-width:520px}
  code{background:#222;padding:2px 6px;border-radius:4px}
</style>
<div class="box">
  <h1>Signing in…</h1>
  <p>Closing this window in a moment.</p>
  <p>If it doesn't close, you can close it manually.</p>
</div>
<script>
(function () {
  var t = ${JSON.stringify(token)};
  try { window.opener && window.opener.postMessage({ token: t }, "*"); } catch(e) {}
  try { window.opener && window.opener.postMessage("authorization:github:token:" + t, "*"); } catch(e) {}

  // fallback bridge přes localStorage (parent si to vyzvedne)
  try { localStorage.setItem("decap:bridge:github_token", t); } catch(e) {}

  // malá prodleva, ať se zprávy doručí
  setTimeout(function(){ window.close(); }, 600);
})();
</script>`;
    return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: html };
  } catch (err: any) {
    return { statusCode: 500, body: `OAuth error: ${err?.message || String(err)}` };
  }
};
