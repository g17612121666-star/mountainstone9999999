import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "zh" | "en";

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

export const useLocale = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "zh",
      setLocale: (locale) => {
        applyLocale(locale);
        set({ locale });
      },
      toggle: () => {
        const locale = get().locale === "zh" ? "en" : "zh";
        applyLocale(locale);
        set({ locale });
      },
    }),
    {
      name: "shanshizhi-locale",
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) applyLocale(state.locale);
      },
    },
  ),
);

export function currentLocale(): Locale {
  return useLocale.getState().locale;
}
