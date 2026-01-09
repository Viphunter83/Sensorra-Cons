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
        <div className="absolute top-4 left-4 z-10 w-[350px]">
            <Card className="border-purple-200 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-purple-900">
                            <Sparkles className="text-purple-500 h-5 w-5" />
                            Dream Engine
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </Button>
                    </div>
                    <CardDescription>
                        Describe your dream room, and we will build it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Style Prompt</label>
                        <Textarea
                            placeholder="e.g. A cozy reading corner with a velvet armchair..."
                            className="resize-none border-purple-100 focus-visible:ring-purple-500 min-h-[80px]"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quick Presets</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map((preset) => (
                                <Badge
                                    key={preset.id}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors py-1.5"
                                    onClick={() => applyPreset(preset.prompt)}
                                >
                                    {preset.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Button
                        className={cn(
                            "w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-11",
                            isDreaming && "opacity-90 cursor-not-allowed"
                        )}
                        onClick={handleDream}
                        disabled={isDreaming || !prompt.trim()}
                    >
                        {isDreaming ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Hallucinating Design...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Manifest Reality
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
