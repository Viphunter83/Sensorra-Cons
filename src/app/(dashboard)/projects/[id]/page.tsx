import { createClient } from '@/utils/supabase/server';
// import { Sidebar } from '@/components/layout/sidebar'; // Removed duplicate sidebar
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MasterBoQView } from '@/components/dashboard/master-boq-view';
import { ProjectPermits } from '@/components/dashboard/project-permits';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ProjectPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Project Details
    const { data: project } = await supabase
        .from('projects')
        .select('*, properties(title)')
        .eq('id', id)
        .single();

    if (!project) return notFound();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <Link href="/projects">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{(project as any).title}</h1>
                    <p className="text-muted-foreground">{(project as any).properties?.title}</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="permits">Permits & NOC</TabsTrigger>
                    <TabsTrigger value="boq">Master BoQ</TabsTrigger>
                    <TabsTrigger value="design">AI Design</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="p-4 border rounded-md">Project Overview Content (Timeline, Key Stats)</div>
                </TabsContent>

                <TabsContent value="permits">
                    <ProjectPermits projectId={(project as any).id} propertyId={(project as any).property_id} />
                </TabsContent>

                <TabsContent value="boq">
                    <MasterBoQView projectId={(project as any).id} />
                </TabsContent>

                <TabsContent value="design" className="min-h-[200px] border rounded-md p-8 flex flex-col items-center justify-center bg-slate-50">
                    <h3 className="text-lg font-semibold mb-2">3D Design Studio</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Use our AI-powered design tool to visualize this space and source furniture.
                    </p>
                    <Link href={`/projects/${id}/design`}>
                        <Button size="lg" className="gap-2">
                            Open Design Editor
                        </Button>
                    </Link>
                </TabsContent>
            </Tabs>
        </div>
    );
}
