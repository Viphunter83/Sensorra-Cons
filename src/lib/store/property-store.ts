import { create } from 'zustand'

interface PropertyState {
    selectedZone: string | null
    searchQuery: string
    setZone: (zone: string | null) => void
    setSearch: (query: string) => void
}

export const usePropertyStore = create<PropertyState>((set) => ({
    selectedZone: null,
    searchQuery: '',
    setZone: (zone) => set({ selectedZone: zone }),
    setSearch: (query) => set({ searchQuery: query }),
}))
