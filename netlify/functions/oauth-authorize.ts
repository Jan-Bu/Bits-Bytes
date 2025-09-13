import type { Handler, HandlerEvent } from "@netlify/functions";

/** Vypočítá základní URL webu ze záhlaví (funguje i bez env SITE_URL) */
function getSiteUrl(event: HandlerEvent): string {
  const envUrl = process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const proto = (event.headers["x-forwarded-proto"] || "https") as string;
  const host = (event.headers["x-forwarded-host"] || event.headers.host || "").toString();
  return `${proto}://${host}`;
}

export const handler: Handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 500, body: "Missing GITHUB_CLIENT_ID env var" };
  }
  const redirectUri = `${getSiteUrl(event)}/.netlify/functions/oauth-callback`;
  const scope = "repo,user:email";

  const gh = `https://github.com/login/oauth/authorize` +
             `?client_id=${encodeURIComponent(clientId)}` +
             `&redirect_uri=${encodeURIComponent(redirectUri)}` +
             `&scope=${encodeURIComponent(scope)}`;

  return {
    statusCode: 302,
    headers: { Location: gh },
    body: "",
  };
};
