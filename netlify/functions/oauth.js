import type { Handler } from "@netlify/functions";

const SITE_URL = process.env.SITE_URL!;
const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;

function html(body: string) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body,
  };
}
function json(data: any, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SITE_URL,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(data),
  };
}

export const handler: Handler = async (event) => {
  const path = event.path || "";
  const origin = event.headers.origin || "";
  const isCms = origin === SITE_URL;

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

  // 1) /start → přesměruj uživatele na GitHub OAuth
  if (path.endsWith("/start")) {
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,user:email`;
    return html(`<!doctype html><meta charset="utf-8">
<script>location.replace(${JSON.stringify(url)});</script>`);
  }

  // 2) /callback → vyměň "code" za access_token a vrať ho Decap CMS
  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;
    if (!code) return html("Missing ?code");

    // výměna code → token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) {
      return html(`OAuth exchange failed: ${JSON.stringify(tokenJson)}`);
    }
    const token = tokenJson.access_token as string;

    // Decap CMS očekává JSON odpověď při volání přes "auth_endpoint"
    // Ale když se user vrací v prohlížeči, uděláme malou stránku,
    // která token pošle zpět do opener okna (CMS) a zavře se.
    return html(`<!doctype html><meta charset="utf-8">
<script>
  (function(){
    var token = ${JSON.stringify(token)};
    // Počítejme s tím, že stránku otevřel CMS v popupu:
    if (window.opener) {
      window.opener.postMessage({ type: "github_token", token }, ${JSON.stringify(SITE_URL)});
      window.close();
    } else {
      document.body.textContent = "GitHub token získán. Můžeš zavřít okno.";
    }
  })();
</script>`);
  }

  // 3) /token → pouze pokud by CMS volal token přes XHR (fallback)
  if (path.endsWith("/token")) {
    // Sem by se posílal "code" v body → výměna stejně jako výše
    const body = event.body ? JSON.parse(event.body) : {};
    const code = body.code;
    if (!code) return json({ error: "Missing code" }, 400);

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenJson.access_token) return json(tokenJson, 400);
    return json({ token: tokenJson.access_token });
  }

  return { statusCode: 404, body: "Not found" };
};
