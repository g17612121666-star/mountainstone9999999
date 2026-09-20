import diskExtrasJson from "../../../data/disk_extras.json";
import { shortName } from "./labels";
import { isDiagramCredit, isOwnCover, isRealPhoto } from "./safety";
import type { FieldPhoto, Geosite, LandformType, PhotoType, Site } from "./types";

type DiskExtra = { src: string; credit: string; caption: string; diagram?: boolean };

const DISK_EXTRAS = diskExtrasJson as Record<string, DiskExtra[]>;

const SAT_CREDIT = "Esri World Imagery";
const SAT_CAPTION = "卫星资料照片，非地面实拍";

/** Preferred analog donors: real field photos of the same process. Not Zhangye↔Danxia, not Zhangjiajie↔karst. */
const PREFERRED: Record<string, string[]> = {
  karst: ["shilin", "guilin-karst", "zhijindong", "shihuadong", "wulong", "jiuzhaigou", "huanglong"],
  danxia: ["danxiashan", "longhushan", "taining", "langshan", "chishui", "qiyunshan", "huoshizhai"],
  zhangjiajie_sandstone: ["zhangjiajie", "zhangshiyan"],
  granite_peak: ["huangshan", "sanqingshan", "taishan", "chayashan", "huashan"],
  volcano: ["wudalianchi", "changbaishan", "jingpohu", "weizhoudao", "tengchong", "huguangyan", "yandangshan"],
  yardang: ["dunhuang", "alxa", "zhada", "pingshanhu"],
  glacier: ["hailuogou", "yulongxueshan", "siguniang", "daguglacier"],
  loess: ["luochuan", "xixian-loess"],
  coast: ["hongkong", "dapeng", "dalian-coast", "pingtan"],
  fossil: ["chengjiang", "zhucheng", "shanwang", "zigong", "zhoukoudian"],
  stratigraphy: ["songshan", "jixian", "meishan", "taishan", "fangshan", "gssp-huangnitang"],
  geo_hazard: ["xiaonanhai", "cuihuashan", "longmenshan"],
  other: ["fangshan", "yesanpo", "lushan"],
  colorful_clastic: ["zhangye", "pingshanhu"],
};

const FAMILY_NOTE: Record<
  string,
  { zh: (d: string) => string; en: (d: string) => string }
