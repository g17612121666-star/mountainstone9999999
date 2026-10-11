const OBS = "shanshizhi-observe-v1";
const TRAIL = "shanshizhi-trail-v1";
const RECENT = "shanshizhi-recent-q";

function readMap(key: string): Record<string, string[]> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, value: Record<string, string[]>) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function readObs(siteId: string): string[] {
  return readMap(OBS)[siteId] ?? [];
}

export function toggleObs(siteId: string, item: string): string[] {
  const all = readMap(OBS);
  const cur = new Set(all[siteId] ?? []);
  if (cur.has(item)) cur.delete(item);
  else cur.add(item);
  const next = [...cur];
  all[siteId] = next;
  writeMap(OBS, all);
  return next;
}

export function readTrail(routeId: string): string[] {
  return readMap(TRAIL)[routeId] ?? [];
}

export function toggleTrail(routeId: string, siteId: string): string[] {
  const all = readMap(TRAIL);
  const cur = new Set(all[routeId] ?? []);
  if (cur.has(siteId)) cur.delete(siteId);
  else cur.add(siteId);
  const next = [...cur];
  all[routeId] = next;
  writeMap(TRAIL, all);
  return next;
}

export function readRecent(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function pushRecent(q: string): string[] {
  const text = q.trim();
  if (text.length < 1) return readRecent();
  const next = [text, ...readRecent().filter((x) => x !== text)].slice(0, 6);
  try {
    localStorage.setItem(RECENT, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
