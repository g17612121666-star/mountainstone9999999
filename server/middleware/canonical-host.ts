/**
 * shanshizhi.grok.me → mountainstone.grok.me (301).
 * Preview / localhost stay put so the live iframe keeps working.
 * Alias responses are never indexed.
 */
const CANONICAL_ORIGIN = "https://mountainstone.grok.me";
const CANONICAL_HOST = "mountainstone.grok.me";
const ALIAS_HOSTS = new Set(["shanshizhi.grok.me", "www.mountainstone.grok.me"]);

interface EventShape {
  url?: URL;
  req?: { method?: string; headers?: Headers | Record<string, string | string[] | undefined> };
  node?: {
    req?: { headers?: Record<string, string | string[] | undefined> };
    res?: { setHeader?: (k: string, v: string) => void; removeHeader?: (k: string) => void };
  };
}

function firstHeader(raw: unknown): string {
  if (raw == null) return "";
  if (Array.isArray(raw)) return String(raw[0] || "");
  return String(raw);
}

function hostnameOf(hostHeader: string): string {
  return firstHeader(hostHeader)
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}

function headerBag(event: EventShape): Record<string, string> {
  const out: Record<string, string> = {};
  const bags: unknown[] = [event.req?.headers, event.node?.req?.headers];
  const names = [
    "x-forwarded-host",
    "x-original-host",
    "x-vercel-forwarded-host",
    "forwarded",
    "host",
  ];
  for (const bag of bags) {
    if (!bag) continue;
    if (typeof (bag as Headers).get === "function") {
      const h = bag as Headers;
      for (const name of names) {
        try {
          const v = h.get(name);
          if (v) out[name] = v;
        } catch {
          /* Fetch Headers rejects pseudo-headers such as :authority */
        }
      }
      continue;
    }
    for (const [k, v] of Object.entries(bag as Record<string, unknown>)) {
      const key = k.toLowerCase();
      if (!out[key]) out[key] = firstHeader(v);
    }
  }
  return out;
}

function headerHost(event: EventShape): string {
  const bag = headerBag(event);
  const forwarded = bag.forwarded || "";
  const fwdHost = /host=([^;,\s]+)/i.exec(forwarded)?.[1] || "";
  const raw =
    bag["x-forwarded-host"] ||
    bag["x-original-host"] ||
    bag["x-vercel-forwarded-host"] ||
    fwdHost ||
    bag.host ||
    bag[":authority"] ||
    event.url?.host ||
    "";
  return hostnameOf(raw);
}

function isAlias(host: string): boolean {
  if (ALIAS_HOSTS.has(host)) return true;
  return host.includes("shanshizhi.grok.me");
}

function redirect(pathAndSearch: string): Response {
  const dest = CANONICAL_ORIGIN + (pathAndSearch.startsWith("/") ? pathAndSearch : `/${pathAndSearch}`);
  return new Response(null, {
    status: 301,
    headers: {
      Location: dest,
      "X-Robots-Tag": "noindex, follow",
      "Cache-Control": "public, max-age=300",
    },
  });
}

export default async function canonicalHost(
  event: EventShape,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  let host = "";
  try {
    host = headerHost(event);
  } catch {
    return next();
  }
  const method = (event.req?.method ?? "GET").toUpperCase();
  const path = (event.url?.pathname || "/") + (event.url?.search || "");

  if ((method === "GET" || method === "HEAD") && isAlias(host)) {
    return redirect(path);
  }

  const result = await next();
  const preview = /localhost|127\.0\.0\.1|0\.0\.0\.0|^preview/i.test(host) && host !== CANONICAL_HOST;

  try {
    if (isAlias(host)) {
      return redirect(path);
    }
    if (!preview) {
      event.node?.res?.removeHeader?.("X-Robots-Tag");
      event.node?.res?.setHeader?.("X-Robots-Tag", "index, follow");
      event.node?.res?.setHeader?.("Link", `<${CANONICAL_ORIGIN}${path}>; rel="canonical"`);
      if (result instanceof Response) {
        const headers = new Headers(result.headers);
        headers.delete("x-robots-tag");
        headers.set("X-Robots-Tag", "index, follow");
        headers.set("Link", `<${CANONICAL_ORIGIN}${event.url?.pathname || "/"}>; rel="canonical"`);
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
