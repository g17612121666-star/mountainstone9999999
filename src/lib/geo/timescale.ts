export interface EraChip {
  id: string;
  zh: string;
  en: string;
  start: number;
  end: number;
}

/** ICS-style bins, Ma, used by the map/catalog age filter. */
export const TIMESCALE: EraChip[] = [
  { id: "archean", zh: "太古宙", en: "Archean", start: 2500, end: 4000 },
  { id: "paleoproterozoic", zh: "古元古代", en: "Paleoproterozoic", start: 1600, end: 2500 },
  { id: "mesoproterozoic", zh: "中元古代", en: "Mesoproterozoic", start: 1000, end: 1600 },
  { id: "neoproterozoic", zh: "新元古代", en: "Neoproterozoic", start: 538.8, end: 1000 },
  { id: "cambrian", zh: "寒武纪", en: "Cambrian", start: 485.4, end: 538.8 },
  { id: "ordovician", zh: "奥陶纪", en: "Ordovician", start: 443.8, end: 485.4 },
  { id: "silurian", zh: "志留纪", en: "Silurian", start: 419.2, end: 443.8 },
  { id: "devonian", zh: "泥盆纪", en: "Devonian", start: 358.9, end: 419.2 },
  { id: "carboniferous", zh: "石炭纪", en: "Carboniferous", start: 298.9, end: 358.9 },
  { id: "permian", zh: "二叠纪", en: "Permian", start: 251.9, end: 298.9 },
  { id: "triassic", zh: "三叠纪", en: "Triassic", start: 201.4, end: 251.9 },
  { id: "jurassic", zh: "侏罗纪", en: "Jurassic", start: 145, end: 201.4 },
  { id: "cretaceous", zh: "白垩纪", en: "Cretaceous", start: 66, end: 145 },
  { id: "paleogene", zh: "古近纪", en: "Paleogene", start: 23.03, end: 66 },
  { id: "neogene", zh: "新近纪", en: "Neogene", start: 2.58, end: 23.03 },
  { id: "quaternary", zh: "第四纪", en: "Quaternary", start: 0, end: 2.58 },
];
