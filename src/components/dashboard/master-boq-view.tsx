"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type MasterBoQ = {
    id: string;
    status: string;
    total_estimated_cost: number;
    currency: string;
    created_at: string;
};

type BoQItem = {
    id: string;
    item_code: string;
    description: string;
    unit: string;
    quantity: number;
    category: string;
    specification_reference: string;
};

export function MasterBoQView({ projectId }: { projectId: string }) {
    const [boq, setBoq] = useState<MasterBoQ | null>(null);
    const [items, setItems] = useState<BoQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        async function fetchBoQ() {
            try {
                setLoading(true);
                // 1. Get Master BoQ
                const { data: boqData, error: boqError } = await supabase
                    .from("master_boq")
                    .select("*")
                    .eq("project_id", projectId)
                    .single();

                if (boqError && boqError.code !== "PGRST116") throw boqError; // PGRST116 is "Row not found"

                if (boqData) {
                    setBoq(boqData);
                    // 2. Get Items
                    const { data: itemsData, error: itemsError } = await supabase
                        .from("boq_items")
                        .select("*")
                        .eq("master_boq_id", boqData.id)
                        .order("item_code", { ascending: true });

                    if (itemsError) throw itemsError;
                    setItems(itemsData || []);
                }
            } catch (err: any) {
                console.error("Error fetching BoQ:", err);
                setError("Failed to load Bill of Quantities.");
            } finally {
                setLoading(false);
            }
        }

        fetchBoQ();
    }, [projectId]);

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>;
    }

    if (!boq) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-secondary/20 p-4 rounded-full mb-4">
                        <FileTextIcon className="h-8 w-8 text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Master BoQ Found</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Upload a blueprint or construction contract in the documents section to automatically generate the Golden Record.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Master Bill of Quantities</CardTitle>
                        <CardDescription>The single source of truth for project requirements.</CardDescription>
                    </div>
                    <Badge variant={boq.status === 'approved' ? 'default' : 'secondary'}>
                        {boq.status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                        <div>Created: <span className="font-medium text-foreground">{new Date(boq.created_at).toLocaleDateString()}</span></div>
                        <div>Items: <span className="font-medium text-foreground">{items.length}</span></div>
                        <div>Currency: <span className="font-medium text-foreground">{boq.currency}</span></div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Code</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="w-[150px]">Specs</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.item_code || "-"}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                                        <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={item.specification_reference || ""}>
                                            {item.specification_reference || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No items found in BoQ.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    )
}
