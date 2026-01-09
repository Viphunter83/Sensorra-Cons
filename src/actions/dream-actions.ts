'use server';

import { createClient } from '@/utils/supabase/server';
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
    description?: string;
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

export async function generateRoomDesign(prompt: string): Promise<DreamResult> {
    const supabase = await createClient();
    const p = prompt.toLowerCase();

    // 1. Identify intent/keywords
    // Simple keyword mapping for MVP
    let queries: string[] = [];

    if (p.includes('sofa') || p.includes('living')) {
        queries.push('sofa');
        queries.push('lamp'); // Always adding a lamp for vibe
    } else if (p.includes('work') || p.includes('office')) {
        queries.push('desk');
        queries.push('chair');
    } else if (p.includes('bed') || p.includes('sleep')) {
        queries.push('bed');
        queries.push('nightstand');
    } else {
        // Default fun mix
        queries.push('chair');
        queries.push('table');
    }

    // 2. Fetch Items from Real DB
    const items: DreamPlacedItem[] = [];

    // We fetch one item per query keyword to build the room
    // Promise.all for parallelism
    const foundItems = await Promise.all(
        queries.map(async (q) => {
            const { data } = await supabase
                .from('catalog_items')
                .select('*')
                .ilike('name', `%${q}%`)
                .not('model_url', 'is', null) // Ensure we only get items with 3D models
                .limit(1); // Just grab the first match for now ("I'm feeling lucky")
            return data?.[0] as DreamCatalogItem | undefined;
        })
    );

    // 3. Arrange Items in Space ("The Reality Anchor")
    let zOffset = 0;

    foundItems.forEach((catItem, index) => {
        if (!catItem) return;

        items.push({
            id: uuidv4(),
            catalog_item_id: catItem.id,
            position: [index * 1.5 - 1, 0, zOffset], // Simple layout: side by side
            rotation: [0, 0, 0],
            catalog_item: catItem
        });
    });

    // Fallback if DB is empty or no matches (Hallucinate from hardcoded backup if needed? 
    // No, let's be honest and return empty or error to encourage seeding)
    if (items.length === 0) {
        return {
            success: false,
            message: "AI found no matching real-world items. Try 'sofa' or 'chair'.",
            items: []
        };
    }

    return {
        success: true,
        items
    };
}
