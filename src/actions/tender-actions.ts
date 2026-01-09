'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createTender(projectId: string, title: string, description: string, boqItemIds: string[]) {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();

    // 1. Get Property ID from Project
    const { data: project } = await supabase
        .from('projects')
        .select('property_id')
        .eq('id', projectId)
        .single();

    if (!project) throw new Error('Project not found');

    // 2. Create Tender
    const { data: tender, error } = await supabase
        .from('tenders')
        .insert({
            project_id: projectId,
            property_id: project.property_id,
            owner_id: user.data.user?.id,
            title: title,
            scope_of_work: description,
            status: 'open'
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // 3. Link BOQ Items (Scope)
    // We might need a junction table `tender_items` or similar if we want strict scope.
    // For now, we assume the AI just knows the scope from description or we add them later.
    // Let's keep it simple: The tender is general for the project for now.

    revalidatePath(`/projects/${projectId}`);
    return tender;
}

export async function inviteContractor(tenderId: string, email: string) {
    const supabase = await createClient();

    // Generate simple token
    const token = crypto.randomUUID();

    const { error } = await supabase
        .from('tender_invites')
        .insert({
            tender_id: tenderId,
            email: email,
            token: token
        });

    if (error) throw new Error(error.message);

    // In real app: await sendEmail(email, token);
    return { success: true, token }; // Return token for demo copy-paste
}

export async function submitBid(tenderId: string, amount: number, pdfUrl: string, items: any[]) {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();

    // 1. Create Bid
    const { data: bid, error } = await supabase
        .from('bids')
        .insert({
            tender_id: tenderId,
            contractor_id: user.data.user?.id,
            price: amount,
            pdf_url: pdfUrl
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // 2. Insert Bid Items
    if (items && items.length > 0) {
        const bidItems = items.map(item => ({
            bid_id: bid.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            master_item_id: item.master_item_id // Smart Matched ID
        }));

        const { error: itemsError } = await supabase
            .from('bid_items')
            .insert(bidItems);

        if (itemsError) console.error("Error inserting bid items", itemsError);
    }

    revalidatePath(`/tenders/${tenderId}`);
    return bid;
}

export async function getProjectTenders(projectId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('tenders')
        .select(`
            *,
            bids (
                count
            )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    return data || [];
}

export async function getTenderDetails(tenderId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('tenders')
        .select(`
            *,
            bids (
                *,
                profiles:contractor_id (email, full_name),
                bid_items (*)
            ),
            tender_invites (*)
        `)
        .eq('id', tenderId)
        .single();

    return data;
}