> = {
  karst: {
    zh: (d) =>
      `下图为${d}的喀斯特溶蚀地貌，碳酸盐岩被水溶蚀的观感接近；到本园请先认灰岩与溶沟，勿当成丹霞红层或张家界那种石英砂岩峰林。`,
    en: (d) =>
      `Analog from ${d} (karst dissolution). At this park, identify limestone and solution features — not red-bed Danxia or Zhangjiajie-type quartz-sandstone pillars.`,
  },
  danxia: {
    zh: (d) =>
      `下图为${d}的丹霞赤壁，红层与垂直节理控制的观感接近；到本园请先认红层砂岩/砾岩与垂直节理，勿当成喀斯特溶蚀。`,
    en: (d) =>
      `Analog from ${d} (Danxia cliffs on red beds and joints). At this park, read the red beds and vertical joints — not karst dissolution.`,
  },
  zhangjiajie_sandstone: {
    zh: (d) =>
      `下图为${d}的石英砂岩峰林，近垂直节理控制崩塌；本类不是喀斯特，也不是丹霞山那种红层丹霞。`,
    en: (d) =>
      `Analog from ${d} (quartz-sandstone peak forest). This is not karst, and not red-bed Danxia of the Danxiashan type.`,
  },
  granite_peak: {
    zh: (d) =>
      `下图为${d}的花岗岩峰林，节理与球状风化观感接近；到本园请认花岗岩，勿当成喀斯特。`,
    en: (d) =>
      `Analog from ${d} (granite peaks, joints and spheroidal weathering). Identify granite here — not karst.`,
  },
  volcano: {
    zh: (d) =>
      `下图为${d}的火山岩地貌；到本园请认火山岩与喷发产物，不要把残丘或熔岩台地认成活火山，也不要把柱状节理海岸写成绳状熔岩。`,
    en: (d) =>
      `Analog from ${d} (volcanic landform). Identify volcanic rock here. A remnant hill or lava plateau is not an active volcano; columnar-jointed coast is not pahoehoe.`,
  },
  yardang: {
    zh: (d) =>
      `下图为${d}的雅丹，风蚀垄槽观感接近；到本园请认风蚀，勿当成流水切割的丹霞。`,
    en: (d) =>
      `Analog from ${d} (yardang, wind-eroded ridges). This is wind erosion — not fluvial Danxia.`,
  },
  glacier: {
    zh: (d) =>
      `下图为${d}的冰川/冰蚀地貌；到本园请认冰蚀与冰碛，勿走上未开放冰舌。`,
    en: (d) =>
      `Analog from ${d} (glacial landform). Identify ice-scour and till. Do not walk onto closed ice tongues.`,
  },
  loess: {
    zh: (d) =>
      `下图为${d}的黄土塬梁峁或剖面；到本园请认风成黄土，勿靠近陡坎壁根。`,
    en: (d) =>
      `Analog from ${d} (loess plateau / section). Identify wind-blown loess. Stay back from steep cut faces.`,
  },
  coast: {
    zh: (d) =>
      `下图为${d}的基岩海岸；到本园请先看潮汐，勿把海蚀柱认成喀斯特石林。`,
    en: (d) =>
      `Analog from ${d} (rocky coast). Check the tide. Sea stacks are not karst stone forest.`,
  },
  fossil: {
    zh: (d) =>
      `下图为${d}的化石产地保护现场，只看不挖；本园化石层同样禁止采集，不要把展示点当成可挖点。`,
    en: (d) =>
      `Analog from ${d} (protected fossil site). Look, do not collect. A display stop is not a digging site.`,
  },
  stratigraphy: {
    zh: (d) =>
      `下图为${d}的地层剖面或层型保护方式；到本园请认层序，禁止取样。`,
    en: (d) =>
      `Analog from ${d} (stratigraphic section / GSSP protection). Read the succession. No sampling.`,
  },
  geo_hazard: {
    zh: (d) =>
      `下图为${d}的地质灾害遗迹；遗迹本身不稳定，只走开放步道。`,
    en: (d) =>
      `Analog from ${d} (geo-hazard remains). The ground is still unstable. Stay on open paths.`,
  },
  other: {
    zh: (d) =>
      `下图为${d}的同类地貌对照；到本园请按本页岩石与构造识别，勿直接套用外园名称。`,
    en: (d) =>
      `Analog from ${d}. Identify rock and structure on this page — do not copy the other park’s name onto this one.`,
  },
  colorful_clastic: {
    zh: (d) =>
      `下图为${d}的干旱区彩色碎屑岩丘陵/雅丹对照；张掖彩丘不是丹霞山那种丹霞，请先认条带状泥岩、砂岩，勿当成喀斯特或丹霞赤壁。`,
    en: (d) =>
      `Analog from ${d} (arid colourful clastic hills / nearby yardang). Zhangye’s coloured hills are not Danxiashan-type Danxia. Read the banded mudstone and sandstone — not karst, not Danxia cliffs.`,
  },
};

const SITE_NOTE: Record<string, { zh: (d: string) => string; en: (d: string) => string }> = {
  zhangye: {
    zh: (d) =>
      `下图为${d}的干旱区风蚀/碎屑岩丘陵对照；张掖七彩丘是条带状泥岩与砂岩，不是丹霞山那种丹霞，也不是喀斯特。`,
    en: (d) =>
      `Analog from ${d}. Zhangye’s coloured hills are banded mudstone and sandstone — not Danxiashan-type Danxia, not karst.`,
  },
  zhangjiajie: {
    zh: (d) =>
      `下图为${d}的石英砂岩峰林对照；张家界是近垂直节理控制的砂岩柱，不是喀斯特，也不是丹霞红层。`,
    en: (d) =>
      `Analog from ${d}. Zhangjiajie is joint-controlled quartz-sandstone pillars — not karst, not red-bed Danxia.`,
  },
  xiqiaoshan: {
    zh: (d) =>
      `下图为${d}的火山岩地貌对照；西樵是古火山机构，不要写成绳状熔岩原位。`,
    en: (d) =>
      `Analog from ${d}. Xiqiao is an ancient volcanic edifice — do not describe it as in-situ pahoehoe.`,
  },
  sheshan: {
    zh: (d) =>
      `下图为${d}的火山岩地貌对照；佘山是晚白垩世碱性火山岩残丘，不是活火山，也不是上海的国家地质公园（上海国家地质公园在崇明岛）。`,
    en: (d) =>
      `Analog from ${d}. Sheshan is a Late Cretaceous alkaline volcanic remnant — not an active volcano, and not Shanghai’s national geopark (that is Chongming Island).`,
  },
};

export function isSatelliteCredit(credit: string): boolean {
  return /卫星|Esri World Imagery/i.test(credit || "");
}

export function classifyCover(site: Site): PhotoType {
  const credit = site.cover_credit || "";
  const caption = "";
  if (!isRealPhoto(site.cover_image)) return "other";
  if (isDiagramCredit(credit, caption)) return "map_or_diagram";
  if (/馆藏标本|标本，非野外|非野外露头/.test(credit) && !/不是展柜标本|原位/.test(credit)) {
    return "specimen";
  }
  if (isSatelliteCredit(credit)) return "satellite";
  if (/露头|剖面|保护廊|叠层石|骨床/.test(credit)) return "photo_outcrop";
  return "photo_landscape";
}

