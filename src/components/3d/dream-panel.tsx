'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles, Loader2, X } from 'lucide-react';
import { generateRoomDesign, DreamResult } from '@/actions/dream-actions';
import { cn } from '@/lib/utils';

interface DreamControlPanelProps {
    onDreamRealized: (result: DreamResult) => void;
}

const PRESETS = [
    { id: 'japandi', label: 'Japandi Zen', prompt: 'Japandi style, minimalist, wood textures, calm atmosphere' },
    { id: 'industrial', label: 'Dark Loft', prompt: 'Industrial loft, raw steel, leather furniture, dark mood' },
    { id: 'scandi', label: 'Bright Scandi', prompt: 'Bright white, colorful accents, cozy feel' },
];

export function DreamControlPanel({ onDreamRealized }: DreamControlPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isDreaming, setIsDreaming] = useState(false);

    const handleDream = async () => {
        if (!prompt.trim()) return;

        setIsDreaming(true);
        try {
            const result = await generateRoomDesign(prompt);
            if (result.success) {
                onDreamRealized(result);
                setIsOpen(false); // Close panel on success
            }
        } catch (error) {
            console.error('Dream failed:', error);
        } finally {
            setIsDreaming(false);
        }
    };

    const applyPreset = (presetPrompt: string) => {
        setPrompt(presetPrompt);
    };

    if (!isOpen) {
        return (
            <div className="absolute top-4 left-4 z-10">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20 gap-2 font-semibold transition-all hover:scale-105"
                >
                    <Wand2 size={18} />
                    AI Magic Design
                </Button>
            </div>
        );
    }

    return (
        <div className="absolute top-4 left-4 z-20 w-[380px] perspective-1000">
            <Card className="border-white/40 shadow-2xl overflow-hidden backdrop-blur-xl bg-white/90 ring-1 ring-white/50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10 pointer-events-none" />

                <CardHeader className="relative border-b border-purple-100/50 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 font-bold text-xl">
                            <Sparkles className="text-purple-500 h-5 w-5 fill-purple-200" />
                            Dream Engine
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={16} />
                        </Button>
                    </div>
                    <CardDescription className="text-slate-600 font-medium">
                        Describe your vision, and AI will manifest it.
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-5 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Your Vision</label>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <Textarea
                                placeholder="Describe the room... e.g. 'Cyberpunk office with neon lights'"
                                className="relative bg-white/80 border-0 focus-visible:ring-0 resize-none min-h-[100px] text-slate-800 placeholder:text-slate-400 shadow-inner rounded-md text-base"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Quick Inspirations</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((preset) => (
                                <Badge
                                    key={preset.id}
                                    variant="secondary"
                                    className="cursor-pointer bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 border-transparent hover:border-purple-200 transition-all py-1.5 px-3 rounded-lg shadow-sm active:scale-95"
                                    onClick={() => applyPreset(preset.prompt)}
                                >
                                    {preset.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "w-full h-12 text-lg font-bold shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98]",
                            "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-indigo-900 text-white",
                            "hover:shadow-purple-500/25 border border-white/10",
                            isDreaming && "opacity-90 cursor-not-allowed"
                        )}
                        onClick={handleDream}
                        disabled={isDreaming || !prompt.trim()}
                    >
                        {isDreaming ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-200" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200 animate-pulse">
                                    Hallucinating...
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-purple-200" />
                                <span>Manifest Reality</span>
                            </div>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
