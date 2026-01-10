'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SpaceViewer, { PlacedItem, CatalogItem } from '../3d/space-viewer';
import MarketplaceFeed from '../shop/marketplace-feed';
import RoomNavigator from './room-navigator';
import StyleSelector from './style-selector';
import { saveDesignItems, getDesignBoard, findSimilarItems, SimilarItem } from '@/actions/design-actions';
import { Save, Loader2, Search, X, Box, Wand2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTenderDialog } from '@/components/tenders/create-tender-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDesignStore } from '@/stores/design-store';
import { toast } from 'sonner';

interface Space {
    id: string;
    name: string;
    model_url: string; // Ensure this is just string, handled by parent
    dimensions: { l: number; w: number; h: number }; // Ensure strictly typed in parent map
}

interface DesignBoard {
    id: string;
    items: PlacedItem[];
}

interface DesignStudioProps {
    projectId?: string; // Optional now as Property Page might not have project context yet? Or it uses property data.
    spaces: Space[];
    initialSpaceId: string;
    mode?: 'full' | 'embedded';
}

export default function DesignStudio({ spaces: initialSpaces, initialSpaceId, mode = 'full' }: DesignStudioProps) {
    const [spaces] = useState(initialSpaces);
    const [activeSpaceId, setActiveSpaceId] = useState(initialSpaceId);

    // Geometric Consistency Capture Ref
    const captureRef = React.useRef<(() => string) | null>(null);

    // Context-Aware Dream Logic
    const STYLE_PRESETS: Record<string, string> = {
        'modern': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600',
        'japandi': 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1600', // Beige/Wood
        'industrial': 'https://images.unsplash.com/photo-1593856509924-417151199884?q=80&w=1600', // Concrete/Dark
        'luxury': 'https://images.unsplash.com/photo-1600596542815-e32c8ec23fc9?q=80&w=1600', // Gold/Marble
        'minimalist': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1600', // White
    };

    // Derived state
    const activeSpace = spaces.find(s => s.id === activeSpaceId) || spaces[0];

    // Local UI State (Not critical for AI)
    const [boardId, setBoardId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('modern');

    // Global Store State
    const itemsDict = useDesignStore((state) => state.items);
    const items = Object.values(itemsDict);
    const isDreaming = useDesignStore((state) => state.isDreaming);
    const dreamImageUrl = useDesignStore((state) => state.dreamImageUrl);
    const viewMode = useDesignStore((state) => state.viewMode);

    // Actions
    const {
        addItem,
        updateItemPosition,
        updateItemRotation,
        setDreamImage,
        setIsDreaming,
        setViewMode
    } = useDesignStore((state) => state.actions);

    // Sync Store <-> DB
    useEffect(() => {
        if (!activeSpace) return;
        setLoading(true);
        // Reset store for new room
        setDreamImage(null);
        setViewMode('edit');

        async function load() {
            try {
                // Double cast to handle JSON vs Interface mismatch if any
                const board = await getDesignBoard(activeSpace.id) as unknown as DesignBoard;
                setBoardId(board.id);

                // Note: ideally we clear store here first
                if (board.items && Array.isArray(board.items)) {
                    board.items.forEach((item: PlacedItem) => addItem(item));
                }
            } catch (e) {
                console.error("Failed to load design board", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [activeSpace, activeSpace?.id, addItem, setDreamImage, setViewMode]);

    const handleSave = async () => {
        if (!boardId) return;
        setSaving(true);
        try {
            await saveDesignItems(boardId, items);
            toast.success("Design saved successfully");
        } catch (e) {
            console.error("Save failed", e);
            toast.error("Failed to save design");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSpace = async () => {
        alert("To be implemented: Create Space Dialog");
    };

    // AI Dream Handler
    const handleDream = async () => {
        // 1. Capture Logic (Geometric Consistency)
        let referenceImage = null;

        if (captureRef.current) {
            console.log("Creating Geometric Consistency Map (Depth/Canny)...");
            referenceImage = captureRef.current(); // Base64 Data URL
            console.log("Captured Scene for Dream:", referenceImage.substring(0, 50) + "...");
        } else {
            console.warn("No capture function registered. AI will hallucinate geometry.");
        }

        setIsDreaming(true);
        setViewMode('dream');

        // Simulate API Response time with variance
        const processingTime = 2000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, processingTime));

        // Intelligent selection (Mock)
        const matchedImage = STYLE_PRESETS[selectedStyle] || STYLE_PRESETS['modern'];
        setDreamImage(matchedImage);

        toast.success(`Generated ${selectedStyle} design proposal`);
        setIsDreaming(false);
        toast.success(`Generated ${selectedStyle} design proposal`);
        setIsDreaming(false);
    };

    // Tender / Procurement Bridge
    const [tenderDialogOpen, setTenderDialogOpen] = useState(false);
    const [tenderAttachment, setTenderAttachment] = useState<string | null>(null);

    const handleOpenTender = () => {
        if (captureRef.current) {
            const dataUrl = captureRef.current();
            setTenderAttachment(dataUrl);
            setTenderDialogOpen(true);
        } else {
            toast.error("Scene not ready for capture");
        }
    };

    // Sourcing Logic
    const [foundItems, setFoundItems] = useState<SimilarItem[]>([]);
    const [isSourcing, setIsSourcing] = useState(false);

    const handleSourcing = async () => {
        if (!captureRef.current) {
            toast.error("Capture function not available.");
            return;
        }

        setIsSourcing(true);
        setViewMode('source');

        try {
            const imageBase64 = captureRef.current();
            const result = await findSimilarItems(imageBase64);

            if (result.success && result.data) {
                setFoundItems(result.data);
            } else {
                toast.error("No items found or error occurred");
            }
        } catch (e) {
            console.error(e);
            toast.error("Sourcing failed");
        } finally {
            setIsSourcing(false);
        }
    };

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
                modelUrl: catalogItem.model_url || '/models/placeholder.glb', // Fallback
                position: [randomOffset, 0.5, randomOffset],
                rotation: [0, 0, 0],
                catalog_item: catalogItem
            };
            addItem(newItem);
        } catch (err) {
            console.error("Drop failed", err);
        }
    }, [addItem]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onMove = (id: string, pos: [number, number, number], rot: [number, number, number]) => {
        updateItemPosition(id, pos);
        updateItemRotation(id, rot);
    };

    const handleAddItem = (item: CatalogItem) => {
        const newItem: PlacedItem = {
            id: crypto.randomUUID(),
            catalog_item_id: item.id,
            modelUrl: item.model_url || '/models/placeholder.glb',
            position: [0, 0.5, 0],
            rotation: [0, 0, 0],
            catalog_item: item
        };
        addItem(newItem);
        toast.success(`Placed ${item.name}`);
    };

    if (!activeSpace) return <div>No spaces found</div>;

    const isDesignModeBool = viewMode === 'edit';

    return (
        <div className={`flex w-full overflow-hidden bg-slate-50 relative ${mode === 'full' ? 'h-[calc(100vh-64px)]' : 'h-full'}`}>
            {/* Left: Room Navigator - Hidden in embedded mode for simplicity unless toggled (feature for later) */}
            {mode === 'full' && (
                <RoomNavigator
                    spaces={spaces}
                    activeSpaceId={activeSpaceId}
                    onSelectSpace={(s) => setActiveSpaceId(s.id)}
                    onCreateSpace={handleCreateSpace}
                />
            )}

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
                            compact={mode === 'embedded'}
                        />

                        {/* Reality Source Button */}
                        <Button
                            size="sm"
                            variant={viewMode === 'source' ? 'secondary' : 'ghost'}
                            className="gap-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                            onClick={handleSourcing}
                            disabled={isSourcing}
                        >
                            {isSourcing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {isSourcing ? "Searching..." : "Reality Sourcing"}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="mode-toggle"
                                checked={isDesignModeBool}
                                onCheckedChange={(checked) => setViewMode(checked ? 'edit' : 'dream')}
                            />
                            <Label htmlFor="mode-toggle" className="text-sm cursor-pointer min-w-[80px]">
                                {isDesignModeBool ? "Design" : "View"}
                            </Label>
                        </div>

                        <Button
                            onClick={handleOpenTender}
                            variant="default"
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-sm"
                        >
                            <Calculator className="w-4 h-4" />
                            Create Tender
                        </Button>

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
                            isDesignMode={isDesignModeBool}
                            onItemMove={onMove}
                            dreamImageUrl={dreamImageUrl}
                            captureRef={captureRef}
                        />
                    )}

                    {isDesignModeBool && !loading && mode === 'full' && (
                        <div className="absolute bottom-6 left-6 pointer-events-none">
                            <div className="bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow flex items-center gap-2">
                                <Box className="w-4 h-4 text-blue-400" />
                                Drag items from right panel
                            </div>
                        </div>
                    )}

                    {/* Sourcing Overlay Panel */}
                    {viewMode === 'source' && (
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur border-l border-slate-200 shadow-xl p-4 overflow-y-auto z-30 transition-transform duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Matched Catalog Items</h3>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setViewMode('edit')}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {isSourcing ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-3" />
                                    <p className="text-sm text-slate-600">Analyzing geometry & materials...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {foundItems.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-8">No matching items found in your catalog.</p>
                                    ) : (
                                        foundItems.map(item => (
                                            <div key={item.id} className="group border border-slate-100 rounded-lg p-2 bg-white hover:border-emerald-200 hover:shadow-md transition-all">
                                                <div className="aspect-[4/3] rounded bg-slate-100 mb-2 overflow-hidden relative">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                                                    <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                        {(item.similarity * 100).toFixed(0)}% Match
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-medium text-slate-900 truncate" title={item.name}>{item.name}</h4>
                                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 mb-2">{item.description}</p>

                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
                                                    <span className="text-xs font-semibold text-slate-700">{item.price} AED</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-[10px] px-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleAddItem(item as unknown as CatalogItem)}
                                                    >
                                                        Place Item
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dream Mode Loading Overlay */}
                    {isDreaming && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="text-center text-white space-y-4">
                                <Wand2 className="w-12 h-12 animate-spin mx-auto text-purple-400" />
                                <h3 className="text-xl font-medium">Dreaming up your design...</h3>
                                <p className="text-white/60">Analyzing geometry and sourcing styles</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Marketplace - Conditional Update */}
            {/* Procurement Bridge Dialog */}
            {tenderDialogOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setTenderDialogOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <CreateTenderDialog
                            propertyId={activeSpace.id} // Using Space ID as proxy for property context for now
                            zone={activeSpace.name}
                            initialRequest="I want to implement this design. Please provide a quote for the furniture and finishing works."
                            attachmentUrl={tenderAttachment}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
