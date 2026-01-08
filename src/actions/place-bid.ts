'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface PlaceBidParams {
    tenderId: string
    price: number
    comment: string
}

export async function placeBid({ tenderId, price, comment }: PlaceBidParams) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('bids')
        .insert({
            tender_id: tenderId,
            contractor_id: user.id,
            price,
            comment
        })

    if (error) {
        console.error('Bid Error:', error)
        throw new Error('Failed to place bid')
    }

    revalidatePath('/marketplace')
    return { success: true }
}
