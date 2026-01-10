import { createClient } from "@/utils/supabase/server";

export type VarianceResult = {
    masterItem: {
        id: string;
        description: string;
        quantity: number;
        unit: string;
        rate: number; // estimated rate from Master
    };
    bidItems: {
        contractorId: string;
        bidId: string;
        quantity: number;
        rate: number;
        total: number;
        flags: {
            quantityVariance: number; // percentage
            rateVariance: number; // percentage
            isOverScoped: boolean; // > 5% qty
            isOverPriced: boolean; // > 20% rate
        };
    }[];
};

export async function calculateVariance(tenderId: string): Promise<VarianceResult[]> {
    const supabase = await createClient();

    // 1. Get Tender & Project
    // 1. Get Tender & Project
    const { data: tender } = await supabase.from('tenders').select('project_id').eq('id', tenderId).single();
    if (!tender?.project_id) return [];

    // 2. Get Master BoQ Items
    const { data: masterBoq } = await supabase.from('master_boq').select('id').eq('project_id', tender.project_id).single();
    if (!masterBoq) return [];

    const { data: masterItems } = await supabase.from('boq_items').select('*').eq('master_boq_id', masterBoq.id);
    if (!masterItems) return [];

    // 3. Get All Bids & Bid Items
    const { data: bids } = await supabase.from('bids').select('id, contractor_id, price').eq('tender_id', tenderId);
    if (!bids || bids.length === 0) return [];

    const bidIds = bids.map(b => b.id);
    const { data: bidItems } = await supabase.from('bid_items').select('*').in('bid_id', bidIds);

    // 4. Group & Analyze
    const varianceReport: VarianceResult[] = [];

    for (const master of masterItems) {
        const relatedBidItems = [];

        for (const bid of bids) {
            // Find the item in this bid that maps to the master item
            // Logic: We rely on 'master_item_id' set during Smart Matching
            const match = bidItems?.find(bi => bi.bid_id === bid.id && bi.master_item_id === master.id);

            if (match) {
                const qtyVariance = ((match.quantity - master.quantity) / master.quantity) * 100;
                // Assuming we have rate in match.unit_price (if parsed). If null, can't calc rate var.
                // Master estimated_rate might also be null.
                const masterRate = master.estimated_rate || 0;
                const bidRate = match.unit_price || 0;

                let rateVariance = 0;
                if (masterRate > 0 && bidRate > 0) {
                    rateVariance = ((bidRate - masterRate) / masterRate) * 100;
                }

                relatedBidItems.push({
                    contractorId: bid.contractor_id,
                    bidId: bid.id,
                    quantity: match.quantity,
                    rate: bidRate,
                    total: match.total_price || (match.quantity * bidRate),
                    flags: {
                        quantityVariance: qtyVariance,
                        rateVariance: rateVariance,
                        isOverScoped: qtyVariance > 5,
                        isOverPriced: rateVariance > 20
                    }
                });
            }
        }

        varianceReport.push({
            masterItem: {
                id: master.id,
                description: master.description,
                quantity: master.quantity,
                unit: master.unit || '',
                rate: master.estimated_rate || 0
            },
            bidItems: relatedBidItems
        });
    }

    return varianceReport;
}
