"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { seedDemoData } from "@/actions/demo-seed";
import { Loader2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DemoSeedButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSeed = async () => {
        try {
            setLoading(true);
            await seedDemoData();
            router.refresh();
        } catch (error) {
            console.error("Failed to seed demo data:", error);
            alert("Failed to create demo data. See console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-slate-50 border-dashed">
            <h3 className="text-lg font-medium mb-2">New to Sensorra?</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                Generate a full suite of demo data (Property, Project, BoQ, Design) to explore the platform's capabilities instantly.
            </p>
            <Button onClick={handleSeed} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate Demo Data
            </Button>
        </div>
    );
}
