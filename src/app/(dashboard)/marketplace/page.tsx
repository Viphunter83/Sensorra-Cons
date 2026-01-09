import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceBidDialog } from "@/components/tenders/place-bid-dialog";
import { DollarSign, MapPin } from "lucide-react";

export default async function MarketplacePage() {
    const supabase = await createClient();

    // Fetch OPEN tenders
    const { data: tenders } = await supabase
        .from("tenders")
        .select(`
            *,
            properties (title, address_data)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Contractor Marketplace</h2>
                    <p className="text-muted-foreground">Find new jobs and place bids on active tenders.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(tenders as any[])?.map((tender) => (
                    <Card key={tender.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="mb-2">
                                    {tender.zone_tag || 'General'}
                                </Badge>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                    Est. {tender.budget_max} AED
                                </Badge>
                            </div>
                            <CardTitle className="text-lg">{tender.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {(tender.properties as any)?.title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-sm text-foreground/80 bg-muted/50 p-3 rounded-md min-h-[80px]">
                                {tender.scope_of_work?.substring(0, 150)}...
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <div className="w-full flex justify-between items-center">
                                <div className="text-xs text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Property Location
                                </div>
                                <PlaceBidDialog tenderId={tender.id} tenderTitle={tender.title} />
                            </div>
                        </CardFooter>
                    </Card>
                ))}

                {tenders?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 dashed rounded-xl">
                        No active tenders found.
                    </div>
                )}
            </div>
        </div>
    );
}
