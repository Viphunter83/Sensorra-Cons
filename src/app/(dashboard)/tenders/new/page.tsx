"use client";

import { createClient } from "@/utils/supabase/client";
import { createTender } from "@/actions/manage-tender";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateTenderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [properties, setProperties] = useState<{ id: string, title: string }[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        scope: "",
        budget: "",
        propertyId: ""
    });

    // Fetch properties on mount
    useEffect(() => {
        const fetchProperties = async () => {
            const supabase = createClient();
            const { data } = await supabase.from('properties').select('id, title');
            if (data) {
                setProperties(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, propertyId: data[0].id }));
                }
            }
        };
        fetchProperties();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            // In a real app we'd fetch the user's properties to select one
            // Here we might need a workaround if we don't have a property ID handy
            // For now, let's assume there's a default property or let user enter ID for debug
            const res = await createTender({
                title: formData.title,
                scope_of_work: formData.scope,
                budget_max: Number(formData.budget),
                property_id: formData.propertyId,
                zone_tag: "General"
            });

            router.push(`/tenders/${res.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create tender. Make sure you have a property.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Tender</CardTitle>
                    <CardDescription>Request bids for your construction project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Tender Title</Label>
                            <Input
                                placeholder="e.g. Villa Renovation"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Property</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.propertyId}
                                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a property...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Budget Estimate (AED)</Label>
                            <Input
                                type="number"
                                placeholder="500000"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Scope of Work</Label>
                            <Textarea
                                placeholder="Describe the work to be done..."
                                className="h-32"
                                value={formData.scope}
                                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Publish Tender
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
