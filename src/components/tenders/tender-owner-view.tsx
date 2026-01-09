'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, BarChart3, ListChecks } from 'lucide-react';
import { inviteContractor } from '@/actions/tender-actions';
import { BidComparisonMatrix } from './bid-comparison-matrix';

interface OwnerViewProps {
    tender: any;
}

export function TenderOwnerView({ tender }: OwnerViewProps) {
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteToken, setInviteToken] = useState('');

    const handleInvite = async () => {
        if (!inviteEmail) return;
        const res = await inviteContractor(tender.id, inviteEmail);
        setInviteToken(res.token);
    };

    return (
        <div className="space-y-8">
            {/* Top Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Bids</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tender.bids?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Avg. Bid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${tender.bids?.length
                                ? Math.round(tender.bids.reduce((a: any, b: any) => a + b.price, 0) / tender.bids.length)
                                : 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Invite Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 items-center">
                            <input
                                className="border rounded px-2 py-1 text-sm w-full"
                                placeholder="contractor@email.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <Button size="sm" variant="outline" onClick={handleInvite}>
                                <UserPlus className="w-4 h-4" />
                            </Button>
                        </div>
                        {inviteToken && (
                            <div className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded break-all">
                                Invitation sent! Token: {inviteToken}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Smart Comparison Matrix */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold">Bid Decision Matrix</h2>
                </div>

                <BidComparisonMatrix bids={tender.bids} />
            </div>

            {/* Raw Bids List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-slate-600" />
                    <h2 className="text-xl font-semibold">All Proposals</h2>
                </div>
                <div className="grid gap-4">
                    {tender.bids?.map((bid: any) => (
                        <Card key={bid.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <div className="font-semibold">{bid.profiles?.full_name || "Unknown Contractor"}</div>
                                    <div className="text-sm text-slate-500">{new Date(bid.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">${bid.price}</div>
                                    <div className="text-xs text-slate-400">{bid.bid_items?.length || 0} line items</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!tender.bids || tender.bids.length === 0) && (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed text-sm">
                            No bids received yet. Invite contractors above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
