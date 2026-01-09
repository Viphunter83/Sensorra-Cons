import React from 'react';
import { getTenderDetails } from '@/actions/tender-actions';
import { createClient } from '@/utils/supabase/server';
import { TenderOwnerView } from '@/components/tenders/tender-owner-view';
import { TenderContractorView } from '@/components/tenders/tender-contractor-view';

export default async function TenderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tender = await getTenderDetails(id);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!tender) return <div>Tender not found</div>;

    const isOwner = user?.id === tender.owner_id;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">{tender.title}</h1>
            <div className="flex items-center gap-4 mb-8 text-sm text-slate-500">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{tender.status}</span>
                <span>Created {new Date(tender.created_at).toLocaleDateString()}</span>
            </div>

            {isOwner ? (
                <TenderOwnerView tender={tender} />
            ) : (
                <TenderContractorView tender={tender} userId={user?.id} />
            )}
        </div>
    );
}
