'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SpaceViewer, { PlacedItem, CatalogItem } from '../3d/space-viewer';
import MarketplaceFeed from '../shop/marketplace-feed';
import RoomNavigator from './room-navigator';
import StyleSelector from './style-selector';
import { getDesignBoard, saveDesignItems, createDefaultSpace } from '@/actions/design-actions';
import { Loader2, Box, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DesignStudioProps {
    projectId: string;
    spaces: any[]; // List of spaces
    initialSpaceId: string;
}

export default function DesignStudio({ projectId, spaces: initialSpaces, initialSpaceId }: DesignStudioProps) {
    const [spaces, setSpaces] = useState(initialSpaces);
    const [activeSpaceId, setActiveSpaceId] = useState(initialSpaceId);

    const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

    // Board State
    const [items, setItems] = useState<PlacedItem[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [isDesignMode, setIsDesignMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // AI State
    const [selectedStyle, setSelectedStyle] = useState('modern');
    const [isDreaming, setIsDreaming] = useState(false);
    const [dreamImage_url, setDreamImageUrl] = useState<string | null>(null);

    // Load board data when space changes
    useEffect(() => {
        if (!activeSpace) return;
        setLoading(true);
        setDreamImageUrl(null); // Reset dream on room switch

        async function load() {
            try {
                const board = await getDesignBoard(activeSpace.id) as any;
                setBoardId(board.id);
                if (board.items && Array.isArray(board.items)) {
                    setItems(board.items);
                } else {
                    setItems([]);
                }
            } catch (e) {
                console.error("Failed to load design board", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [activeSpace?.id]);

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

    // Create new space handler
    const handleCreateSpace = async () => {
        const name = prompt("Enter room name (e.g. Master Bedroom):");
        if (!name) return;

        // For MVP we just use the default create action but we should update it to accept name
        // For now, let's just re-use createDefaultSpace logic as a placeholder or create a new action if needed.
        // But since we are inside client component, let's keep it simple.
        // We really should add a 'createSpace' action with name param. 
        // Assuming createDefaultSpace just makes a "Main Room", let's leave it for now or assume user adds via other UI.
        // Actually, let's just alert for now as per plan focus is on Nav.
        alert("To be implemented: Create Space Dialog");
    };

    // AI Dream Handler
    const handleDream = async () => {
        setIsDreaming(true);
        // Simulate API call delay
        await new Promise(r => setTimeout(r, 2000));
        // Mock result for prototype
        setDreamImageUrl("https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop");
        setIsDreaming(false);
    };

    // Drag & Drop Handler
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const catalogItem = JSON.parse(data) as CatalogItem;
            const randomOffset = (Math.random() - 0.5) * 2;
            const newItem: PlacedItem = {
                id: crypto.randomUUID(),
                catalog_item_id: catalogItem.id,
                position: [randomOffset, 0.5, randomOffset],
                rotation: [0, 0, 0],
                catalog_item: catalogItem
            };

            setItems(prev => [...prev, newItem]);
        } catch (err) {
            console.error("Drop failed", err);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const updateItemPosition = (id: string, pos: [number, number, number], rot: [number, number, number]) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, position: pos, rotation: rot } : item
        ));
    };

    if (!activeSpace) return <div>No spaces found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50">
            {/* Left: Room Navigator */}
            <RoomNavigator
                spaces={spaces}
                activeSpaceId={activeSpaceId}
                onSelectSpace={(s) => setActiveSpaceId(s.id)}
                onCreateSpace={handleCreateSpace}
            />

            {/* Middle: 3D Canvas Area */}
            <div
                className="flex-1 relative flex flex-col h-full"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {/* Visual Header */}
                <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold text-lg text-slate-800">
                            {activeSpace.name}
                        </h2>

                        <div className="h-6 w-px bg-slate-200"></div>

                        <StyleSelector
                            selectedStyle={selectedStyle}
                            onSelectStyle={setSelectedStyle}
                            onGenerate={handleDream}
                            isGenerating={isDreaming}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch id="mode-toggle" checked={isDesignMode} onCheckedChange={setIsDesignMode} />
                            <Label htmlFor="mode-toggle" className="text-sm cursor-pointer min-w-[80px]">
                                {isDesignMode ? "Design" : "View"}
                            </Label>
                        </div>

                        <Button
                            onClick={handleSave}
                            className="gap-2"
                            disabled={saving}
                            size="sm"
                            variant={saving ? "secondary" : "default"}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 relative bg-slate-100/50">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-slate-400 w-8 h-8" />
                        </div>
                    ) : (
                        <SpaceViewer
                            modelUrl={activeSpace.model_url}
                            dimensions={activeSpace.dimensions || { l: 5, w: 5, h: 3 }}
                            items={items}
                            isDesignMode={isDesignMode}
                            onItemMove={updateItemPosition}
                            dreamImageUrl={dreamImage_url}
                        />
                    )}

                    {isDesignMode && !loading && (
                        <div className="absolute bottom-6 left-6 pointer-events-none">
                            <div className="bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow flex items-center gap-2">
                                <Box className="w-4 h-4 text-blue-400" />
                                Drag items from right panel
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Marketplace */}
            <div className="w-80 h-full border-l border-slate-200 bg-white">
                <MarketplaceFeed
                    spaceId={activeSpace.id}
                    onItemSelect={(item) => {
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
