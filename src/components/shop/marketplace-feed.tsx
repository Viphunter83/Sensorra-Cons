'use client';

import React, { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import { searchCatalog } from '@/actions/shop-assistant';
import { CatalogItem } from '../3d/space-viewer'; // Shared type

interface MarketplaceFeedProps {
    spaceId: string;
    onItemSelect?: (item: CatalogItem) => void;
}

export default function MarketplaceFeed({ spaceId, onItemSelect }: MarketplaceFeedProps) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isPending, startTransition] = useTransition();

    // Load initial items
    React.useEffect(() => {
        searchCatalog('', spaceId).then(res => setItems(res as CatalogItem[]));
    }, [spaceId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        startTransition(async () => {
            try {
                // Call server action
                const results = await searchCatalog(query, spaceId);
                // Map server results to CatalogItem type (action returns similar shape)
                setItems(results as CatalogItem[]);
            } catch (err) {
                console.error("Search failed", err);
                // Could show toast error
            }
        });
    };

    const handleDragStart = (e: React.DragEvent, item: CatalogItem) => {
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 w-80 shadow-lg">
            <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800 mb-2">Marketplace</h2>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Search items (e.g. 'Modern Sofa')..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    {isPending && (
                        <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                    )}
                </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 && !isPending && (
                    <div className="text-center text-slate-500 text-sm mt-10">
                        <p>Tell the AI what you need.</p>
                        <p className="text-xs mt-1 text-slate-400">"Find a beige armchair under 2000 AED"</p>
                    </div>
                )}

                {items.map((item: any) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => onItemSelect?.(item)}
                        className="group relative flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <div className="aspect-square bg-slate-200 rounded overflow-hidden relative">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 truncate">{item.name}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="font-semibold text-sm text-slate-800">{item.price} {item.currency}</span>
                                {item.score && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                        {Math.round(item.score * 100)}% Match
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
