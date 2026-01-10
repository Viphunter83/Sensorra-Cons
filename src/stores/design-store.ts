import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CatalogItem } from '../components/3d/space-viewer';

// Types using tuples for R3F compatibility
export type Vector3 = [number, number, number];

export interface PlacedItem {
    id: string;
    catalog_item_id: string; // Snake case to match DB/SpaceViewer
    modelUrl: string; // Helper for viewer
    position: Vector3;
    rotation: Vector3;
    dimensions?: { l: number; w: number; h: number };
    aiSource?: string; // If auto-replaced by AI
    catalog_item?: CatalogItem; // Hydrated data
}

export interface DesignState {
    // Scene Graph
    items: Record<string, PlacedItem>;

    // AI State
    viewMode: 'edit' | 'dream' | 'source';
    dreamImageUrl: string | null;
    isDreaming: boolean;
    depthMapUrl: string | null;

    // Actions
    actions: {
        addItem: (item: PlacedItem) => void;
        updateItemPosition: (id: string, pos: Vector3) => void;
        updateItemRotation: (id: string, rot: Vector3) => void;
        removeItem: (id: string) => void;
        setDreamImage: (url: string | null) => void;
        setDepthMap: (url: string | null) => void;
        setViewMode: (mode: 'edit' | 'dream' | 'source') => void;
        setIsDreaming: (isDreaming: boolean) => void;
    }
}

export const useDesignStore = create<DesignState>()(
    immer((set) => ({
        items: {},
        viewMode: 'edit',
        dreamImageUrl: null,
        isDreaming: false,
        depthMapUrl: null,

        actions: {
            addItem: (item) =>
                set((state) => {
                    state.items[item.id] = item;
                }),
            updateItemPosition: (id, pos) =>
                set((state) => {
                    if (state.items[id]) {
                        state.items[id].position = pos;
                    }
                }),
            updateItemRotation: (id, rot) =>
                set((state) => {
                    if (state.items[id]) {
                        state.items[id].rotation = rot;
                    }
                }),
            removeItem: (id) =>
                set((state) => {
                    delete state.items[id];
                }),
            setDreamImage: (url) =>
                set((state) => {
                    state.dreamImageUrl = url;
                }),
            setDepthMap: (url) =>
                set((state) => {
                    state.depthMapUrl = url;
                }),
            setViewMode: (mode) =>
                set((state) => {
                    state.viewMode = mode;
                }),
            setIsDreaming: (status) =>
                set((state) => {
                    state.isDreaming = status;
                }),
        },
    }))
);
