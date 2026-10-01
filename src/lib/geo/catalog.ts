import type {
  Area,
  CatalogBundle,
  Geosite,
  PhotoAsset,
  Route,
  Site,
  ThemeRoute,
  VisitInfo,
} from "./types";
import rawSites from "../../../data/sites.json";
import rawAreas from "../../../data/areas.json";
import rawGeosites from "../../../data/geosites.json";
import rawRoutes from "../../../data/routes.json";
import rawThemeRoutes from "../../../data/theme-routes.json";
import rawVisits from "../../../data/visits.json";
import standardBundle from "../../../data/standard.json";
import upgradeBundle from "../../../data/upgrade.json";
import mediaBundle from "../../../data/media.json";
import rewriteBundle from "../../../data/rewrite.json";
import coverCreditsJson from "../../../data/cover_credits.json";
import { deepGeosites, deepOverlays, deepRoutes, deepVisits } from "./deep";
import { isFakeGeosite, isGenericGeositeName, FOSSIL_LAW_HK } from "./labels";
import {
  HOST_PARK,
  SITE_ALIASES,
  UNESCO_PARENT,
  fieldPatches,
  geositePatches,
  routePatches,
} from "./patches";
import { isDiagramCredit, isGenericSafety, isOwnCover, safetyFor } from "./safety";
import { expandLookHere } from "./look";
import type { VideoClip } from "./types";
import { rewriteAgeClause, sanitizeGeologicAge } from "./age";
import { isPlaceholderCopy, visibleCopy } from "./copy";
import { assignPhotoSlots, mergeDiskExtras } from "./photos";

