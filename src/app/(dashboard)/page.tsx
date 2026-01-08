import { createClient } from "@/utils/supabase/server";
import { SmartUploader } from "@/components/dashboard/smart-uploader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, DollarSign, Tag, Box } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch first property for demo
    const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user?.id || "")
        .limit(1);

    const property = properties?.[0];

    // Fetch recent documents
    const { data: documents } = await supabase
        .from("documents")
        .select("*")
        .eq("property_id", property?.id || "")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* Property Overview */}
            {property ? (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        {/* Digital Twin Card */}
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative border-0 shadow-lg">
                            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Box className="h-5 w-5 text-blue-400" />
                                    Digital Twin
                                </CardTitle>
                                <CardDescription className="text-slate-300">
                                    Interactive 3D model of your property
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-400 mb-6">
                                    Navigate through rooms and find localized documents instantly.
                                </p>
                                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium" asChild>
                                    <Link href={`/property/${property.id}`}>
                                        Launch 3D Viewer
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Property & Upload Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{property.title}</CardTitle>
                                <CardDescription>Manage your construction documents</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Upload contracts, invoices, or blueprints to automatically analyze them with AI.
                                </p>
                                <SmartUploader propertyId={property.id} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Recent Documents</CardTitle>
                                <CardDescription>
                                    Processed {documents?.length || 0} files
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] w-full pr-4">
                                    <div className="space-y-4">
                                        {documents?.map((doc) => (
                                            <div key={doc.id} className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
                                                <div className="flex gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-md h-fit">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.file_url.split("/").pop()}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {(doc.ai_metadata as any)?.doc_type || 'unknown'}
                                                            </Badge>
                                                            {(doc.ai_metadata as any)?.monetary_value && (
                                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    {(doc.ai_metadata as any).monetary_value}
                                                                </Badge>
                                                            )}
                                                            {(doc.ai_metadata as any)?.extracted_date && (
                                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {(doc.ai_metadata as any).extracted_date}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {(doc.ai_metadata as any)?.tags?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {(doc.ai_metadata as any).tags.map((tag: string, i: number) => (
                                                                    <span key={i} className="text-[10px] text-muted-foreground flex items-center bg-secondary/50 px-1.5 rounded">
                                                                        # {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <Badge className={
                                                        doc.status === 'active' ? 'bg-green-500' :
                                                            doc.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-500'
                                                    }>
                                                        {doc.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {!documents?.length && (
                                            <div className="text-center py-12 text-muted-foreground dashed border-2 rounded-lg">
                                                No documents uploaded yet
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center border rounded-lg bg-yellow-50 text-yellow-800">
                    <h3 className="font-bold text-lg">No Property Found</h3>
                    <p>Please contact an administrator to assign a property to your account.</p>
                </div>
            )}
        </div>
    );
}
