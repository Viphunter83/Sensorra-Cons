"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { SmartUploader } from "@/components/dashboard/smart-uploader";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Permit = {
    id: string;
    authority: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
};

// Required permits structure
const REQUIRED_PERMITS = [
    { title: "NOC from Developer", authority: "Developer" },
    { title: "Municipality Approval", authority: "Municipality" }
];

export function ProjectPermits({ projectId, propertyId }: { projectId: string, propertyId: string }) {
    const [permits, setPermits] = useState<Permit[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [selectedAuthority, setSelectedAuthority] = useState<string>("");

    const supabase = createClient();

    const fetchPermits = async () => {
        try {
            const { data, error } = await supabase
                .from("permits")
                .select("*")
                .eq("project_id", projectId);

            if (error) throw error;
            setPermits(data || []);
        } catch (err) {
            console.error("Error fetching permits:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermits();

        // Subscribe to realtime changes
        const channel = supabase.channel(`permits-${projectId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'permits', filter: `project_id=eq.${projectId}` }, () => {
                fetchPermits();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [projectId]);

    const getStatus = (authority: string) => {
        const permit = permits.find(p => p.authority === authority);
        return permit?.status || "missing";
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                {REQUIRED_PERMITS.map((req) => {
                    const status = getStatus(req.authority);
                    return (
                        <Card key={req.authority}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {req.title}
                                </CardTitle>
                                {status === 'approved' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                    status === 'pending' ? <Loader2 className="h-4 w-4 animate-spin text-yellow-500" /> :
                                        status === 'rejected' ? <AlertCircle className="h-4 w-4 text-red-500" /> :
                                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                }
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-2">
                                    <Badge variant={
                                        status === 'approved' ? 'default' :
                                            status === 'pending' ? 'secondary' :
                                                status === 'rejected' ? 'destructive' : 'outline'
                                    }>
                                        {status.toUpperCase()}
                                    </Badge>

                                    {(status === 'missing' || status === 'rejected') && (
                                        <Dialog open={uploadOpen && selectedAuthority === req.authority} onOpenChange={(o) => {
                                            setUploadOpen(o);
                                            if (!o) setSelectedAuthority("");
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedAuthority(req.authority)}>
                                                    <Upload className="h-3 w-3 mr-2" /> Upload
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Upload {req.title}</DialogTitle>
                                                    <DialogDescription>
                                                        Please upload the valid PDF document. AI will verify the "Approved" or "No Objection" status.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <SmartUploader
                                                    projectId={projectId}
                                                    propertyId={propertyId}
                                                    defaultDocType="permit" // Custom type for Permit
                                                    metadata={{ authority: req.authority }} // Pass authority to action
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="rounded-md border p-4 bg-muted/20">
                <h4 className="flex items-center text-sm font-medium mb-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Compliance Gate
                </h4>
                <p className="text-sm text-muted-foreground">
                    Tender creation is locked until all required permits (NOC & Municipality) are approved.
                </p>
            </div>
        </div>
    );
}
