import React from 'react';
import { getProjectSpaces, createDefaultSpace, getDesignBoard } from '@/actions/design-actions';
import ClientPropertyPage from './client-page';
import { seedCatalog } from '@/actions/seed-catalog';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
    const { id } = await params;

    // 1. Get or Create Space (Auto-onboarding)
    let spaces = await getProjectSpaces(id);
    let activeSpace;

    if (!spaces || spaces.length === 0) {
        // First time visiting? Create default room.
        activeSpace = await createDefaultSpace(id);
    } else {
        activeSpace = spaces[0];
    }

    // 2. Get Persistence Board
    let designBoard = null;
    if (activeSpace) {
        designBoard = await getDesignBoard(activeSpace.id);
    }

    return (
        <ClientPropertyPage
            propertyId={id}
            initialSpace={activeSpace}
            initialBoard={designBoard}
        />
    );
}
