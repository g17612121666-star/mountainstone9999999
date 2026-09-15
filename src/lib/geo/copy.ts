const PLACEHOLDER = /待补|标准卡待补|成因与打卡点待补|内容待写/;
const GENERIC_TRANSPORT = /通常经县里转车|一般需包车或自驾到园区/;
const LIGHT_TIP = /春秋侧光/;
const TICKET_LINE = /本站不售票|以官方(当日)?为准/;

export function isPlaceholderCopy(s: string | null | undefined): boolean {
  return !s ? true : PLACEHOLDER.test(s);
}

export function visibleCopy(s: string | null | undefined): string {
  const t = (s || "").trim();
  if (!t || PLACEHOLDER.test(t)) return "";
  return t;
}

export function isGenericTransport(s: string): boolean {
  return GENERIC_TRANSPORT.test(s);
}

export function isSeasonLightTip(s: string): boolean {
  return LIGHT_TIP.test(s);
}

export function isTicketDisclaimer(s: string): boolean {
  return TICKET_LINE.test(s);
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
