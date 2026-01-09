'use server';

import { v4 as uuidv4 } from 'uuid';

// Types duplicated from SpaceViewer for simplicity in this MVP phase
// Ideally should be in a shared types file
export interface DreamCatalogItem {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    dimensions: { l: number; w: number; h: number };
    model_url?: string;
    image_url?: string;
}

export interface DreamPlacedItem {
    id: string;
    catalog_item_id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    catalog_item?: DreamCatalogItem;
}

export interface DreamResult {
    success: boolean;
    message?: string;
    items: DreamPlacedItem[];
}

// HARDCODED "MAGIC" CATALOG
const CATALOG: Record<string, DreamCatalogItem> = {
    'japandi-sofa': {
        id: 'japandi-sofa',
        name: 'Kyoto Low Sofa',
        category: 'Sofa',
        price: 1200,
        currency: 'USD',
        dimensions: { l: 2.2, w: 0.9, h: 0.7 },
        // Using a placeholder box for now, in real life this is a GLB URL
        model_url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sofa-draco.glb',
    },
    'paper-lamp': {
        id: 'paper-lamp',
        name: 'Noguchi Floor Lamp',
        category: 'Lighting',
        price: 450,
        currency: 'USD',
        dimensions: { l: 0.5, w: 0.5, h: 1.6 },
        // Using a placeholder or potentially a real GLB if available
        model_url: '',
    },
    'industrial-table': {
        id: 'industrial-table',
        name: 'Steel Raw Table',
        category: 'Table',
        price: 890,
        currency: 'USD',
        dimensions: { l: 2.0, w: 1.0, h: 0.75 },
        model_url: '',
    },
    'eames-chair': {
        id: 'eames-chair',
        name: 'Eames Lounge Copy',
        category: 'Chair',
        price: 350,
        currency: 'USD',
        dimensions: { l: 0.8, w: 0.8, h: 0.9 },
        model_url: '',
    }
};

export async function generateRoomDesign(prompt: string): Promise<DreamResult> {
    // 1. Simulate AI Thinking Time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const p = prompt.toLowerCase();
    const items: DreamPlacedItem[] = [];

    // 2. "AI" Logic (Hallucination)
    if (p.includes('japandi') || p.includes('zen') || p.includes('minimal')) {
        // Layout: Sofa in center, Lamp in corner
        items.push({
            id: uuidv4(),
            catalog_item_id: 'japandi-sofa',
            position: [0, 0, -1], // Back a bit
            rotation: [0, 0, 0],
            catalog_item: CATALOG['japandi-sofa']
        });
        items.push({
            id: uuidv4(),
            catalog_item_id: 'paper-lamp',
            position: [2, 0, -2], // Corner
            rotation: [0, -0.5, 0], // Slightly Angled
            catalog_item: CATALOG['paper-lamp']
        });
    } else if (p.includes('industrial') || p.includes('loft') || p.includes('dark')) {
        items.push({
            id: uuidv4(),
            catalog_item_id: 'industrial-table',
            position: [0, 0, 0], // Center
            rotation: [0, 0, 0],
            catalog_item: CATALOG['industrial-table']
        });
        items.push({
            id: uuidv4(),
            catalog_item_id: 'eames-chair',
            position: [0, 0, 1.5], // In front of table
            rotation: [0, 3.14, 0], // Facing table
            catalog_item: CATALOG['eames-chair']
        });
    } else {
        // Default "Chaotic" Dream
        items.push({
            id: uuidv4(),
            catalog_item_id: 'japandi-sofa',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            catalog_item: CATALOG['japandi-sofa']
        });
    }

    return {
        success: true,
        items
    };
}
