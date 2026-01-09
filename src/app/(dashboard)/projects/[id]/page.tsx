import { createClient } from '@/utils/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
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
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <Link href="/projects">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                    <p className="text-muted-foreground">{project.properties?.title}</p>
                </div>

                <Tabs defaultValue="permits" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="permits">Permits & NOC</TabsTrigger>
                        <TabsTrigger value="boq">Master BoQ</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="p-4 border rounded-md">Project Overview Content (Timeline, Key Stats)</div>
                    </TabsContent>

                    <TabsContent value="permits">
                        <ProjectPermits projectId={project.id} propertyId={project.property_id} />
                    </TabsContent>

                    <TabsContent value="boq">
                        <MasterBoQView projectId={project.id} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