/** Extra outcrop/landscape photos that are not the cover, never reused as a field-stop photo. */
const EXTRA_GALLERY: Record<string, PhotoAsset[]> = {
  danxiashan: [
    {
      src: "/covers/danxiashan-slot.jpg",
      credit: "Mx. Granger, CC0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/danxiashan-4.jpg",
      credit: "Mx. Granger, CC0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
  ],
  zhangjiajie: [
    {
      src: "/covers/zhangjiajie-2.jpg",
      credit: "Majavar, CC BY-SA 3.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/zhangjiajie-3.jpg",
      credit: "Gjl, CC BY-SA 3.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/zhangjiajie-4.jpg",
      credit: "John Philip, CC BY-SA 2.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
  ],
  shilin: [
    {
      src: "/covers/shilin-2.jpg",
      credit: "CEphoto, Uwe Aranas, CC BY-SA 3.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/shilin-3.jpg",
      credit: "CEphoto, Uwe Aranas, CC BY-SA 3.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
  ],
  wudalianchi: [
    {
      src: "/covers/wudalianchi-2.jpg",
      credit: "Charlie fong, CC BY 4.0, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/wudalianchi-3.jpg",
      credit: "Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
    {
      src: "/covers/wudalianchi-4.jpg",
      credit: "颜邯, CC BY-SA 4.0, Wikimedia Commons · 老黑山火口",
      caption: "资料照片，非本站踏勘",
    },
  ],
  fangshan: [
    {
      src: "/covers/fangshan-2.jpg",
      credit: "Shizhao, CC BY-SA 4.0, Wikimedia Commons · 十渡拒马河",
      caption: "资料照片，非本站踏勘",
    },
  ],
  changbaishan: [
    {
      src: "/covers/changbaishan-2.jpg",
      credit: "Charlie fong, Public Domain, Wikimedia Commons",
      caption: "资料照片，非本站踏勘",
    },
  ],
  weizhoudao: [
    {
      src: "/covers/weizhoudao-2.jpg",
      credit: "Liuxingy, CC BY-SA 4.0, Wikimedia Commons · 鳄鱼山火山岩",
      caption: "资料照片，非本站踏勘",
    },
  ],
  shidu: [
    {
      src: "/covers/fangshan-2.jpg",
      credit: "Shizhao, CC BY-SA 4.0, Wikimedia Commons · 十渡拒马河",
      caption: "十渡，资料照片，非本站踏勘",
    },
  ],
  baishishan: [
    {
      src: "/covers/baishishan-2.jpg",
      credit: "Taken by Fanghong, CC BY 2.5, Wikimedia Commons · 涞源白石山",
      caption: "资料照片，非本站踏勘",
    },
  ],
  qiyunshan: [
    {
      src: "/covers/qiyunshan-2.jpg",
      credit: "Julienfuchs, CC BY-SA 3.0, Wikimedia Commons · File:Qiyun Shan sacred cliff.JPG",
      caption: "齐云山丹霞崖。资料照片，非本站踏勘",
    },
  ],
  dapeng: [
    {
      src: "/covers/dapeng-2.jpg",
      credit: "张元柏, CC BY-SA 3.0, Wikimedia Commons · 大鹏半岛东部基岩海岸",
      caption: "资料照片，非本站踏勘",
    },
  ],
  chayashan: [
    {
      src: "/covers/chayashan-2.jpg",
      credit: "Gary Todd, CC0, Wikimedia Commons · File:Chaya Shan 11.jpg",
      caption: "嵖岈山花岗岩。资料照片，非本站踏勘",
    },
  ],
  "xingtai-canyon": [
    {
      src: "/covers/xingtai-canyon-2.jpg",
      credit: "资料照片 · 人民网记者 席彪 · 人民网河北频道 · 政府/园区官方图，已署名并链回",
      caption: "邢台太行石英砂岩峡谷。资料照片，非本站踏勘",
    },
  ],
  wudangshan: [
    {
      src: "/covers/wudangshan-2.jpg",
      credit: "xiquinhosilva, CC BY 2.0, Wikimedia Commons",
      caption: "湖北武当山峰脊。资料照片，非本站踏勘",
    },
  ],
  "gssp-paibi": [
    {
      src: "/covers/gssp-paibi-2.jpg",
      credit: "Woudloper, CC BY-SA 4.0, Wikimedia Commons",
      caption: "排碧阶剖面另一露头。资料照片，非本站踏勘",
    },
  ],
  "gssp-guzhang": [
    {
      src: "/covers/gssp-guzhang-2.jpg",
      credit: "Woudloper, CC BY-SA 4.0, Wikimedia Commons",
      caption: "古丈阶酉水剖面。资料照片，非本站踏勘",
    },
  ],
  "gssp-wuliu": [
    {
      src: "/covers/gssp-wuliu-2.jpg",
      credit: "Woudloper, CC BY-SA 4.0, Wikimedia Commons",
      caption: "乌溜阶凯里组。资料照片，非本站踏勘",
    },
  ],
  "gssp-huanghuachang": [
    {
      src: "/covers/gssp-huanghuachang-2.jpg",
      credit: "Woudloper, CC BY-SA 4.0, Wikimedia Commons",
      caption: "大坪阶大湾组。资料照片，非本站踏勘",
    },
  ],
  laojunshan: [
    {
      src: "/covers/laojunshan-2.jpg",
      credit: "资料照片 · 人民网云南频道 · 黎明景区供图 · 政府/园区官方图，已署名并链回",
      caption: "黎明丹霞岩壁。资料照片，非本站踏勘",
    },
  ],
  huoshizhai: [
    {
      src: "/covers/huoshizhai-2.jpg",
      credit: "资料照片 · 宁夏回族自治区人民政府网 · 政府/园区官方图，已署名并链回",
      caption: "西吉火石寨丹霞岩体。资料照片，非本站踏勘",
    },
  ],
  "yichun-forest": [
    {
      src: "/covers/yichun-forest-2.jpg",
      credit: "资料照片 · 汤旺县文体广电和旅游局 / 人民网黑龙江频道 · 政府/园区官方图，已署名并链回",
      caption: "汤旺河花岗岩石林。资料照片，非本站踏勘",
    },
  ],
  xiaonanhai: [
    {
      src: "/covers/xiaonanhai-2.jpg",
      credit: "资料照片 · 新华社记者 唐奕 · 新华网图片 · 政府/园区官方图，已署名并链回",
      caption: "小南海堰塞湖秋景。资料照片，非本站踏勘",
    },
  ],
};

/** Field-stop photos that are not the park cover. */
export const STOP_PHOTOS: Record<string, { src: string; credit: string }> = {
  "dxs-xianglong": {
    src: "/covers/danxiashan-slot.jpg",
    credit: "Mx. Granger, CC0, Wikimedia Commons",
  },
  "dxs-jinjiang": {
    src: "/covers/danxiashan-4.jpg",
    credit: "Mx. Granger, CC0, Wikimedia Commons",
  },
  "dxs-barzhai": {
    src: "/covers/danxiashan-3.jpg",
    credit: "Ethan Lee, CC BY-SA 3.0, Wikimedia Commons",
  },
  "zjj-jinbianxi": {
    src: "/covers/zhangjiajie-2.jpg",
    credit: "Majavar, CC BY-SA 3.0, Wikimedia Commons",
  },
  "zjj-tianzishan": {
    src: "/covers/zhangjiajie-3.jpg",
    credit: "Gjl, CC BY-SA 3.0, Wikimedia Commons",
  },
  "sl-wenbi": {
    src: "/covers/shilin-2.jpg",
    credit: "CEphoto, Uwe Aranas, CC BY-SA 3.0, Wikimedia Commons",
  },
  "sl-naigu": {
    src: "/covers/shilin-3.jpg",
    credit: "CEphoto, Uwe Aranas, CC BY-SA 3.0, Wikimedia Commons",
  },
  "wudalianchi-rope": {
    src: "/covers/wudalianchi-2.jpg",
    credit: "Charlie fong, CC BY 4.0, Wikimedia Commons",
  },
  "wudalianchi-sanchi": {
    src: "/covers/wudalianchi-3.jpg",
    credit: "Wikimedia Commons",
  },
  "fangshan-shidu": {
    src: "/covers/fangshan-2.jpg",
    credit: "Shizhao, CC BY-SA 4.0, Wikimedia Commons · 十渡拒马河",
  },
  "changbaishan-tianchi": {
    src: "/covers/changbaishan-2.jpg",
    credit: "Charlie fong, Public Domain, Wikimedia Commons",
  },
};

/** Priority pages that must show a video slot even when empty. */
export const VIDEO_SLOT_SITES = new Set([
  "danxiashan",
  "zhangjiajie",
  "shilin",
  "wudalianchi",
  "meishan",
  "songshan",
  "fangshan",
  "shihuadong",
  "huangshan",
  "taishan",
  "wulong",
  "zhijindong",
  "guilin-karst",
  "jiuzhaigou",
  "zhangye",
  "dunhuang",
  "hongkong",
  "chengjiang",
  "zigong",
  "changshan",
  "jingpohu",
  "sanqingshan",
  "longhushan",
  "taining",
  "yesanpo",
  "sheshan",
]);

export const VIDEO_SLOT_ROUTES = new Set([
  "danxia",
  "sandstone-peak",
  "volcano",
  "gssp",
  "granite",
  "wind",
  "karst",
]);

export const DATA_CUTOFF = "2026-04";

type StandardBundle = {
  sites?: Record<string, Partial<Site>>;
  geosites?: Record<string, Geosite[]>;
  routes?: Record<string, Route[]>;
  visits?: Record<string, Partial<VisitInfo>>;
};

const std = standardBundle as unknown as StandardBundle;
const stdSites = std.sites ?? {};
const stdGeosites = std.geosites ?? {};
const stdRoutes = std.routes ?? {};
const stdVisits = std.visits ?? {};
const up = upgradeBundle as unknown as StandardBundle;
const upSites = up.sites ?? {};
const upGeosites = up.geosites ?? {};
const upRoutes = up.routes ?? {};
const rwSites = ((rewriteBundle as unknown as StandardBundle).sites ?? {}) as Record<
  string,
  Partial<Site>
>;

const COVER_CREDITS = coverCreditsJson as Record<
  string,
  { credit?: string; caption?: string; src?: string }
>;

function fillCoverFromCredits(site: Site): void {
  const cc = COVER_CREDITS[site.id];
  if (!cc?.src) return;
  let credit = (cc.credit || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (credit.toLowerCase().includes("href=")) {
    credit = credit.replace(/href=\S+/gi, "").replace(/\s+/g, " ").trim();
  }
  if (!credit || credit.length < 3) credit = "Wikimedia Commons";
  if (isOwnCover(site)) {
    if (!site.cover_credit || site.cover_credit.includes("<") || site.cover_credit.includes("href=")) {
      site.cover_credit = credit;
    }
    return;
  }
  const trial = { id: site.id, cover_image: cc.src, cover_credit: credit };
  if (!isOwnCover(trial)) return;
  site.cover_image = cc.src;
  site.cover_credit = credit;
}

export const sites: Site[] = (rawSites as unknown as Site[]).map((s) => {
  const a = stdSites[s.id];
  const b = deepOverlays[s.id];
  const d = upSites[s.id];
  const c = fieldPatches[s.id];
  let merged: Site = s;
  if (a) merged = { ...merged, ...a, id: s.id };
  if (b) merged = { ...merged, ...b, id: s.id };
  if (d) merged = { ...merged, ...d, id: s.id };
  const rw = rwSites[s.id];
  if (rw) {
    const {
      cover_image: _ci,
      cover_credit: _cc,
      gallery: _g,
      content_status: rwStatus,
      content_tier: rwTier,
      ...rest
    } = rw as Partial<Site> & {
      cover_image?: string;
      cover_credit?: string;
      gallery?: PhotoAsset[];
      content_status?: Site["content_status"];
      content_tier?: Site["content_tier"];
    };
    void _ci;
    void _cc;
    void _g;
    if (merged.content_status !== "complete") {
      merged = { ...merged, ...rest, id: s.id };
      if (merged.content_status === "placeholder" && rwStatus) {
        merged.content_status = rwStatus;
        if (rwTier) merged.content_tier = rwTier;
      }
    }
  }
  if (c) merged = { ...merged, ...c, id: s.id };
  fillCoverFromCredits(merged);
  merged.geologic_age_text = sanitizeGeologicAge(merged.geologic_age_text);
  merged.hook = rewriteAgeClause(merged.hook, merged.geologic_age_text);
  merged.formation_short = rewriteAgeClause(merged.formation_short, merged.geologic_age_text);
  merged.what_you_see_today = rewriteAgeClause(merged.what_you_see_today, merged.geologic_age_text);
  if (isPlaceholderCopy(merged.hook)) merged.hook = visibleCopy(merged.hook);
  merged.formation_short = visibleCopy(merged.formation_short);
  merged.what_you_see_today = visibleCopy(merged.what_you_see_today);
  merged.observation_tips = (merged.observation_tips || []).map(visibleCopy).filter(Boolean);
  if (Array.isArray(merged.formation_timeline)) {
    merged.formation_timeline = merged.formation_timeline.map((st) => ({
      ...st,
      age: sanitizeGeologicAge(st.age),
    }));
  }
  if (merged.province === "香港") merged.legal_notes = FOSSIL_LAW_HK;
  if (s.id in HOST_PARK) merged.host_park_id = HOST_PARK[s.id];
  if (UNESCO_PARENT[s.id]) merged.unesco_parent_id = UNESCO_PARENT[s.id];
  if (
    s.id === "chongming" ||
    s.id === "hongkong" ||
    merged.types.includes("urban_geosite") ||
    isGenericSafety(merged.safety_notes)
  ) {
    merged.safety_notes = safetyFor(merged);
  }
  if (!isOwnCover(merged)) {
    merged.cover_image = "";
    merged.cover_credit = "";
    merged.gallery = [];
  } else if (!Array.isArray(merged.gallery) || typeof merged.gallery[0] === "string") {
    merged.gallery = merged.cover_image
      ? [{ src: merged.cover_image, credit: merged.cover_credit || "", caption: "资料照片，非本站踏勘" }]
      : [];
  }
  const extra = [
    ...(EXTRA_GALLERY[s.id] ?? []),
    ...((((COVER_CREDITS[s.id] as { gallery?: PhotoAsset[] } | undefined)?.gallery) ?? []) as PhotoAsset[]),
  ];
  if (extra && extra.length && merged.cover_image) {
    const have = new Set<string>();
    merged.gallery = [];
    for (const p of extra) {
      if (!p.src || p.src === merged.cover_image || have.has(p.src)) continue;
      have.add(p.src);
      if (isDiagramCredit(p.credit || "", p.caption || "")) {
        merged.gallery.push({ ...p, caption: p.caption || "示意图，不是现场照片" });
      } else {
        merged.gallery.push(p);
      }
    }
  } else if (Array.isArray(merged.gallery)) {
    merged.gallery = merged.gallery.filter((p) => p.src && p.src !== merged.cover_image);
  }
  const clip = (mediaBundle as { sites?: Record<string, VideoClip> }).sites?.[s.id];
  if (clip) merged.video = clip;
  mergeDiskExtras(merged);
  return merged;
});

const overlayGeositeSiteIds = new Set([
  ...Object.keys(stdGeosites),
  ...Object.keys(deepGeosites),
  ...Object.keys(geositePatches),
  ...Object.keys(upGeosites),
]);

function hasRealUpgradeGeosites(id: string): boolean {
  const list = upGeosites[id];
  if (!list?.length) return false;
  return list.some((g) => !isFakeGeosite(g));
}

export const geosites: Geosite[] = [
  ...(rawGeosites as unknown as Geosite[]).filter(
    (g) => !overlayGeositeSiteIds.has(g.site_id) && !isFakeGeosite(g),
  ),
  ...Object.entries(stdGeosites)
    .filter(([id]) => !deepGeosites[id] && !geositePatches[id] && !upGeosites[id])
    .flatMap(([, list]) => list),
  ...Object.entries(deepGeosites)
    .filter(([id]) => !geositePatches[id] && !hasRealUpgradeGeosites(id))
    .flatMap(([, list]) => list),
  ...Object.entries(upGeosites)
    .filter(([id]) => !geositePatches[id])
    .flatMap(([, list]) => list),
  ...Object.values(geositePatches).flat(),
].filter((g) => !isFakeGeosite(g) && !isGenericGeositeName(g.name));

{
  for (const g of geosites) {
    g.look_here = expandLookHere(g);
    const photo = STOP_PHOTOS[g.id];
    if (photo) {
      g.photo = photo.src;
      g.photo_credit = photo.credit;
      g.photo_kind = "own";
    }
  }
}

const overlayRouteSiteIds = new Set([
  ...Object.keys(stdRoutes),
  ...Object.keys(deepRoutes),
  ...Object.keys(upRoutes),
]);

export const routes: Route[] = (() => {
  const merged: Route[] = [
    ...(rawRoutes as unknown as Route[]).filter(
      (r) => !overlayRouteSiteIds.has(r.site_id) && r.name !== "半日地质步道",
    ),
    ...Object.entries(stdRoutes)
      .filter(([id]) => !deepRoutes[id] && !upRoutes[id])
      .flatMap(([, list]) => list),
    ...Object.entries(deepRoutes)
      .filter(([id]) => !upRoutes[id])
      .flatMap(([, list]) => list),
    ...Object.values(upRoutes).flat(),
  ];
  const replaced = new Set(Object.keys(routePatches));
  return [...merged.filter((r) => !replaced.has(r.site_id)), ...Object.values(routePatches).flat()];
})();

export const areas: Area[] = rawAreas as unknown as Area[];
export const themeRoutes: ThemeRoute[] = (rawThemeRoutes as unknown as ThemeRoute[]).map((tr) => {
  const clip = (mediaBundle as { routes?: Record<string, VideoClip> }).routes?.[tr.id];
  return clip && !tr.video ? { ...tr, video: clip } : tr;
});
export const visits: VisitInfo[] = (rawVisits as unknown as VisitInfo[]).map((v) => {
  const a = stdVisits[v.site_id];
  const b = deepVisits[v.site_id];
  let merged: VisitInfo = v;
  if (a) merged = { ...merged, ...a, site_id: v.site_id };
  if (b) merged = { ...merged, ...b, site_id: v.site_id };
  return merged;
});

const siteById = new Map(sites.map((s) => [s.id, s]));
assignPhotoSlots(sites, geosites);
for (const tr of themeRoutes) {
  for (const id of tr.site_ids) {
    const s = siteById.get(id);
    if (s && !s.theme_route_ids.includes(tr.id)) s.theme_route_ids.push(tr.id);
  }
}
const geositesBySite = new Map<string, Geosite[]>();
const geositeById = new Map<string, Geosite>();
for (const g of geosites) {
  const list = geositesBySite.get(g.site_id) ?? [];
  list.push(g);
  geositesBySite.set(g.site_id, list);
  geositeById.set(g.id, g);
}
for (const s of sites) {
  const used = new Set<string>();
  if (s.cover_image) used.add(s.cover_image);
  if (s.genesis?.src) used.add(s.genesis.src);
  for (const g of geositesBySite.get(s.id) ?? []) {
    if (g.photo) used.add(g.photo);
  }
  if (Array.isArray(s.gallery) && s.gallery.length) {
    const seen = new Set<string>();
    s.gallery = s.gallery.filter((p) => {
      if (!p.src || used.has(p.src) || seen.has(p.src)) return false;
      seen.add(p.src);
      return true;
    });
  }
}
const routesBySite = new Map<string, Route[]>();
for (const r of routes) {
  const list = routesBySite.get(r.site_id) ?? [];
  list.push(r);
  routesBySite.set(r.site_id, list);
}
const visitBySite = new Map(visits.map((v) => [v.site_id, v]));
const themeById = new Map(themeRoutes.map((t) => [t.id, t]));
const areasBySite = new Map<string, Area[]>();
for (const a of areas) {
  const list = areasBySite.get(a.site_id) ?? [];
  list.push(a);
  areasBySite.set(a.site_id, list);
}

export const GSSP_ALIASES: Record<string, string> = {
  "changshan-huangnitang": "gssp-huangnitang",
  huangnitang: "gssp-huangnitang",
  "changxing-meishan": "meishan",
  meishan: "meishan",
  "jiangshan-duibian": "gssp-jiangshan",
  jiangshan: "gssp-jiangshan",
  "gssp-jiangshan": "gssp-jiangshan",
  paibi: "gssp-paibi",
  "gssp-paibi": "gssp-paibi",
  guzhang: "gssp-guzhang",
  wuliu: "gssp-wuliu",
  huanghuachang: "gssp-huanghuachang",
  wangjiawan: "gssp-wangjiawan",
  penglaitan: "gssp-penglaitan",
  pengchong: "gssp-pengchong",
  darriwilian: "gssp-huangnitang",
  "jianhe-wuliu": "gssp-wuliu",
  jianhe: "gssp-wuliu",
};

export function getSite(id: string): Site | undefined {
  return (
    siteById.get(id) ??
    siteById.get(GSSP_ALIASES[id] ?? "") ??
    siteById.get(SITE_ALIASES[id] ?? "")
  );
}

export function getGeosites(siteId: string): Geosite[] {
  return geositesBySite.get(siteId) ?? [];
}

export function getGeosite(id: string): Geosite | undefined {
  return geositeById.get(id);
}

export function getRoutes(siteId: string): Route[] {
  return routesBySite.get(siteId) ?? [];
}

export function getVisit(siteId: string): VisitInfo | undefined {
  return visitBySite.get(siteId);
}

export function getTheme(id: string): ThemeRoute | undefined {
  return themeById.get(id);
}

export function getAreas(siteId: string): Area[] {
  return areasBySite.get(siteId) ?? [];
}

export function relatedSites(site: Site): Site[] {
  return relatedEntries(site)
    .map((e) => e.site)
    .filter((s): s is Site => !!s);
}

export function relatedEntries(site: Site): { id: string; site?: Site }[] {
  const seen = new Set<string>();
  const out: { id: string; site?: Site }[] = [];
  for (const id of site.related_site_ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const resolved =
      siteById.get(id) ??
      siteById.get(SITE_ALIASES[id] ?? "") ??
      siteById.get(GSSP_ALIASES[id] ?? "");
    out.push({ id, site: resolved });
  }
  return out;
}

export function gsspSites(): Site[] {
  return sites.filter((s) => s.types.includes("gssp"));
}

export function nationalGeoparks(): Site[] {
  return sites.filter(
    (s) =>
      s.types.includes("national_geopark") ||
      s.types.includes("national_geopark_candidate") ||
      (s.types.includes("world_geopark") && s.province === "香港"),
  );
}

export const stats = {
  total: sites.length,
  national: sites.filter((s) => s.types.includes("national_geopark")).length,
  candidate: sites.filter(
    (s) =>
      s.types.includes("national_geopark_candidate") &&
      !s.types.includes("national_geopark"),
  ).length,
  world: sites.filter((s) => s.types.includes("world_geopark") && !s.unesco_parent_id).length,
  gssp: sites.filter((s) => s.types.includes("gssp")).length,
  iugs: sites.filter((s) => s.types.includes("iugs_geoheritage")).length,
  urban: sites.filter((s) => s.types.includes("urban_geosite")).length,
  complete: sites.filter((s) => s.content_status === "complete").length,
  standard: sites.filter((s) => s.content_status === "standard").length,
  placeholder: sites.filter((s) => s.content_status === "placeholder").length,
};

export const bundleMeta: Pick<CatalogBundle, "generated_on" | "sources_cutoff"> = {
  generated_on: "2026-04-20",
  sources_cutoff: DATA_CUTOFF,
};
