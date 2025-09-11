// netlify/functions/oauth.js
// GitHub OAuth bridge for Decap CMS (minimal + robust)

const SITE_URL = "https://bits-bytes.netlify.app"; // drž stejné jako u OAuth App

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

exports.handler = async (event) => {
  const path = event.path || "";

  try {
    if (path.endsWith("/authorize")) {
      // Přesměrujeme pomocí JS (některým setupům nesedí 302)
      const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
      const ghUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${encodeURIComponent(CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=repo,user:email`;

      const html = `<!doctype html><meta charset="utf-8">
<script>location.replace(${JSON.stringify(ghUrl)});</script>`;
      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

    if (path.endsWith("/callback")) {
      const code = event.queryStringParameters?.code;
      if (!code) return { statusCode: 400, body: "Missing code" };

      // Node 18 má fetch nativně
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      });
      const data = await res.json();
      if (!data.access_token) {
        const err = `OAuth error: ${data.error_description || "no token"}`;
        const payloadErr = `authorization:github:error:${JSON.stringify({ error: err })}`;
        const htmlErr = `<!doctype html><meta charset="utf-8">
<script>
  try { window.opener.postMessage(${JSON.stringify(payloadErr)}, ${JSON.stringify(SITE_URL)}); } catch(e) {}
  window.close();
</script>`;
        return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: htmlErr };
      }

      // Decap očekává přesně: 'authorization:github:success:' + JSON.stringify({ token: '...' })
      const payloadOk = `authorization:github:success:${JSON.stringify({ token: data.access_token })}`;
      const htmlOk = `<!doctype html><meta charset="utf-8">
<script>
  try { window.opener.postMessage(${JSON.stringify(payloadOk)}, ${JSON.stringify(SITE_URL)}); } catch(e) {
    // fallback – méně přísný origin
    try { window.opener && window.opener.postMessage(${JSON.stringify(payloadOk)}, "*"); } catch(e2) {}
  }
  window.close();
</script>`;
      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: htmlOk };
    }

    return { statusCode: 404, body: "Not found" };
  } catch (e) {
    return { statusCode: 500, body: `OAuth exception: ${e.message}` };
  }
};
