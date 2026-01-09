import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BidComparisonTable } from "@/components/tenders/bid-comparison-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function TenderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Fetch Tender (Base Data)
    const { data: tenderData, error: tenderError } = await supabase
        .from("tenders")
        .select("*")
        .eq("id", id)
        .single();

    // 2. Fetch Bids (Separately to isolate RLS issues)
    const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select(`
            id, price, comment, created_at, proposal_text, project_id,
            profiles (full_name, company_name)
        `)
        .eq("tender_id", id);

    // Cast to any to avoid TS inference issues
    const tender = tenderData as any;
    const bids = (bidsData || []) as any[];

    if (tenderError) {
        console.error("Error fetching tender:", tenderError);
        return (
            <div className="p-8 text-red-500 border border-red-200 bg-red-50 rounded-xl">
                <h3 className="font-bold">Error Loading Tender</h3>
                <p>Code: {tenderError.code}</p>
                <p>Message: {tenderError.message}</p>
            </div>
        );
    }

    if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        // Don't crash the page, just show a warning
    }
    if (!tender) {
        console.error("Tender not found (null result)");
        return (
            <div className="p-8 text-orange-500 border border-orange-200 bg-orange-50 rounded-xl">
                <h3 className="font-bold">Tender Not Found</h3>
                <p>The requested tender could not be found or you do not have permission to view it.</p>
                <p className="text-sm mt-2 text-muted-foreground">ID: {id}</p>
            </div>
        );
    }

    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user?.id === tender.owner_id;

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{tender.title}</h1>
                    <div className="flex gap-2">
                        <Badge variant="outline">{tender.zone_tag}</Badge>
                        <Badge className={`${tender.status === 'open' ? 'bg-green-500' : 'bg-blue-500'}`}>
                            {tender.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Budget Estimate</div>
                    <div className="text-2xl font-bold">{tender.budget_max} AED</div>
                </div>
            </div>

            {/* Scope */}
            <Card>
                <CardHeader>
                    <CardTitle>Scope of Work</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">
                    {tender.scope_of_work}
                </CardContent>
            </Card>

            {/* Decision Room (Owner Only) */}
            {isOwner && tender.status === 'open' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        🤖 AI Decision Room
                        <Badge variant="secondary" className="text-xs font-normal">Private</Badge>
                    </h2>
                    <BidComparisonTable tenderId={tender.id} bids={bids} />

                    {bids.length === 0 && !bidsError && (
                        <div className="text-sm text-muted-foreground italic">
                            No bids received yet.
                        </div>
                    )}
                    {bidsError && (
                        <div className="text-sm text-red-500">
                            Failed to load bids: {bidsError.message}
                        </div>
                    )}
                </div>
            )}

            {/* Awarded State */}
            {tender.status === 'awarded' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-green-800 mb-2">🎉 Contract Awarded</h2>
                    <p className="text-green-700">
                        This tender has been successfully awarded. The contractor has been notified.
                    </p>
                </div>
            )}
        </div>
    );
}
