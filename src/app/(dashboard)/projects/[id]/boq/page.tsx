import { createClient } from '@/utils/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { MasterBoQView } from '@/components/dashboard/master-boq-view';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectBoQPage({ params }: { params: { id: string } }) {
    // Await the params object before accessing properties
    const { id } = await params;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <Link href="/projects">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Project BoQ</h1>
                    <p className="text-muted-foreground">Manage the Golden Record for project ID: {id}</p>
                </div>

                <MasterBoQView projectId={id} />
            </main>
        </div>
    );
}
