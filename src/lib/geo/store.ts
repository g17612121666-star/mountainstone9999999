import { create } from "zustand";
import type { LandformType, SiteType } from "./types";

export type TicketFilter = "all" | "yes" | "no";

export interface MapFilters {
  query: string;
  types: SiteType[];
  landforms: LandformType[];
  province: string;
  ticket: TicketFilter;
  ageOn: boolean;
  ageStart: number;
  ageEnd: number;
}

interface MapState {
  filters: MapFilters;
  selectedId: string | null;
  hoveredId: string | null;
  pile: MapPile | null;
  fly: MapFly | null;
  userAt: [number, number] | null;
  setQuery: (query: string) => void;
  toggleType: (t: SiteType) => void;
  toggleLandform: (t: LandformType) => void;
  setProvince: (province: string) => void;
  setTicket: (ticket: TicketFilter) => void;
  setAge: (on: boolean, start?: number, end?: number) => void;
  resetFilters: () => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  openPile: (pile: MapPile) => void;
  clearPile: () => void;
  requestFly: (lat: number, lng: number, zoom: number) => void;
  setUserAt: (lngLat: [number, number] | null) => void;
}

export interface MapPile {
  kind: "cluster" | "nearby";
  ids: string[];
  /** [lat, lng] */
  at?: [number, number];
}

export interface MapFly {
  lat: number;
  lng: number;
  zoom: number;
  n: number;
}

const initial: MapFilters = {
  query: "",
  types: [],
  landforms: [],
  province: "",
  ticket: "all",
  ageOn: false,
  ageStart: 0,
  ageEnd: 2500,
};

export const useMapStore = create<MapState>((set) => ({
  filters: initial,
  selectedId: null,
  hoveredId: null,
  pile: null,
  fly: null,
  userAt: null,
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  toggleType: (t) =>
    set((s) => ({
      filters: {
        ...s.filters,
        types: s.filters.types.includes(t)
          ? s.filters.types.filter((x) => x !== t)
          : [...s.filters.types, t],
      },
    })),
  toggleLandform: (t) =>
    set((s) => ({
      filters: {
        ...s.filters,
        landforms: s.filters.landforms.includes(t)
          ? s.filters.landforms.filter((x) => x !== t)
          : [...s.filters.landforms, t],
      },
    })),
  setProvince: (province) => set((s) => ({ filters: { ...s.filters, province } })),
  setTicket: (ticket) => set((s) => ({ filters: { ...s.filters, ticket } })),
  setAge: (ageOn, ageStart, ageEnd) =>
    set((s) => ({
      filters: {
        ...s.filters,
        ageOn,
        ageStart: ageStart ?? s.filters.ageStart,
        ageEnd: ageEnd ?? s.filters.ageEnd,
      },
    })),
  resetFilters: () => set({ filters: initial }),
  select: (selectedId) => set({ selectedId, pile: null }),
  hover: (hoveredId) => set({ hoveredId }),
  openPile: (pile) => set({ pile, selectedId: null }),
  clearPile: () => set({ pile: null }),
  requestFly: (lat, lng, zoom) => set((s) => ({ fly: { lat, lng, zoom, n: (s.fly?.n ?? 0) + 1 } })),
  setUserAt: (userAt) => set({ userAt }),
}));
