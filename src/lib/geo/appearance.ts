export type PaperTheme = "paper" | "night" | "contrast";

const THEME_KEY = "shanshizhi-theme";
const TYPE_KEY = "shanshizhi-type";

export function readTheme(): PaperTheme {
  if (typeof localStorage === "undefined") return "paper";
  const v = localStorage.getItem(THEME_KEY);
  return v === "night" || v === "contrast" ? v : "paper";
}

export function readLargeType(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(TYPE_KEY) === "lg";
}

export function applyAppearance(theme: PaperTheme, large: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "paper") delete root.dataset.theme;
  else root.dataset.theme = theme;
  if (large) root.dataset.type = "lg";
  else delete root.dataset.type;
  const color = theme === "night" ? "#1c1914" : theme === "contrast" ? "#fff8ee" : "#f1ebe0";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}

export function writeTheme(theme: PaperTheme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  applyAppearance(theme, readLargeType());
}

export function writeLargeType(large: boolean) {
  try {
    localStorage.setItem(TYPE_KEY, large ? "lg" : "md");
  } catch {
    /* ignore */
  }
  applyAppearance(readTheme(), large);
}
