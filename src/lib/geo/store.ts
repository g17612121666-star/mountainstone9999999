import { create } from "zustand";
import type { LandformType, SiteType } from "./types";

export type TicketFilter = "all" | "yes" | "no";
export type DepthFilter = "all" | "deep" | "standard";
export type TilePhase = "boot" | "loading" | "ready" | "error";

export interface MapFilters {
  query: string;
  types: SiteType[];
  landforms: LandformType[];
  province: string;
  ticket: TicketFilter;
  ageOn: boolean;
  ageStart: number;
  ageEnd: number;
  /** 深页 = content_status complete；短卡 = standard。 */
  depth: DepthFilter;
}

interface MapState {
  filters: MapFilters;
  selectedId: string | null;
  hoveredId: string | null;
  pile: MapPile | null;
  fly: MapFly | null;
  userAt: [number, number] | null;
  showRoutes: boolean;
  activeRouteId: string | null;
  tiles: TilePhase;
  tileNonce: number;
  setQuery: (query: string) => void;
  toggleType: (t: SiteType) => void;
  toggleLandform: (t: LandformType) => void;
  setLandforms: (landforms: LandformType[]) => void;
  setProvince: (province: string) => void;
  setTicket: (ticket: TicketFilter) => void;
  setAge: (on: boolean, start?: number, end?: number) => void;
  setDepth: (depth: DepthFilter) => void;
  resetFilters: () => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  openPile: (pile: MapPile) => void;
  clearPile: () => void;
  requestFly: (lat: number, lng: number, zoom: number) => void;
  setUserAt: (lngLat: [number, number] | null) => void;
  toggleRoutes: () => void;
  setShowRoutes: (on: boolean) => void;
  setActiveRoute: (id: string | null) => void;
  setTiles: (tiles: TilePhase) => void;
  reloadTiles: () => void;
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
  depth: "all",
};

export const useMapStore = create<MapState>((set) => ({
  filters: initial,
  selectedId: null,
  hoveredId: null,
  pile: null,
  fly: null,
  userAt: null,
  showRoutes: false,
  activeRouteId: null,
  tiles: "boot",
  tileNonce: 0,
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
  setLandforms: (landforms) => set((s) => ({ filters: { ...s.filters, landforms } })),
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
  setDepth: (depth) => set((s) => ({ filters: { ...s.filters, depth } })),
  resetFilters: () => set({ filters: initial }),
  select: (selectedId) => set({ selectedId, pile: null }),
  hover: (hoveredId) => set({ hoveredId }),
  openPile: (pile) => set({ pile, selectedId: null }),
  clearPile: () => set({ pile: null }),
  requestFly: (lat, lng, zoom) => set((s) => ({ fly: { lat, lng, zoom, n: (s.fly?.n ?? 0) + 1 } })),
  setUserAt: (userAt) => set({ userAt }),
  toggleRoutes: () => set((s) => ({ showRoutes: !s.showRoutes })),
  setShowRoutes: (showRoutes) => set({ showRoutes }),
  setActiveRoute: (activeRouteId) =>
    set((s) => ({
      activeRouteId,
      showRoutes: activeRouteId ? true : s.showRoutes,
    })),
  setTiles: (tiles) => set({ tiles }),
  reloadTiles: () => set((s) => ({ tileNonce: s.tileNonce + 1, tiles: "loading" })),
}));
