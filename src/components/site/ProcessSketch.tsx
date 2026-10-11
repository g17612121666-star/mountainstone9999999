import type { LandformType } from "@/lib/geo/types";
import { useLocale, useT } from "@/lib/i18n";

const KINDS = ["danxia", "karst", "granite_peak", "zhangjiajie_sandstone"] as const;
type Kind = (typeof KINDS)[number];

function isKind(value: string): value is Kind {
  return (KINDS as readonly string[]).includes(value);
}

export function sketchKind(landforms: LandformType[]): Kind | null {
  return landforms.find((l): l is Kind => isKind(l)) ?? null;
}

const COPY: Record<Kind, { zh: [string, string, string]; en: [string, string, string] }> = {
  danxia: {
    zh: ["红层叠着", "垂直节理切开", "崩成陡壁"],
    en: ["Red beds", "Vertical joints", "Cliffs collapse"],
  },
  karst: {
    zh: ["水沿裂隙进", "溶蚀掏空", "峰林或洞穴"],
    en: ["Water in cracks", "Dissolution", "Peaks or caves"],
  },
  granite_peak: {
    zh: ["岩体带节理", "棱角先掉", "剩成石蛋"],
    en: ["Jointed granite", "Corners go first", "Rounded cores"],
  },
  zhangjiajie_sandstone: {
    zh: ["石英砂岩", "流水下切", "不是丹霞"],
    en: ["Quartz sandstone", "Streams cut down", "Not Danxia"],
  },
};

export function ProcessSketch({ kind }: { kind: Kind }) {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const labels = locale === "en" ? COPY[kind].en : COPY[kind].zh;
  const sand = kind === "zhangjiajie_sandstone";
  return (
    <figure className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <svg viewBox="0 0 360 120" className="h-auto w-full" role="img" aria-label={labels.join("，")}>
        <rect width="360" height="120" fill="transparent" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 120},0)`}>
            <text x="60" y="16" textAnchor="middle" fontSize="11" fill="currentColor">
              {labels[i]}
            </text>
            {kind === "danxia" && i === 0 ? (
              <>
                <rect x="28" y="36" width="64" height="14" fill="#7a3b32" />
                <rect x="28" y="54" width="64" height="14" fill="#a35a42" />
                <rect x="28" y="72" width="64" height="14" fill="#7a3b32" />
              </>
            ) : null}
            {kind === "danxia" && i === 1 ? (
              <>
                <rect x="28" y="36" width="64" height="50" fill="#7a3b32" />
                <rect x="46" y="36" width="3" height="50" fill="#f1ebe0" />
                <rect x="62" y="36" width="3" height="50" fill="#f1ebe0" />
                <rect x="74" y="36" width="3" height="50" fill="#f1ebe0" />
              </>
            ) : null}
            {kind === "danxia" && i === 2 ? (
              <>
                <path d="M30 90 L48 38 L62 90 Z" fill="#7a3b32" />
                <path d="M66 90 L84 46 L98 90 Z" fill="#a35a42" />
                <rect x="40" y="92" width="16" height="8" fill="#6b5344" />
              </>
            ) : null}
            {kind === "karst" && i === 0 ? (
              <>
                <path d="M24 70 Q60 40 96 70" fill="none" stroke="#3d5c52" strokeWidth="2" />
                <rect x="28" y="74" width="64" height="22" fill="#8a8172" />
              </>
            ) : null}
            {kind === "karst" && i === 1 ? (
              <>
                <rect x="28" y="40" width="64" height="56" fill="#8a8172" />
                <path d="M40 96 Q48 60 56 96" fill="none" stroke="#f1ebe0" strokeWidth="3" />
                <path d="M58 96 Q70 52 80 96" fill="none" stroke="#f1ebe0" strokeWidth="3" />
              </>
            ) : null}
            {kind === "karst" && i === 2 ? (
              <>
                <path d="M30 96 L46 42 L58 96 Z" fill="#6b5344" />
                <path d="M58 96 L74 50 L90 96 Z" fill="#4e463c" />
                <ellipse cx="60" cy="86" rx="14" ry="8" fill="#1c1914" opacity="0.35" />
              </>
            ) : null}
            {kind === "granite_peak" && i === 0 ? (
              <>
                <rect x="30" y="40" width="60" height="52" fill="#c4b49a" />
                <path d="M30 66 H90" stroke="#f1ebe0" strokeWidth="2" />
                <path d="M60 40 V92" stroke="#f1ebe0" strokeWidth="2" />
              </>
            ) : null}
            {kind === "granite_peak" && i === 1 ? (
              <>
                <rect x="30" y="40" width="60" height="52" fill="#d9cbb4" />
                <path d="M34 92 L48 48 L72 48 L86 92" fill="none" stroke="#6b5344" strokeWidth="2" />
              </>
            ) : null}
            {kind === "granite_peak" && i === 2 ? (
              <ellipse cx="60" cy="70" rx="26" ry="22" fill="#c4b49a" stroke="#6b5344" strokeWidth="2" />
            ) : null}
            {sand && i === 0 ? (
              <>
                <rect x="28" y="48" width="64" height="10" fill="#c4b49a" />
                <rect x="28" y="62" width="64" height="10" fill="#a89880" />
                <rect x="28" y="76" width="64" height="10" fill="#c4b49a" />
              </>
            ) : null}
            {sand && i === 1 ? (
              <>
                <rect x="36" y="36" width="10" height="60" fill="#a89880" />
                <rect x="54" y="28" width="10" height="68" fill="#c4b49a" />
                <rect x="72" y="40" width="10" height="56" fill="#8a7b68" />
              </>
            ) : null}
            {sand && i === 2 ? (
              <text x="60" y="72" textAnchor="middle" fontSize="13" fill="#7a3b32">
                ≠
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-xs leading-relaxed text-muted">{t("schematicNote")}</figcaption>
    </figure>
  );
}
