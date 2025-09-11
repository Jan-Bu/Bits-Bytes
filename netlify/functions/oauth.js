// netlify/functions/oauth.js
// GitHub OAuth bridge for Decap CMS

const SITE_URL = "https://bits-bytes.netlify.app"; // držme jeden pevný origin

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

exports.handler = async (event) => {
  const path = event.path || "";

  try {
    if (path.endsWith("/authorize")) {
      // 1) Redirect na GitHub
      const redirectUri = `${SITE_URL}/.netlify/functions/oauth/callback`;
      const url =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${encodeURIComponent(CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=repo,user:email`;
      return { statusCode: 302, headers: { Location: url }, body: "" };
    }

    if (path.endsWith("/callback")) {
      // 2) Výměna code -> access_token
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
        return {
          statusCode: 401,
          body: `OAuth error: ${data.error_description || "no token"}`,
        };
      }

      // 3) Pošli token zpět do okna /admin PŘESNĚ tak, jak Decap očekává
      //    – zpráva: 'authorization:github:success:' + JSON.stringify({ token: '...' })
      //    – origin: stejné jako /admin, tj. SITE_URL
      const payload = `authorization:github:success:${JSON.stringify({
        token: data.access_token,
      })}`;

      const html = `<!doctype html>
<html><body><script>
  (function(){
    try {
      window.opener.postMessage(${JSON.stringify(payload)}, ${JSON.stringify(SITE_URL)});
    } catch(e) {
      // fallback (méně přísný origin) – kdybychom byli na jiné doméně
      window.opener && window.opener.postMessage(${JSON.stringify(payload)}, "*");
    }
    window.close();
  })();
</script></body></html>`;

      return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

    return { statusCode: 404, body: "Not found" };
  } catch (e) {
    return { statusCode: 500, body: `OAuth exception: ${e.message}` };
  }
};
