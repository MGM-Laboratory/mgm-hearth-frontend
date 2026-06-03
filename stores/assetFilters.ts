"use client";

import { create } from "zustand";
import type { AssetListFilters } from "@/lib/api/hooks/assets";

interface AssetFiltersState {
  filters: AssetListFilters;
  setFilters: (next: AssetListFilters) => void;
  reset: () => void;
}

export const useAssetFiltersStore = create<AssetFiltersState>((set) => ({
  filters: {},
  setFilters: (next) => set({ filters: next }),
  reset: () => set({ filters: {} }),
}));
