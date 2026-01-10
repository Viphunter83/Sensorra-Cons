'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProjectSpaces(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('project_id', projectId);

    if (error) throw error;
    return data;
}

export async function createDefaultSpace(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('spaces')
        .insert({
            project_id: projectId,
            name: 'Main Room',
            dimensions: { l: 6, w: 5, h: 3 }
        })
        .select()
        .single();

    if (error) throw error;
    // revalidatePath(`/projects/${projectId}/design`); // Removed to allow server-side calls during render
    return data;
}

export async function getDesignBoard(spaceId: string) {
    const supabase = await createClient();
    // Get latest or specific board. For now, we assume one board per space or just storing items in the last board.
    // Actually, simplified: Get the *first* design board for space, or create one.
    const { data: boards } = await supabase
        .from('design_boards')
        .select('*')
        .eq('space_id', spaceId)
        .limit(1);

    if (boards && boards.length > 0) {
        return boards[0];
    }

    // Create new if none
    const { data: newBoard, error } = await supabase
        .from('design_boards')
        .insert({ space_id: spaceId, name: 'Untitled Design' })
        .select()
        .single();

    if (error) throw error;
    return newBoard;
}

export async function saveDesignItems(boardId: string, items: any[]) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('design_boards')
        .update({ items: items })
        .eq('id', boardId);

    if (error) throw error;
}
import { generateEmbedding, describeImageForSearch, analyzeDocument } from '@/lib/ai/analyzer';

export interface SimilarItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    similarity: number;
}

export async function findSimilarItems(imageBase64: string, category?: string): Promise<{ success: boolean; data?: SimilarItem[]; error?: string }> {
    const supabase = await createClient();

    try {
        // 1. Describe the image using Vision AI
        console.log("Analyzing image...", imageBase64.substring(0, 50));
        const description = await describeImageForSearch(imageBase64);
        console.log("Generated Description:", description);

        // 2. Generate Embedding from description
        console.log("Generating embedding...");
        const embedding = await generateEmbedding(description);

        // 3. Search Catalog
        console.log("Searching catalog...");

        // Note: RPC call requires verified function in DB.
        const { data, error } = await supabase.rpc('search_catalog_items', {
            query_embedding: embedding,
            match_threshold: 0.5, // Adjust as needed
            match_count: 5,
            filter_category: category || null
        });

        if (error) {
            console.error("Supabase RPC error:", error);
            throw new Error(error.message);
        }

        return { success: true, data: data as SimilarItem[] };

    } catch (err: any) {
        console.error("Reverse Sourcing Failed:", err);
        return { success: false, error: err.message };
    }
}
