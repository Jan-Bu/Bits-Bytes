// netlify/functions/oauth-authorize.ts
import type { Handler, HandlerEvent } from "@netlify/functions";

function getBaseUrl() {
  const env = process.env.SITE_URL;
  if (!env) throw new Error("Missing SITE_URL env var");
  return env.replace(/\/+$/, "");
}

export const handler: Handler = async (event: HandlerEvent) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return { statusCode: 500, body: "Missing GITHUB_CLIENT_ID env var" };

  const redirectUri = `${getBaseUrl()}/.netlify/functions/oauth-callback`;
  const scope = "repo,user:email";

  // ✅ převezmeme state od Decap CMS
  const state = event.queryStringParameters?.state || "";

  const gh =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    (state ? `&state=${encodeURIComponent(state)}` : "");

  return { statusCode: 302, headers: { Location: gh }, body: "" };
};
