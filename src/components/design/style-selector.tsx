'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const DESIGN_STYLES = [
    { id: 'modern', name: 'Modern Spec', color: 'bg-zinc-100' },
    { id: 'japandi', name: 'Japandi', color: 'bg-orange-50' },
    { id: 'industrial', name: 'Industrial', color: 'bg-slate-200' },
    { id: 'luxury', name: 'Dubai Luxury', color: 'bg-amber-50' },
    { id: 'minimalist', name: 'Minimalist', color: 'bg-white border' },
];

interface StyleSelectorProps {
    selectedStyle: string;
    onSelectStyle: (styleId: string) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    compact?: boolean;
}

export default function StyleSelector({ selectedStyle, onSelectStyle, onGenerate, isGenerating, compact = false }: StyleSelectorProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Select value={selectedStyle} onValueChange={onSelectStyle}>
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                        {DESIGN_STYLES.map((style) => (
                            <SelectItem key={style.id} value={style.id} className="text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", style.color)} />
                                    {style.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    size="sm"
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className={cn(
                        "h-8 text-xs gap-1.5 px-3",
                        isGenerating ? "opacity-80" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 border-0"
                    )}
                >
                    <Wand2 className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                    {isGenerating ? "Dreaming..." : "Dream"}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {DESIGN_STYLES.map((style) => (
                <button
                    key={style.id}
                    onClick={() => onSelectStyle(style.id)}
                    className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                        selectedStyle === style.id
                            ? "bg-white shadow-sm text-slate-900 border border-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    )}
                >
                    <div className={cn("w-2 h-2 rounded-full", style.color)} />
                    {style.name}
                </button>
            ))}

            <div className="w-px h-4 bg-slate-300 mx-1" />

            <Button
                size="sm"
                onClick={onGenerate}
                disabled={isGenerating}
                className={cn(
                    "h-7 text-xs gap-1.5",
                    isGenerating ? "opacity-80" : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 border-0"
                )}
            >
                <Wand2 className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                {isGenerating ? "Dreaming..." : "Dream"}
            </Button>
        </div>
    );
}
