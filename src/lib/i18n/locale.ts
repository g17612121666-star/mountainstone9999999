import { create } from "zustand";

export type Locale = "zh" | "en";

const STORAGE_KEY = "shanshizhi-locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
}

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  document.documentElement.dataset.locale = locale;
}

export function readStored(): Locale {
  if (typeof window === "undefined") return "zh";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "zh";
    const parsed = JSON.parse(raw) as { state?: { locale?: string }; locale?: string };
    const loc = parsed?.state?.locale || parsed?.locale;
    return loc === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function writeStored(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { locale }, version: 0 }));
  } catch {
    /* private mode */
  }
  applyLocale(locale);
}

export const useLocale = create<LocaleState>((set, get) => ({
  locale: "zh",
  setLocale: (locale) => {
    writeStored(locale);
    set({ locale });
  },
  toggle: () => {
    const locale = get().locale === "zh" ? "en" : "zh";
    writeStored(locale);
    set({ locale });
  },
}));

if (typeof window !== "undefined") {
  const stored = readStored();
  if (stored === "en") {
    useLocale.setState({ locale: "en" });
    applyLocale("en");
  }
}

export function currentLocale(): Locale {
  return useLocale.getState().locale;
}
