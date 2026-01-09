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

// 1. Template Definition
const ROOM_TEMPLATES: Record<string, { query: string; items: { keyword: string; pos: [number, number, number]; rot: [number, number, number] }[] }> = {
    'office': {
        query: 'office',
        items: [
            { keyword: 'Desk', pos: [0, 0, 0], rot: [0, 0, 0] },
            { keyword: 'Chair', pos: [0, 0, 1], rot: [0, 3.14, 0] }, // Facing desk
            { keyword: 'Lamp', pos: [0.8, 0.8, -0.2], rot: [0, 0, 0] } // On desk (approx height)
        ]
    },
    'living': {
        query: 'living',
        items: [
            { keyword: 'Sofa', pos: [0, 0, -2], rot: [0, 0, 0] },
            { keyword: 'Table', pos: [0, 0, 0], rot: [0, 0, 0] }, // Coffee table
            { keyword: 'Lamp', pos: [2, 0, -2], rot: [0, 0, 0] }, // Floor lamp
            { keyword: 'Chair', pos: [-1.5, 0, 0], rot: [0, 1.57, 0] } // Side chair
        ]
    },
    'bedroom': {
        query: 'bed',
        items: [
            { keyword: 'Bed', pos: [0, 0, -1], rot: [0, 0, 0] },
            { keyword: 'Nightstand', pos: [1.2, 0, -1], rot: [0, 0, 0] },
            { keyword: 'Lamp', pos: [1.2, 0.6, -1], rot: [0, 0, 0] }
        ]
    }
};

export async function generateRoomDesign(prompt: string): Promise<DreamResult> {
    const supabase = await createClient();
    const p = prompt.toLowerCase();

    // 1. Determine Template
    let templateKey = 'living'; // Default
    if (p.includes('office') || p.includes('work') || p.includes('desk')) templateKey = 'office';
    else if (p.includes('bed') || p.includes('sleep')) templateKey = 'bedroom';

    const template = ROOM_TEMPLATES[templateKey];
    console.log(`[DreamEngine] Selected Template: ${templateKey}`);

    // 2. Resolve Items for Template
    const items: DreamPlacedItem[] = [];

    // Map template items to catalog queries
    const resolvedItems = await Promise.all(
        template.items.map(async (tmplItem) => {
            const { data } = await supabase
                .from('catalog_items')
                .select('*')
                .ilike('name', `%${tmplItem.keyword}%`)
                .not('model_url', 'is', null)
                .limit(1);

            const catItem = data?.[0] as any; // Cast for TS
            if (!catItem) {
                console.warn(`[DreamEngine] Missing catalog item for keyword: ${tmplItem.keyword}`);
                return null;
            }

            return {
                id: uuidv4(),
                catalog_item_id: catItem.id,
                position: tmplItem.pos,
                rotation: tmplItem.rot,
                catalog_item: catItem
            };
        })
    );

    // Filter nulls
    resolvedItems.forEach(item => {
        if (item) items.push(item);
    });

    if (items.length === 0) {
        return {
            success: false,
            message: "Could not match design to available catalog items.",
            items: []
        };
    }

    return {
        success: true,
        items
    };
}
