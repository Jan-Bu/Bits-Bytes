// netlify/functions/oauth.js
// Minimal GitHub OAuth bridge for Decap CMS (GitHub backend)
// No deps; uses built-in fetch (Node 18+ on Netlify)

const siteURL =
  process.env.URL || "https://bits-bytes.netlify.app"; // fallback pro lokál/preview
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

exports.handler = async (event) => {
  const path = event.path || "";
  try {
    if (path.endsWith("/authorize")) {
      // 1) Redirect na GitHub OAuth
      const redirectUri = `${siteURL}/.netlify/functions/oauth/callback`;
      const url =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${encodeURIComponent(CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=repo,user:email`;
      return {
        statusCode: 302,
        headers: { Location: url },
        body: "",
      };
    }

    if (path.endsWith("/callback")) {
      // 2) GitHub -> vrátil code, vyměníme za access_token
      const code = event.queryStringParameters?.code;
      if (!code) return { statusCode: 400, body: "Missing code" };

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
          }),
        }
      );
      const data = await tokenRes.json();
      if (data.error || !data.access_token) {
        return {
          statusCode: 401,
          body: `OAuth error: ${data.error_description || "no token"}`,
        };
      }

      // 3) Vrátíme malou HTML stránku, která pošle token do CMS okna
      const html = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function send() {
          // Formát, který Decap očekává:
          window.opener.postMessage('authorization:github:success:${data.access_token}', '*');
          window.close();
        }
        // některé prohlížeče vyžadují tick
        setTimeout(send, 0);
      })();
    </script>
  </body>
</html>`;
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: html,
      };
    }

    return { statusCode: 404, body: "Not found" };
  } catch (e) {
    return { statusCode: 500, body: `OAuth exception: ${e.message}` };
  }
};
