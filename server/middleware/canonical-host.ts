/**
 * Production host pin: shanshizhi.grok.me → mountainstone.grok.me (301).
 * Preview / localhost are left alone so the live iframe keeps working.
 * Published hosts replace X-Robots-Tag so CDN noindex cannot linger.
 */
const CANONICAL_ORIGIN = "https://mountainstone.grok.me";
const CANONICAL_HOST = "mountainstone.grok.me";
const ALIAS_HOSTS = new Set(["shanshizhi.grok.me", "www.mountainstone.grok.me"]);

interface EventShape {
  url?: URL;
  req?: { method?: string; headers?: Headers };
  node?: { res?: { setHeader?: (k: string, v: string) => void; removeHeader?: (k: string) => void } };
}

function hostnameOf(hostHeader: string): string {
  return String(hostHeader || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

function headerHost(event: EventShape): string {
  const h = event.req?.headers;
  const raw = h?.get?.("x-forwarded-host") || h?.get?.("host") || event.url?.host || "";
  return hostnameOf(raw);
}

function indexHeaders(existing?: Headers): Headers {
  const headers = new Headers(existing);
  headers.delete("x-robots-tag");
  headers.set("X-Robots-Tag", "index, follow");
  return headers;
}

export default async function canonicalHost(
  event: EventShape,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const host = headerHost(event);
  const method = (event.req?.method ?? "GET").toUpperCase();

  if ((method === "GET" || method === "HEAD") && ALIAS_HOSTS.has(host) && event.url) {
    const dest = CANONICAL_ORIGIN + event.url.pathname + event.url.search;
    return new Response(null, {
      status: 301,
      headers: {
        Location: dest,
        "X-Robots-Tag": "index, follow",
      },
    });
  }

  const result = await next();
  const publicHost = host === CANONICAL_HOST || ALIAS_HOSTS.has(host);
  const preview =
    !publicHost && /localhost|127\.0\.0\.1|0\.0\.0\.0|^preview/i.test(host);

  try {
    if (!preview) {
      event.node?.res?.removeHeader?.("X-Robots-Tag");
      event.node?.res?.setHeader?.("X-Robots-Tag", "index, follow");
      if (result instanceof Response) {
        return new Response(result.body, {
          status: result.status,
          statusText: result.statusText,
          headers: indexHeaders(result.headers),
        });
      }
    }
  } catch {
    /* never block */
  }

  return result;
}
