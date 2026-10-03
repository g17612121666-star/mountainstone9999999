const KEY = "shanshizhi-saved-v1";

export function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): string[] {
  const cur = readSaved();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
