'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Space {
    id: string;
    name: string;
    model_url?: string;
}

interface RoomNavigatorProps {
    spaces: Space[];
    activeSpaceId: string;
    onSelectSpace: (space: Space) => void;
    onCreateSpace?: () => void;
}

export default function RoomNavigator({ spaces, activeSpaceId, onSelectSpace, onCreateSpace }: RoomNavigatorProps) {
    return (
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Rooms</h3>
                {onCreateSpace && (
                    <Button onClick={onCreateSpace} size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Plus className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {spaces.map((space) => (
                    <button
                        key={space.id}
                        onClick={() => onSelectSpace(space)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                            activeSpaceId === space.id
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <LayoutTemplate className={cn(
                            "w-4 h-4",
                            activeSpaceId === space.id ? "text-blue-600" : "text-slate-400"
                        )} />
                        {space.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
