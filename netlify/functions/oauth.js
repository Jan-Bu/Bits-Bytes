// netlify/functions/oauth.js
// GitHub OAuth bridge for Decap CMS

const SITE_URL = process.env.URL || "https://bits-bytes.netlify.app";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

exports.handler = async (event) => {
  const path = event.path || "";

  // 1) Start OAuth – pošleme JS redirect na GitHub autorizaci
  if (path.endsWith("/authorize")) {
    const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
    const gh =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=repo,user:email`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<!doctype html><meta charset="utf-8">
<script>location.replace(${JSON.stringify(gh)});</script>`,
    };
  }

  // 2) Callback – vyměníme code -> access_token a pošleme ho zpět do /admin
  if (path.endsWith("/callback")) {
    const code = event.queryStringParameters?.code;
    if (!code) return { statusCode: 400, body: "Missing code" };

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
      const payloadErr =
        "authorization:github:error:" +
        JSON.stringify({ error: data.error_description || "no token" });

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: `<!doctype html><meta charset="utf-8">
<script>
  try { window.opener && window.opener.postMessage(${JSON.stringify(payloadErr)}, "*"); } catch(e) {}
  window.close();
</script>`,
      };
    }

    // ⬇️ Pošleme obě varianty (plain i JSON), aby si to Decap vždy převzal
    const payloadPlain =
      "authorization:github:success:" + data.access_token;
    const payloadJson =
      "authorization:github:success:" + JSON.stringify({ token: data.access_token });

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<!doctype html><meta charset="utf-8">
<script>
  try { window.opener && window.opener.postMessage(${JSON.stringify(payloadPlain)}, "*"); } catch(e) {}
  try { window.opener && window.opener.postMessage(${JSON.stringify(payloadJson)}, "*"); } catch(e) {}
  window.close();
</script>`,
    };
  }

  return { statusCode: 404, body: "Not found" };
};
