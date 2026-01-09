import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Users } from "lucide-react";

export default async function TendersListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current User ID:', user?.id);


    if (!user) {
        return <div className="p-8">Please log in.</div>;
    }

    // Fetch tenders owned by user
    const { data: tenders } = await supabase
        .from("tenders")
        .select(`
            *
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

    // Force cast to avoid TS inference issues with joins/_count
    const typedTenders = (tenders || []) as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Tenders</h2>
                    <p className="text-muted-foreground">Manage your requests and review bids.</p>
                    <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        DEBUG INFO:<br />
                        User ID: {user.id}<br />
                        Tenders Found: {typedTenders.length}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {typedTenders.map((tender) => (
                    <Card key={tender.id} className="flex flex-col hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={tender.status === 'open' ? 'default' : 'secondary'}>
                                    {tender.status.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(tender.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{tender.title}</CardTitle>
                            <CardDescription>
                                {tender.zone_tag || 'General'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1.5" />
                                    {/* Count removed for debug */} Bids
                                </div>
                                <div>
                                    Est. {tender.budget_max} AED
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Button className="w-full" variant="outline" asChild>
                                <Link href={`/tenders/${tender.id}`}>
                                    Manage & Review
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {typedTenders.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium">No Tenders Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">Create a tender from the 3D Property View.</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/">Go to Properties</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
