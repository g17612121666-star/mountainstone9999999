/** Single public origin. Alias hosts 301 here. Preview hosts stay noindex. */
export const CANONICAL_HOST = "mountainstone.grok.me";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
export const SITE_NAME = "山石志";

export const ALIAS_HOSTS = new Set(["shanshizhi.grok.me", "www.mountainstone.grok.me"]);

export const CONTACT_EMAIL = "shanshizhi.geo@gmail.com";

export function hostnameOf(hostHeader: string): string {
  return String(hostHeader || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];
}

export function isAliasHost(hostHeader: string): boolean {
  return ALIAS_HOSTS.has(hostnameOf(hostHeader));
}

export function isCanonicalHost(hostHeader: string): boolean {
  return hostnameOf(hostHeader) === CANONICAL_HOST;
}

/** Published app hosts that should be indexed. */
export function isPublicAppHost(hostHeader: string): boolean {
  const h = hostnameOf(hostHeader);
  return h === CANONICAL_HOST || ALIAS_HOSTS.has(h);
}

export function absUrl(path = "/"): string {
  if (!path) return `${CANONICAL_ORIGIN}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return CANONICAL_ORIGIN + (path.startsWith("/") ? path : `/${path}`);
}

export function seoHead(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): {
  meta: Array<Record<string, string>>;
  links: Array<{ rel: string; href: string }>;
} {
  const url = absUrl(opts.path);
  const img = absUrl(opts.image || "/og.jpg");
  const title = opts.title.includes(SITE_NAME) ? opts.title : `${opts.title} · ${SITE_NAME}`;
  return {
    meta: [
      { title },
      { name: "description", content: opts.description },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:locale", content: "zh_CN" },
      { property: "og:image", content: img },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: img },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
