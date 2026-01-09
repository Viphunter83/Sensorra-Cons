'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SpaceViewer, { PlacedItem, CatalogItem } from '../3d/space-viewer';
import MarketplaceFeed from '../shop/marketplace-feed';
import { getDesignBoard, saveDesignItems } from '@/actions/design-actions';
import { Loader2, LayoutTemplate, Box, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DesignStudioProps {
    projectId: string;
    initialSpace: any; // Space DB object
}

export default function DesignStudio({ projectId, initialSpace }: DesignStudioProps) {
    const [items, setItems] = useState<PlacedItem[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [isDesignMode, setIsDesignMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load board data
    useEffect(() => {
        async function load() {
            try {
                const board = await getDesignBoard(initialSpace.id) as any;
                setBoardId(board.id);
                if (board.items && Array.isArray(board.items)) {
                    setItems(board.items);
                }
            } catch (e) {
                console.error("Failed to load design board", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [initialSpace.id]);

    // Save handler
    const handleSave = async () => {
        if (!boardId) return;
        setSaving(true);
        try {
            await saveDesignItems(boardId, items);
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setSaving(false);
        }
    };

    // Drag & Drop Handler
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const catalogItem = JSON.parse(data) as CatalogItem;
            // Randomize position slightly to avoid overlap
            const randomOffset = (Math.random() - 0.5) * 2;
            const newItem: PlacedItem = {
                id: crypto.randomUUID(),
                catalog_item_id: catalogItem.id,
                position: [randomOffset, 0.5, randomOffset],
                rotation: [0, 0, 0],
                catalog_item: catalogItem
            };

            setItems(prev => [...prev, newItem]);
            // Ideally trigger auto-save here too, but manual for now is safer for UX demo
        } catch (err) {
            console.error("Drop failed", err);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const updateItemPosition = (id: string, pos: [number, number, number], rot: [number, number, number]) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, position: pos, rotation: rot } : item
        ));
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center p-20"><Loader2 className="animate-spin mr-2" /> Loading Studio...</div>;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50">
            {/* 3D Canvas Area */}
            <div
                className="flex-1 relative p-4 flex flex-col"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-blue-600" />
                            {initialSpace.name}
                        </h2>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                            <Switch id="mode-toggle" checked={isDesignMode} onCheckedChange={setIsDesignMode} />
                            <Label htmlFor="mode-toggle" className="text-sm cursor-pointer">
                                {isDesignMode ? "Design Mode" : "View Mode"}
                            </Label>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        className="gap-2"
                        disabled={saving}
                        variant={saving ? "secondary" : "default"}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving..." : "Save Layout"}
                    </Button>
                </div>

                <div className="flex-1 rounded-xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100/50">
                    <SpaceViewer
                        modelUrl={initialSpace.model_url}
                        dimensions={initialSpace.dimensions || { l: 5, w: 5, h: 3 }}
                        items={items}
                        isDesignMode={isDesignMode}
                        onItemMove={updateItemPosition}
                    />
                </div>

                {isDesignMode && (
                    <div className="absolute bottom-6 left-6 pointer-events-none">
                        <div className="bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow flex items-center gap-2">
                            <Box className="w-4 h-4 text-blue-400" />
                            Drag items from the right panel to add them
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Marketplace */}
            <div className="w-80 h-full">
                <MarketplaceFeed
                    spaceId={initialSpace.id}
                    onItemSelect={(item) => {
                        // Also allow click to add
                        const newItem: PlacedItem = {
                            id: crypto.randomUUID(),
                            catalog_item_id: item.id,
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            catalog_item: item
                        };
                        setItems(prev => [...prev, newItem]);
                    }}
                />
            </div>
        </div>
    );
}
