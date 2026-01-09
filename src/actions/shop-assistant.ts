'use server';

import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.PROXY_API_KEY!,
    baseURL: process.env.PROXY_BASE_URL,
});

interface SearchResult {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    image_url: string;
    dimensions: { l: number; w: number; h: number };
    score: number;
}

export async function searchCatalog(query: string, spaceId: string): Promise<SearchResult[]> {
    const supabase = await createClient();

    // 1. Get Space Constraints
    const { data: space, error: spaceError } = await supabase
        .from('spaces')
        .select('dimensions')
        .eq('id', spaceId)
        .single();

    if (spaceError || !space) {
        console.error("Error fetching space:", spaceError);
        throw new Error("Space not found");
    }

    const roomDims = space.dimensions as { l: number; w: number; h: number };

    // 2. If query is empty, return "Recent/Featured" items (bypass AI)
    if (!query || query.trim() === '') {
        const { data: recentItems, error: recentError } = await supabase
            .from('catalog_items')
            .select('*')
            .limit(20);

        if (recentError) {
            console.error("Error fetching recent items:", recentError);
            return [];
        }

        // Map to SearchResult
        return recentItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            category: item.category || 'Furniture',
            image_url: item.image_url,
            dimensions: item.dimensions,
            score: 1.0
        }));
    }

    // 3. Generate Embedding for Query
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
    });

    // ... rest of vector search logic ...

    const embedding = embeddingResponse.data[0].embedding;

    // 3. Search Catalog via RPC
    const { data: items, error: searchError } = await supabase.rpc('search_catalog_items', {
        query_embedding: embedding,
        match_threshold: 0.5, // Adjust based on quality needed
        match_count: 20
    });

    if (searchError) {
        console.error("Vector search error:", searchError);
        throw new Error("Failed to search catalog");
    }

    // 4. "Physics Check" & Hydrate Dimensions
    // RPC currently returns id, name, description, price, image_url. 
    // We need dimensions too. The RPC in migration didn't select dimensions. 
    // Fixing this by fetching full details for the IDs found, OR updating RPC (harder now).
    // Better: Fetch full details for these items.

    if (!items || items.length === 0) return [];

    const itemIds = items.map((i: any) => i.id);
    const { data: fullItems, error: itemsError } = await supabase
        .from('catalog_items')
        .select('*') // Get everything including dimensions
        .in('id', itemIds);

    if (itemsError) {
        console.error("Error fetching item details:", itemsError);
        return [];
    }

    // Filter by logic: Item must fit in the room (Simple bounding box check)
    // Constraint: Item L/W/H < Room L/W/H
    // In reality, this is complex (rotations), but for v1:
    // Max dimension of item < Max dimension of room
    const validItems = fullItems.filter((item: any) => {
        const iDim = item.dimensions || { l: 0, w: 0, h: 0 };
        // Check if item fits in room at all
        const fits = iDim.l <= roomDims.l && iDim.w <= roomDims.w && iDim.h <= roomDims.h;
        // Also could rotate, so maybe check max(iDim) <= max(roomDims) etc.
        // Let's keep it strict "fits as oriented" for now for simplicity, or slightly looser.
        // Let's assume user query "Sofa" implies general fit.
        // The prompt says: "Physics Check... ensure item fits simple logic".
        return fits;
    });

    // Map back to result structure
    // We want to preserve the "score" from RPC if possible, but we lost map order.
    // Let's re-merge score.
    const results: SearchResult[] = validItems.map((item: any) => {
        const originalMatch = items.find((i: any) => i.id === item.id);
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            category: item.category || 'Furniture', // Default if missing
            image_url: item.image_url,
            dimensions: item.dimensions,
            score: originalMatch?.similarity || 0
        };
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}
