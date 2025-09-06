// netlify/edge-functions/proxy.ts
export default async (request: Request) => {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");
  if (!target) return new Response("Missing ?url=", { status: 400 });

  // --- allowlist (jen tvoje domény) ---
  const ALLOW = new Set<string>([
    "pragoline.cz",
    "www.pragoline.cz",
    "hawks-security.cz",
    "www.hawks-security.cz",
    "falafelova.cz",
    "www.falafelova.cz",
    "decorartstudio.netlify.app"
  ]);

  let host: string;
  try { host = new URL(target).host.toLowerCase(); }
  catch { return new Response("Bad url", { status: 400 }); }

  if (!ALLOW.has(host)) return new Response("Domain not allowed", { status: 403 });

  const upstream = await fetch(target, {
    method: "GET",
    headers: {
      "User-Agent": request.headers.get("User-Agent") ?? "Mozilla/5.0",
      "Accept": request.headers.get("Accept") ?? "*/*",
    },
    redirect: "follow",
  });

  const newHeaders = new Headers(upstream.headers);
  newHeaders.delete("x-frame-options");

  const csp = newHeaders.get("content-security-policy");
  if (csp) {
    const parts = csp.split(";").map(s => s.trim());
    let touched = false;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase().startsWith("frame-ancestors")) {
        parts[i] = "frame-ancestors *";
        touched = true;
        break;
      }
    }
    if (!touched) parts.push("frame-ancestors *");
    newHeaders.set("content-security-policy", parts.join("; "));
  } else {
    newHeaders.set("content-security-policy", "frame-ancestors *");
  }

  newHeaders.set("cross-origin-resource-policy", "cross-origin");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: newHeaders,
  });
};

// volitelné; mapping dělá netlify.toml, ale neuškodí:
export const config = { path: "/proxy" };