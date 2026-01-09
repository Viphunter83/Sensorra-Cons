
import { createClient } from '@/utils/supabase/server';
import { ProjectHub } from '@/components/dashboard/project-hub';
import { Sidebar } from '@/components/layout/sidebar';
import { redirect } from 'next/navigation';

export default async function ProjectsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch projects linked to properties owned by user OR where user is architect
    // Using the policy logic, a simple select should work if RLS is correct.
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <div className="w-64 flex-shrink-0">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto">
                <ProjectHub initialProjects={projects || []} />
            </main>
        </div>
    );
}
