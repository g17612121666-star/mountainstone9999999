const PLACEHOLDER_ONLY = /^(待补|标准卡待补|成因与打卡点待补|内容待写)[。.]?$/;
const PLACEHOLDER_TAIL =
  /标准卡待补[，,]?先用这个三件套读现场。?|成因与打卡点待补。?|内容待写。?|详细过程见深页时间轴。?|详细过程见深页。?/g;

export function isPlaceholderCopy(s: string | null | undefined): boolean {
  return !visibleCopy(s);
}

export function visibleCopy(s: string | null | undefined): string {
  const t = (s || "").trim();
  if (!t) return "";
  if (PLACEHOLDER_ONLY.test(t)) return "";
  return t.replace(PLACEHOLDER_TAIL, "").replace(/待补/g, "").replace(/\s{2,}/g, " ").trim();
}

export function isGenericTransport(s: string): boolean {
  return /通常经县里转车|一般需包车或自驾到园区/.test(s);
}

export function isSeasonLightTip(s: string): boolean {
  return /春秋侧光/.test(s);
}

export function isTicketDisclaimer(s: string): boolean {
  return /本站不售票|以官方(当日)?为准/.test(s);
}

/** Drop leftover template sentences visitors should not see stacked. */
export function filterVisitorLines(lines: string[], opts?: { allowOneTicket?: boolean; allowOneLight?: boolean }): string[] {
  let ticket = 0;
  let light = 0;
  const out: string[] = [];
  for (const raw of lines) {
    const s = visibleCopy(raw);
    if (!s) continue;
    if (isGenericTransport(s)) continue;
    if (isTicketDisclaimer(s)) {
      if (!opts?.allowOneTicket || ticket++) continue;
    }
    if (isSeasonLightTip(s)) {
      if (!opts?.allowOneLight || light++) continue;
    }
    out.push(s);
  }
  return out;
}

export function isGovPortal(url: string): boolean {
  if (!url) return false;
  if (!/gov\.cn/i.test(url)) return false;
  return !/geopark|geology|dwy|museum|park|lyj|whly|ngp/i.test(url);
}
