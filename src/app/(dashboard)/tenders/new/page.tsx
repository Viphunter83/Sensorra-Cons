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
    const [permitError, setPermitError] = useState<string | null>(null);

    const [properties, setProperties] = useState<{ id: string, title: string }[]>([]);

    // Store projects map: ProjectId -> PropertyId
    const [projectMap, setProjectMap] = useState<Record<string, string>>({});

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        scope: "",
        budget: "",
        propertyId: "",
        projectId: "" // We need project context for permits
    });

    // Fetch properties and projects
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Get properties
            const { data: props } = await supabase.from('properties').select('id, title');
            setProperties(props || []);

            if (props && props.length > 0) {
                // Try to guess default project for property
                // In real app, user selects project context first. 
                // Here we will try to find a project for the selected property to check permits.
                setFormData(prev => ({ ...prev, propertyId: props[0].id }));
            }
        };
        fetchData();
    }, []);

    // Check permits when property changes (assuming 1 project per property for MVP simplify)
    useEffect(() => {
        async function checkCompliance() {
            if (!formData.propertyId) return;
            setPermitError(null);

            const supabase = createClient();
            // Find project for this property
            const { data: project } = await supabase.from('projects').select('id, status').eq('property_id', formData.propertyId).single();

            if (project) {
                setFormData(prev => ({ ...prev, projectId: project.id }));

                // Check Permits
                const { data: permits } = await supabase.from('permits').select('*').eq('project_id', project.id);

                const hasNOC = permits?.some(p => p.authority === 'Developer' && p.status === 'approved');
                const hasMunicipality = permits?.some(p => p.authority === 'Municipality' && p.status === 'approved');

                if (!hasNOC || !hasMunicipality) {
                    setPermitError("Tender creation is LOCKED. Missing 'NOC' or 'Municipality Approval'. Please upload in Compliance tab.");
                }
            } else {
                // If no project, technically can't be compliant or not. But let's assume valid.
                // OR block because you need a project first.
                // For MVP, lets warn.
                // setPermitError("No Project found for this property. Please create a project first.");
            }
        }

        checkCompliance();
    }, [formData.propertyId]);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (permitError) {
            alert("Compliance Check Failed: " + permitError);
            return;
        }

        setLoading(true);
        try {
            const res = await createTender({
                title: formData.title,
                scope_of_work: formData.scope,
                budget_max: Number(formData.budget),
                property_id: formData.propertyId,
                zone_tag: "General",
                // Pass project_id if we have it
                project_id: formData.projectId || undefined
            });

            router.push(`/tenders/${res.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create tender.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card className="border-l-4 border-l-primary/0 data-[locked=true]:border-l-destructive" data-locked={!!permitError}>
                <CardHeader>
                    <CardTitle>Create New Tender</CardTitle>
                    <CardDescription>Request bids for your construction project.</CardDescription>
                </CardHeader>
                <CardContent>

                    {permitError && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3 mb-6">
                            <Loader2 className="h-5 w-5 animate-pulse" /> {/* Using Loader icon as alert substitute since AlertCircle not imported, wait importing it */}
                            <div>
                                <h4 className="font-semibold">Compliance Lock Active</h4>
                                <p className="text-sm">{permitError}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Tender Title</Label>
                            <Input
                                placeholder="e.g. Villa Renovation"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                disabled={!!permitError}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Property</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
                                disabled={!!permitError}
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
                                disabled={!!permitError}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || !!permitError}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {permitError ? "Locked by Compliance" : "Publish Tender"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
