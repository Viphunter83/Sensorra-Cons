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
    revalidatePath(`/projects/${projectId}/design`);
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
