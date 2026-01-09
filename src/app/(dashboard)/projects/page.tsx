
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar } from "lucide-react";

export default async function ProjectsListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-8">Please log in.</div>;
    }

    // Fetch projects
    // Note: Assuming projects are linked to properties which are owned by the user, 
    // OR we need to find projects where the user is the owner (if projects table has owner_id?)
    // Checking database types earlier, projects does NOT have owner_id directly, it links to property_id.
    // Properties table has owner_id.
    // So we need to join properties.

    const { data: projects } = await supabase
        .from("projects")
        .select(`
            *,
            properties!inner (
                owner_id
            )
        `)
        .eq("properties.owner_id", user.id)
        .order("created_at", { ascending: false });

    // Force cast for now as typical with our current setup
    const typedProjects = (projects || []) as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage your renovation and construction projects.</p>
                </div>
                {/* 
                <Button asChild>
                    <Link href="/projects/new">
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Create New Project
                    </Link>
                </Button>
                */}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {typedProjects.map((project) => (
                    <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={project.status === 'construction' ? 'default' : 'secondary'}>
                                    {(project.status || 'unknown').toUpperCase()}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                            <CardDescription>
                                Property ID: {project.property_id.slice(0, 8)}...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            {/* Add project specific details here if needed */}
                            <p className="text-muted-foreground text-sm">
                                Manage design, permits, and construction status.
                            </p>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Button className="w-full" variant="outline" asChild>
                                <Link href={`/projects/${project.id}`}>
                                    Open Project Hub
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {typedProjects.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                        <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <h3 className="font-medium">No Projects Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">Start a project from your Property details page.</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/">Go to Properties</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
