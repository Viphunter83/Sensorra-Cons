'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function awardTender(tenderId: string, bidId: string) {
    const supabase = await createClient()

    // 1. Auth Check (Must be Owner)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: tender } = await supabase
        .from('tenders')
        .select('owner_id')
        .eq('id', tenderId)
        .single()

    if (!tender || tender.owner_id !== user.id) {
        throw new Error('You can only award your own tenders')
    }

    // 2. Update Tender
    const { error } = await supabase
        .from('tenders')
        .update({
            status: 'awarded',
            winning_bid_id: bidId
        })
        .eq('id', tenderId)

    if (error) throw new Error('Failed to award tender')

    // 3. Create Audit Log (Notification)
    await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'TENDER_AWARDED',
        entity_id: tenderId,
        payload: { bid_id: bidId }
    })

    revalidatePath(`/tenders/${tenderId}`)
    revalidatePath('/dashboard')

    return { success: true }
}