export function esriSatSrc(coords: [number, number], span = 0.04): string {
  const [lng, lat] = coords;
  const bbox = `${lng - span},${lat - span * 0.65},${lng + span},${lat + span * 0.65}`;
  const q = new URLSearchParams({
    bbox,
    bboxSR: "4326",
    imageSR: "4326",
    size: "1280,800",
    format: "jpg",
    f: "image",
  });
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?${q.toString()}`;
}

export function diskExtrasFor(id: string): DiskExtra[] {
  return DISK_EXTRAS[id] ?? [];
}

export function analogFamily(site: Site): string {
  if (site.id === "zhangye") return "colorful_clastic";
  const primary = site.landform_types[0] ?? "other";
  if (primary === "other") {
    const second = site.landform_types[1];
    if (second && second !== "danxia") return second;
  }
  return primary;
}

function donorName(donor: Site): { zh: string; en: string } {
  return {
    zh: shortName(donor.name) || donor.name,
    en: (donor.name_en || shortName(donor.name) || donor.id).replace(
      /UNESCO Global Geopark|National Geopark/gi,
      "",
    ).trim(),
  };
}

function analogNote(site: Site, donor: Site): { zh: string; en: string } {
  const { zh: dZh, en: dEn } = donorName(donor);
  const override = SITE_NOTE[site.id];
  if (override) return { zh: override.zh(dZh), en: override.en(dEn) };
  const fam = analogFamily(site);
  const tpl = FAMILY_NOTE[fam] ?? FAMILY_NOTE.other;
  return { zh: tpl.zh(dZh), en: tpl.en(dEn) };
}

function analogPhoto(site: Site, donor: Site): FieldPhoto {
  const note = analogNote(site, donor);
  const names = donorName(donor);
  return {
    src: donor.cover_image,
    credit: donor.cover_credit || "资料照片，非本站踏勘",
    caption: note.zh,
    kind: "analog",
    analog_from_id: donor.id,
    analog_from_name: names.zh,
    analog_from_name_en: names.en,
    analog_note_zh: note.zh,
    analog_note_en: note.en,
  };
}

function satellitePhoto(site: Site, span = 0.04): FieldPhoto {
  return {
    src: esriSatSrc(site.coordinates, span),
    credit: SAT_CREDIT,
    caption: SAT_CAPTION,
    kind: "satellite",
  };
}

function ownPhoto(src: string, credit: string, caption: string): FieldPhoto {
  return { src, credit, caption, kind: "own" };
}

function isUsableCover(site: Site | undefined): site is Site {
  if (!site) return false;
  if (!isOwnCover(site) || !isRealPhoto(site.cover_image)) return false;
  if (isSatelliteCredit(site.cover_credit || "")) return false;
  if (isDiagramCredit(site.cover_credit || "")) return false;
  return true;
}

function collectDonors(sites: Site[]): Map<string, Site[]> {
  const byFam = new Map<string, Site[]>();
  const preferredRank = new Map<string, number>();
  for (const [fam, ids] of Object.entries(PREFERRED)) {
    ids.forEach((id, i) => preferredRank.set(`${fam}:${id}`, i));
  }
  for (const s of sites) {
    if (!isUsableCover(s)) continue;
    const fam = analogFamily(s);
    const list = byFam.get(fam) ?? [];
    list.push(s);
    byFam.set(fam, list);
  }
  for (const [fam, list] of byFam) {
    list.sort((a, b) => {
      const ra = preferredRank.get(`${fam}:${a.id}`) ?? 50;
      const rb = preferredRank.get(`${fam}:${b.id}`) ?? 50;
      if (ra !== rb) return ra - rb;
      return a.id.localeCompare(b.id);
    });
  }
  return byFam;
}

function pickDonor(
  site: Site,
  donors: Map<string, Site[]>,
  usedSrc: Set<string>,
  offset = 0,
): Site | undefined {
  const fam = analogFamily(site);
  const pool = (donors.get(fam) ?? []).filter((d) => {
    if (d.id === site.id) return false;
    if (!d.cover_image || usedSrc.has(d.cover_image)) return false;
    if (d.cover_image === site.cover_image) return false;
    return true;
  });
  if (pool.length) return pool[offset % pool.length];
  return undefined;
}

export function mergeDiskExtras(site: Site): void {
  const extra = DISK_EXTRAS[site.id];
  if (!extra?.length) return;
  const have = new Set((site.gallery || []).map((g) => g.src));
  if (site.cover_image) have.add(site.cover_image);
  if (!Array.isArray(site.gallery)) site.gallery = [];
  for (const p of extra) {
    if (!p.src || have.has(p.src)) continue;
    have.add(p.src);
    if (p.diagram || isDiagramCredit(p.credit || "", p.caption || "")) {
      site.gallery.push({
        src: p.src,
        credit: p.credit,
        caption: p.caption || "示意图，不是现场照片",
      });
    } else {
      site.gallery.push({ src: p.src, credit: p.credit, caption: p.caption });
    }
  }
}

/**
 * Assign genesis (never the cover file) and stop photos (never the cover file).
 * Cover stays as-is. Related-site cards keep using each site's own cover.
 */
export function assignPhotoSlots(sites: Site[], geosites: Geosite[]): void {
  const donors = collectDonors(sites);
  const geositesBySite = new Map<string, Geosite[]>();
  for (const g of geosites) {
    const list = geositesBySite.get(g.site_id) ?? [];
    list.push(g);
    geositesBySite.set(g.site_id, list);
  }

  for (const site of sites) {
    site.cover_kind = classifyCover(site);
    const cover = isRealPhoto(site.cover_image) ? site.cover_image : "";
    const stopList = geositesBySite.get(site.id) ?? [];
    const used = new Set<string>();
    if (cover) used.add(cover);

    const uniqueStops = new Set<string>();
    for (const g of stopList) {
      if (isRealPhoto(g.photo) && g.photo !== cover) {
        used.add(g.photo);
        uniqueStops.add(g.photo);
        g.photo_kind = "own";
        if (!g.photo_credit) g.photo_credit = "";
      }
    }

    const ownCandidates = (site.gallery || []).filter((p) => {
      if (!p.src || used.has(p.src)) return false;
      if (!isRealPhoto(p.src)) return false;
      if (isDiagramCredit(p.credit || "", p.caption || "")) return false;
      return true;
    });

    const coverIsSat = site.cover_kind === "satellite";
    if (ownCandidates.length) {
      const p = ownCandidates[0];
      site.genesis = ownPhoto(p.src, p.credit, p.caption || "成因观察。资料照片，非本站踏勘");
      used.add(p.src);
    } else if (!coverIsSat && cover) {
      site.genesis = satellitePhoto(site, 0.035);
      used.add(site.genesis.src);
    } else {
      const donor = pickDonor(site, donors, used, 0);
      if (donor) {
        site.genesis = analogPhoto(site, donor);
        used.add(site.genesis.src);
      } else {
        site.genesis = satellitePhoto(site, coverIsSat ? 0.02 : 0.04);
        used.add(site.genesis.src);
      }
    }

    let stopIndex = 0;
    for (const g of stopList) {
      if (g.photo_kind === "own" && isRealPhoto(g.photo) && g.photo !== cover) continue;
      if (g.photo === cover) g.photo = "";
      const donor = pickDonor(site, donors, new Set([cover, site.genesis?.src || ""]), stopIndex);
      stopIndex += 1;
      if (donor) {
        const photo = analogPhoto(site, donor);
        g.photo = photo.src;
        g.photo_kind = "analog";
        g.photo_credit = photo.credit;
        g.analog_from_id = donor.id;
        g.analog_note_zh = photo.analog_note_zh;
        g.analog_note_en = photo.analog_note_en;
      } else if (site.genesis && site.genesis.kind === "satellite") {
        g.photo = esriSatSrc(g.coordinates?.length === 2 ? g.coordinates : site.coordinates, 0.02);
        g.photo_kind = "satellite";
        g.photo_credit = SAT_CREDIT;
      } else {
        g.photo = satellitePhoto(site, 0.022).src;
        g.photo_kind = "satellite";
        g.photo_credit = SAT_CREDIT;
      }
    }

    const seen = new Set<string>();
    site.gallery = (site.gallery || []).filter((p) => {
      if (!p.src || seen.has(p.src)) return false;
      seen.add(p.src);
      if (p.src === cover) return false;
      if (site.genesis && p.src === site.genesis.src) return false;
      if (uniqueStops.has(p.src)) return false;
      return true;
    });
  }
}

export function fieldPhotoFromGeosite(g: Geosite): FieldPhoto | undefined {
  if (!isRealPhoto(g.photo)) return undefined;
  const kind: FieldPhoto["kind"] = g.analog_from_id
    ? "analog"
    : g.photo_kind === "satellite"
      ? "satellite"
      : g.photo_kind === "analog"
        ? "analog"
        : "own";
  return {
    src: g.photo,
    credit: g.photo_credit || "",
    caption: g.analog_note_zh || "",
    kind,
    analog_from_id: g.analog_from_id,
    analog_note_zh: g.analog_note_zh,
    analog_note_en: g.analog_note_en,
  };
}

export type { LandformType };
