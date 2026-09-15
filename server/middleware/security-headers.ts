/**
 * Safe headers only. MUST NOT set X-Frame-Options or CSP frame-ancestors:
 * the live preview is an iframe on grok.com.
 *
 * Published hosts get index,follow. Do not noindex mountainstone.grok.me.
 */
const CANONICAL_HOST = "mountainstone.grok.me";
const ALIAS_HOSTS = new Set(["shanshizhi.grok.me", "www.mountainstone.grok.me"]);

const BASE: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function hostnameOf(raw: string): string {
  return String(raw || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

function hostFrom(event: unknown): string {
  const e = event as {
    req?: { headers?: Headers };
    url?: URL;
  };
  const h = e.req?.headers;
  return hostnameOf(h?.get?.("x-forwarded-host") || h?.get?.("host") || e.url?.host || "");
}

function apply(event: unknown) {
  const e = event as {
    node?: { res?: { setHeader?: (k: string, v: string) => void; removeHeader?: (k: string) => void } };
    res?: { setHeader?: (k: string, v: string) => void };
  };
  const host = hostFrom(event);
  const headers = { ...BASE };
  if (host === CANONICAL_HOST || ALIAS_HOSTS.has(host)) {
    e.node?.res?.removeHeader?.("X-Robots-Tag");
    headers["X-Robots-Tag"] = "index, follow";
  }
  for (const [k, v] of Object.entries(headers)) {
    e.node?.res?.setHeader?.(k, v);
    e.res?.setHeader?.(k, v);
  }
}

export default async function securityHeaders(
  event: unknown,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  try {
    apply(event);
  } catch {
    /* never block the response */
  }
  const result = await next();
  try {
    const host = hostFrom(event);
    if (host === CANONICAL_HOST || ALIAS_HOSTS.has(host)) {
      if (result instanceof Response) {
        const headers = new Headers(result.headers);
        headers.delete("x-robots-tag");
        headers.set("X-Robots-Tag", "index, follow");
        return new Response(result.body, {
          status: result.status,
          statusText: result.statusText,
          headers,
        });
      }
    }
  } catch {
    /* never block */
  }
  return result;
}
