/** Relative order only. Bed numbers are not drawn — they still need the section log. */
export function MeishanSpikes({ en }: { en: boolean }) {
  const title = en ? "Two spikes, one section — not the same year" : "一剖两钉，不是同一年";
  const note = en
    ? "Up the section is younger. The Permian–Triassic boundary (ratified 2001) sits above the base of the Changhsingian (ratified 2005)."
    : "剖面上部更年轻。二叠–三叠系界线（2001 年钉下）在长兴阶底界（2005 年钉下）的上面。";
  return (
    <figure className="rounded-xl bg-surface px-4 py-4 shadow-[var(--shadow-border)]">
      <figcaption className="font-display text-lg font-semibold">{title}</figcaption>
      <p className="mt-1 text-sm leading-relaxed text-muted">{note}</p>
      <svg viewBox="0 0 420 230" className="mt-3 w-full" role="img" aria-label={title}>
        <text x="16" y="28" fontSize="13" fill="#4e463c">
          {en ? "up" : "上"}
        </text>
        <rect x="36" y="18" width="72" height="194" rx="6" fill="#e4d9c8" stroke="#2c261c" />
        <line x1="36" y1="58" x2="250" y2="58" stroke="#7a3b32" strokeWidth="2" />
        <polygon points="108,50 124,58 108,66" fill="#7a3b32" />
        <text x="136" y="54" fontSize="15" fill="#2c261c">
          {en ? "Permian–Triassic boundary · 2001" : "二叠–三叠系界线 · 2001"}
        </text>
        <text x="136" y="74" fontSize="13" fill="#4e463c">
          Hindeodus parvus
        </text>
        <line x1="36" y1="158" x2="250" y2="158" stroke="#3d5c52" strokeWidth="2" />
        <polygon points="108,150 124,158 108,166" fill="#3d5c52" />
        <text x="136" y="154" fontSize="15" fill="#2c261c">
          {en ? "Base of the Changhsingian · 2005" : "长兴阶底界 · 2005"}
        </text>
        <text x="136" y="174" fontSize="13" fill="#4e463c">
          Clarkina wangi
        </text>
        <text x="16" y="206" fontSize="13" fill="#4e463c">
          {en ? "down" : "下"}
        </text>
      </svg>
    </figure>
  );
}
