const PLACEHOLDER_ONLY = /^(待补|标准卡待补|成因与打卡点待补|内容待写)[。.]?$/;
const PLACEHOLDER_TAIL =
  /标准卡待补[，,]?先用这个三件套读现场。?|成因与打卡点待补。?|内容待写。?|详细过程见深页时间轴。?|详细过程见深页。?/g;

/** Turn the repeated card-template into something a person would actually say. */
function loosenZh(raw: string): string {
  let s = raw;
  s = s.replace(
    /今天能直接看到的，是(.+?)被切开后的几何：崖、柱、洞、层或锥。细节在打卡点。/g,
    "到了先看$1：崖、石柱、洞，或者一层一层的石头。具体站哪儿，看下面列的点。",
  );
  s = s.replace(
    /岩石：([^。]+)。构造：区域抬升与节理（或层面）把岩体切开。外力：([^。]+)。/g,
    "石头主要是$1。抬起来之后，裂缝把它切开，再靠$2变成现在这样。",
  );
  s = s.replace(/^(.+?)写在(.+)。$/, "在$2，看的是$1。");
  s = s.replace(/先认岩石：颜色、颗粒、层理，再看它怎么裂。/g, "先看颜色和颗粒，再看裂缝怎么走。");
  s = s.replace(/侧光和雨后，层理与节理更清楚。/g, "侧着光，或者刚下过雨，层和缝会清楚一点。");
  s = s.replace(
    /在[^。]{0,16}现场，先用手（或眼睛）确认颗粒、颜色和层理，而不是先问[‘'「]这是不是名石[’'」]。/g,
    "别急着问这是不是名石。先看颗粒、颜色，有没有一层一层。",
  );
  s = s.replace(/不要把所有平顶山都叫张家界地貌，也不要把所有红崖都叫丹霞。/g, "平顶的不一定是张家界那种砂岩，红的也不一定是丹霞。");
  return s.replace(/\s{2,}/g, " ").replace(/。{2,}/g, "。").trim();
}

export function isPlaceholderCopy(s: string | null | undefined): boolean {
  return !visibleCopy(s);
}

export function visibleCopy(s: string | null | undefined): string {
  const t = (s || "").trim();
  if (!t) return "";
  if (PLACEHOLDER_ONLY.test(t)) return "";
  const stripped = t.replace(PLACEHOLDER_TAIL, "").replace(/待补/g, "").replace(/\s{2,}/g, " ").trim();
  if (!stripped) return "";
  return /[\u4e00-\u9fff]/.test(stripped) ? loosenZh(stripped) : stripped;
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
