import { Handler, HandlerEvent } from "@netlify/functions";

const SITE_URL = process.env.SITE_URL;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

function html(body: string) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body,
  };
}

function json(data: unknown, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SITE_URL || "*",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(data),
  };
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (!SITE_URL || !CLIENT_ID || !CLIENT_SECRET) {
    return json({ error: "Missing env: SITE_URL / GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET" }, 500);
  }

  const path = event.path || "";
  const origin = event.headers?.origin || "";
  const isSameOrigin = origin === SITE_URL;

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": SITE_URL,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
      body: "",
    };
  }

  // /start → redirect na GitHub
  if (path.endsWith("/start")) {
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
    const gh =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,user:email`;
    return html(`<!doctype html><meta charset="utf-8"><script>location.replace(${JSON.stringify(gh)});</script>`);
  }

  // /callback → výměna code→token, pošli token zpět do CMS okna
  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;
    if (!code) return html("Missing ?code");

    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });

    const j = await r.json();
    const token = (j as any)?.access_token as string | undefined;
    if (!token) return html(`OAuth exchange failed: ${JSON.stringify(j)}`);

    return html(`<!doctype html><meta charset="utf-8">
<script>
  (function(){
    var token=${JSON.stringify(token)};
    if (window.opener) {
      window.opener.postMessage({ type: "github_token", token }, ${JSON.stringify(SITE_URL)});
      window.close();
    } else {
      document.body.textContent = "GitHub token obtained. You can close this window.";
    }
  })();
</script>`);
  }

  // /token → XHR fallback
  if (path.endsWith("/token")) {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const code = body?.code;
      if (!code) return json({ error: "Missing code" }, 400);

      const r = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
      });
      const j = await r.json();
      const token = (j as any)?.access_token;
      if (!token) return json(j, 400);
      return json({ token });
    } catch (e) {
      return json({ error: String(e) }, 500);
    }
  }

  return { statusCode: 404, body: "Not found" };
};
