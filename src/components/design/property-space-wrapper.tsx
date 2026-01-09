'use client';

import React, { useState, useCallback, useEffect } from 'react';
import SpaceViewer, { PlacedItem } from '@/components/3d/space-viewer';
import { saveDesignItems } from '@/actions/design-actions';
import { Loader2 } from 'lucide-react';

interface PropertySpaceWrapperProps {
    boardId: string;
    modelUrl?: string | null;
    initialItems: PlacedItem[];
}

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function PropertySpaceWrapper({ boardId, modelUrl, initialItems }: PropertySpaceWrapperProps) {
    const [items, setItems] = useState<PlacedItem[]>(initialItems);
    const [saving, setSaving] = useState(false);
    const [isDesignMode, setIsDesignMode] = useState(false); // Default to view mode

    // Auto-save debounce effect
    useEffect(() => {
        // Don't save on initial render if no changes (deep check needed?)
        // For now simple ref check usually fails if init is new obj. 
        // But we rely on setChanges.
        if (items === initialItems) return;

        const timer = setTimeout(async () => {
            setSaving(true);
            try {
                await saveDesignItems(boardId, items);
            } catch (err) {
                console.error("Failed to auto-save design", err);
            } finally {
                setSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [items, boardId, initialItems]);

    const handleItemMove = useCallback((id: string, pos: [number, number, number], rot: [number, number, number]) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, position: pos, rotation: rot } : item
        ));
    }, []);

    const handleItemsChange = useCallback((newItems: PlacedItem[]) => {
        setItems(newItems);
    }, []);

    return (
        <div className="w-full h-full relative group bg-slate-100/50">
            {/* Control Bar Overlay */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
                <div className="pointer-events-auto bg-white/90 backdrop-blur px-1 py-1 pr-3 rounded-full flex items-center gap-2 shadow-sm border border-slate-200/60 ring-1 ring-slate-100">
                    <Switch
                        id="design-mode"
                        checked={isDesignMode}
                        onCheckedChange={setIsDesignMode}
                        className="scale-75 data-[state=checked]:bg-purple-600"
                    />
                    <Label htmlFor="design-mode" className="text-xs font-semibold text-slate-600 cursor-pointer select-none">
                        {isDesignMode ? "Design Active" : "View Only"}
                    </Label>
                </div>

                {saving && (
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-2">
                        <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                        Saving...
                    </div>
                )}
            </div>

            <SpaceViewer
                modelUrl={modelUrl}
                dimensions={{ l: 10, w: 10, h: 3 }}
                items={items}
                onItemMove={handleItemMove}
                onItemsChange={handleItemsChange}
                isDesignMode={isDesignMode}
            />
        </div>
    );
}
