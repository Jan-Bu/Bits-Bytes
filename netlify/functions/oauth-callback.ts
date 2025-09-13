import type { Handler, HandlerEvent } from "@netlify/functions";

async function exchangeCodeForToken(event: HandlerEvent) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET env vars");
  }
  const params = new URLSearchParams(event.queryStringParameters as any);
  const code = params.get("code");
  if (!code) throw new Error("Missing ?code");

  const redirectUri = (() => {
    const proto = (event.headers["x-forwarded-proto"] || "https") as string;
    const host = (event.headers["x-forwarded-host"] || event.headers.host || "").toString();
    return `${proto}://${host}/.netlify/functions/oauth-callback`;
  })();

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub token exchange failed: ${res.status} ${text}`);
  }
  const data = await res.json() as { access_token?: string; error?: string; error_description?: string };
  if (!data.access_token) {
    throw new Error(`No access_token: ${data.error || "unknown"} ${data.error_description || ""}`);
  }
  return data.access_token;
}

export const handler: Handler = async (event) => {
  try {
    const token = await exchangeCodeForToken(event);

    // Malé HTML, které pošle token zpět do CMS (popup → parent) a zavře okno.
    const html = `<!doctype html>
<meta charset="utf-8">
<script>
  (function () {
    function send(msg) {
      try { window.opener && window.opener.postMessage(msg, window.location.origin); }
      catch (e) {}
      window.close();
    }
    send({ token: ${JSON.stringify(token)} });
  })();
</script>`;
    return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body: html };
  } catch (err: any) {
    return { statusCode: 500, body: `OAuth error: ${err?.message || String(err)}` };
  }
};
