export const PACK_CACHE = "shanshizhi-field-v2";
export const PACK_PREFIX = "/__pack/";

export interface OfflinePackMeta {
  id: string;
  kind: "site" | "trail";
  title: string;
  title_en: string;
  cached_at: string;
  cover?: string;
  body_zh: string;
  body_en: string;
  page_path?: string;
  sw_ok?: boolean;
  locale: "zh" | "en";
}

function packKey(kind: string, id: string, locale: string): string {
  return PACK_PREFIX + kind + "-" + id + "-" + locale;
}

export async function listPacks(): Promise<OfflinePackMeta[]> {
  if (typeof caches === "undefined") return [];
  const cache = await caches.open(PACK_CACHE);
  const keys = await cache.keys();
  const packs: OfflinePackMeta[] = [];
  for (const req of keys) {
    if (!new URL(req.url).pathname.startsWith(PACK_PREFIX)) continue;
    const res = await cache.match(req);
    if (!res) continue;
    try {
      const meta = (await res.json()) as OfflinePackMeta;
      if (!meta.locale) meta.locale = "zh";
      packs.push(meta);
    } catch {
      /* skip */
    }
  }
  return packs.sort((a, b) => b.cached_at.localeCompare(a.cached_at));
}

export async function savePack(meta: OfflinePackMeta): Promise<void> {
  const cache = await caches.open(PACK_CACHE);
  const pagePath =
    meta.page_path ||
    (typeof window !== "undefined" ? window.location.pathname : undefined);
  const stored: OfflinePackMeta = { ...meta, page_path: pagePath };
  await cache.put(
    packKey(meta.kind, meta.id, meta.locale),
    new Response(JSON.stringify(stored), { headers: { "Content-Type": "application/json" } }),
  );
  if (pagePath && typeof window !== "undefined") {
    try {
      const html = "<!doctype html>\n" + document.documentElement.outerHTML;
      await cache.put(
        pagePath,
        new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
      );
    } catch {
      /* snapshot optional */
    }
  }
  if (meta.cover) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(meta.cover, { signal: ctrl.signal });
      clearTimeout(t);
      if (res.ok) await cache.put(meta.cover, res);
    } catch {
      /* cover optional */
    }
  }
}

export async function hasPack(
  kind: "site" | "trail",
  id: string,
  locale: "zh" | "en",
): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const cache = await caches.open(PACK_CACHE);
  return Boolean(await cache.match(packKey(kind, id, locale)));
}

export async function deletePack(
  kind: "site" | "trail",
  id: string,
  locale: "zh" | "en",
): Promise<void> {
  if (typeof caches === "undefined") return;
  const cache = await caches.open(PACK_CACHE);
  const key = packKey(kind, id, locale);
  const hit = await cache.match(key);
  if (hit) {
    try {
      const meta = (await hit.json()) as OfflinePackMeta;
      if (meta.page_path) await cache.delete(meta.page_path);
      if (meta.cover) await cache.delete(meta.cover);
    } catch {
      /* ignore */
    }
  }
  await cache.delete(key);
}

export async function registerFieldSw(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const p = navigator.serviceWorker.register("/sw-field.js", { scope: "/" }).then(() => true);
    const timed = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 2000);
    });
    return await Promise.race([p, timed]);
  } catch {
    return false;
  }
}

export async function swAvailable(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    return regs.some((r) => (r.active || r.installing || r.waiting)?.scriptURL.includes("sw-field"));
  } catch {
    return false;
  }
}
