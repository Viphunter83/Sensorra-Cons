import React from 'react';
import DesignStudio from '@/components/design/design-studio';
import { getProjectSpaces, createDefaultSpace } from '@/actions/design-actions';
import { seedCatalog } from '@/actions/seed-catalog';
import { Button } from '@/components/ui/button';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DesignPage({ params }: PageProps) {
    const { id: projectId } = await params;

    // Fetch existing spaces
    const spaces = await getProjectSpaces(projectId);
    let activeSpace;

    if (!spaces || spaces.length === 0) {
        // Auto-create default room if none exists (Streamlined onboarding)
        activeSpace = await createDefaultSpace(projectId);
    } else {
        activeSpace = spaces[0];
    }

    return (
        <div className="h-full w-full relative">
            <DesignStudio
                projectId={projectId}
                initialSpace={activeSpace}
            />

            {/* Dev Helper: Seed Button */}
            <form action={seedCatalog} className="absolute bottom-4 right-64 ml-4 z-50">
                <Button type="submit" variant="secondary" size="sm" className="opacity-70 hover:opacity-100 shadow-md bg-white text-slate-700">
                    🌱 Populate Catalog
                </Button>
            </form>
        </div>
    );
}
