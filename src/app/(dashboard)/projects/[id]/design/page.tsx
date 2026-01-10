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

    // Auto-create default room if no spaces exist (Streamlined onboarding)
    if (!spaces || spaces.length === 0) {
        const newSpace = await createDefaultSpace(projectId);
        if (newSpace) {
            spaces.push(newSpace);
        }
    }

    const initialSpaces = spaces && spaces.length > 0 ? spaces : [{ id: 'temp', projectId, name: 'Loading...', dimensions: { l: 5, w: 5, h: 3 }, created_at: '', model_url: null }];
    const activeSpaceId = initialSpaces[0].id;

    return (
        <div className="h-full w-full relative">
            <DesignStudio
                projectId={projectId}
                initialSpaceId={initialSpaces[0].id}
                spaces={spaces.map(s => ({
                    ...s,
                    model_url: s.model_url || '',
                    dimensions: s.dimensions as { l: number; w: number; h: number }
                }))}
            />

            {/* Dev Helper: Seed Button */}
            <form action={async (formData: FormData) => {
                'use server';
                await seedCatalog();
            }} className="absolute bottom-4 right-64 ml-4 z-50">
                <Button type="submit" variant="secondary" size="sm" className="opacity-70 hover:opacity-100 shadow-md bg-white text-slate-700">
                    🌱 Populate Catalog
                </Button>
            </form>
        </div>
    );
}
