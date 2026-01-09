'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, HardHat, FileText, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SmartUploader } from '@/components/dashboard/smart-uploader';

// Type definition based on our new schema
type Project = {
    id: string;
    title: string;
    property_id: string; // Needed for upload
    status: 'design' | 'permitting' | 'construction' | 'handover';
    architect_id: string | null;
    created_at: string;
};

export function ProjectHub({ initialProjects }: { initialProjects: Project[] }) {
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [uploadProject, setUploadProject] = useState<Project | null>(null); // Track which project to upload to
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleCreateProject = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // First get a property to attach to. For this MVP, we'll pick the first property of the owner 
            // or create a dummy one if needed, but ideally the user selects it. 
            // For the Wizard, let's assume we fetch properties or just use a placeholder for now 
            // if the UI doesn't have a property selector yet. 
            // BETTER: Quick fetch of user's properties.

            const { data: properties } = await supabase.from('properties').select('id').limit(1);

            let propertyId = properties?.[0]?.id;

            if (!propertyId) {
                // Fallback: Create a default property if none exists (safe MVP fallback)
                const { data: newProp, error: propError } = await supabase.from('properties').insert({
                    owner_id: user.id,
                    title: 'My Default Property'
                }).select().single();
                if (propError) throw propError;
                propertyId = newProp.id;
            }

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    title: newProjectTitle,
                    property_id: propertyId, // MVP: Attach to first found property
                    status: 'design'
                })
                .select()
                .single();

            if (error) throw error;

            setProjects([data, ...projects]);
            setIsCreateOpen(false);
            setNewProjectTitle('');
            router.refresh();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Hub</h1>
                    <p className="text-muted-foreground">Manage your renovation and construction projects.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Start a new renovation or construction project.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={newProjectTitle}
                                    onChange={(e) => setNewProjectTitle(e.target.value)}
                                    placeholder="e.g. Villa Extension 2026"
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateProject} disabled={loading}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Upload Dialog */}
                <Dialog open={!!uploadProject} onOpenChange={(open) => !open && setUploadProject(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Design Documents</DialogTitle>
                            <DialogDescription>
                                Upload blueprints or specs for {uploadProject?.title}.
                            </DialogDescription>
                        </DialogHeader>
                        {uploadProject && (
                            <SmartUploader
                                propertyId={uploadProject.property_id}
                                projectId={uploadProject.id}
                                defaultDocType="blueprint"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                        No projects yet. Create one to get started!
                    </div>
                )}
                {projects.map((project) => (
                    <Card key={project.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="truncate">{project.title}</CardTitle>
                                <Badge variant={project.status === 'permitting' ? 'destructive' : 'secondary'}>
                                    {project.status.toUpperCase()}
                                </Badge>
                            </div>
                            <CardDescription>Created on {new Date(project.created_at).toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <HardHat className="h-4 w-4" />
                                <span>Architect: {project.architect_id ? 'Assigned' : 'None'}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" size="sm" className="w-full mr-2">
                                <FileText className="mr-2 h-4 w-4" />
                                Specs
                            </Button>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => setUploadProject(project)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
