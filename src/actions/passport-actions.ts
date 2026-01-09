'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { PlacedItem } from '@/components/3d/space-viewer';

// 1. Get Public Project Data (The "Passport" View)
export async function getPublicProject(token: string) {
    const supabase = await createClient(); // This uses standard user auth, which might be anon.

    // Logic: Find project by token.
    // Since we added RLS "Public view projects: If is_public", we first need to verify the token matches.
    // Actually, RLS relies on 'is_public' column. The token is mostly for URL obfuscation.
    // BUT, if the user is anonymous, they need RLS to pass.

    // Step A: Find the project ID for this token (Admin/Service level might be needed if RLS blocks finding it first)
    // However, if we set is_public=true, standard select works.

    const { data: project, error } = await supabase
        .from('projects')
        .select(`
            *,
            properties (address, type, size_sqm),
            spaces (
                id, 
                name, 
                model_url, 
                dimensions,
                design_boards (
                    id, items
                )
            ),
            timeline_events (*)
        `)
        .eq('public_access_token', token)
        .eq('is_public', true)
        .single();

    if (error || !project) {
        // Token invalid or project not public
        return null;
    }

    return project;
}

// 2. Enable Public Access (Generate Token)
export async function enablePassport(projectId: string) {
    const supabase = await createClient();
    const token = crypto.randomUUID();

    const { error } = await supabase
        .from('projects')
        .update({
            public_access_token: token,
            is_public: true
        })
        .eq('id', projectId);

    if (error) throw new Error(error.message);
    revalidatePath(`/projects/${projectId}`);
    return token;
}

// 3. Add Timeline Event
export async function addTimelineEvent(projectId: string, title: string, category: string, description?: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('timeline_events')
        .insert({
            project_id: projectId,
            title,
            category,
            description,
            event_date: new Date().toISOString()
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/projects/${projectId}`);
}
