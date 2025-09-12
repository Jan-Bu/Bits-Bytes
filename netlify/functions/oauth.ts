import type { Handler, HandlerEvent } from "@netlify/functions";

/** Dopotítá URL webu ze záhlaví (funguje i bez env SITE_URL) */
function getSiteUrl(event: HandlerEvent): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const proto = (event.headers["x-forwarded-proto"] || "https") as string;
  const host = (event.headers["x-forwarded-host"] || event.headers.host || "").toString();
  return `${proto}://${host}`;
}

function html(body: string) {
  return { statusCode: 200, headers: { "Content-Type": "text/html; charset=utf-8" }, body };
}
function json(data: unknown, statusCode = 200, allowOrigin = "*") {
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

export const handler: Handler = async (event) => {
  const SITE_URL = getSiteUrl(event);
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  const path = event.path || "";
  const origin = event.headers.origin || SITE_URL;
  const allowOrigin = origin === "null" ? SITE_URL : origin;

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
      body: "",
    };
  }

  // rychlý debug end-point
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

  // /start → 302 redirect na GitHub OAuth
  if (path.endsWith("/start")) {
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
    const gh =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,user:email`;

    return {
      statusCode: 302,
      headers: { Location: gh },
      body: "",
    };
  }

  // /callback → výměna code→token a poslání do opener okna
  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;

    // Když někdo otevře /callback ručně bez ?code, pošli ho na start
    if (!code) {
      const startUrl = `${SITE_URL}/.netlify/functions/oauth/start`;
      return {
        statusCode: 302,
        headers: { Location: startUrl },
        body: "",
      };
    }

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

  // /token → XHR fallback (nepoužíváme, ale nechávám)
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
    const token = (j as any)?.access_token;
    if (!token) return json(j, 400, allowOrigin);
    return json({ token }, 200, allowOrigin);
  }

  return { statusCode: 404, body: "Not found" };
};
