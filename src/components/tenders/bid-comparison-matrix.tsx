'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BidItemRow {
    name: string;
    quantity: number;
    prices: number[];
}

export function BidComparisonMatrix({ bids }: { bids: any[] }) {
    if (!bids || bids.length === 0) return null;

    // 1. Flatten all unique item descriptions to form rows
    const allItemsMap = new Map<string, BidItemRow>();

    bids.forEach(bid => {
        bid.bid_items?.forEach((item: any) => {
            // Group by description (fuzzy match ideally, strict for now)
            if (!allItemsMap.has(item.description)) {
                allItemsMap.set(item.description, {
                    name: item.description,
                    quantity: item.quantity, // Assume quantity matches for now
                    prices: [] as number[]
                });
            }
            const row = allItemsMap.get(item.description);
            if (row) {
                row.prices.push(item.unit_price);
            }
        });
    });

    const rows = Array.from(allItemsMap.values());

    // 2. Anomaly Detection (Simple deviation from average)
    const getAnomalyLevel = (price: number, others: number[]) => {
        if (others.length === 0) return 'normal';
        const avg = others.reduce((a, b) => a + b, 0) / others.length;
        const diff = (price - avg) / avg;

        if (diff > 0.4) return 'high'; // 40% more expensive
        if (diff < -0.4) return 'low'; // 40% cheaper (suspicious)
        return 'normal';
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="w-[300px]">Item Description</TableHead>
                        <TableHead>Qty</TableHead>
                        {bids.map((bid, i) => (
                            <TableHead key={bid.id} className="text-center border-l">
                                <div className="font-semibold text-slate-900">{bid.profiles?.full_name || `Contractor ${i + 1}`}</div>
                                <div className="text-xs text-slate-500 font-normal">Total: ${bid.price}</div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="font-medium text-slate-700">{row.name}</TableCell>
                            <TableCell className="text-slate-500">{row.quantity}</TableCell>
                            {bids.map(bid => {
                                const item = bid.bid_items?.find((i: any) => i.description === row.name);
                                if (!item) return <TableCell key={bid.id} className="text-center border-l text-slate-300">-</TableCell>;

                                const others = (rows.find(r => r.name === row.name)?.prices || []).filter((p: number) => p !== item.unit_price);
                                const status = getAnomalyLevel(item.unit_price, others);

                                return (
                                    <TableCell key={bid.id} className={cn("text-center border-l relative group",
                                        status === 'high' && "bg-red-50 text-red-700",
                                        status === 'low' && "bg-yellow-50 text-yellow-700"
                                    )}>
                                        ${item.unit_price}
                                        {status === 'high' && (
                                            <AlertCircle className="w-3 h-3 text-red-500 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition" />
                                        )}
                                        {status === 'low' && (
                                            <AlertCircle className="w-3 h-3 text-yellow-500 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition" />
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-slate-50 font-bold border-t-2">
                        <TableCell colSpan={2}>Grand Total</TableCell>
                        {bids.map(bid => (
                            <TableCell key={bid.id} className="text-center border-l text-lg">
                                ${bid.price}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
