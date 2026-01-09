'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { enablePassport, addTimelineEvent } from '@/actions/passport-actions';
import { ExternalLink, Printer, PlusCircle, Unlock, Lock } from 'lucide-react';

interface PassportManagerProps {
    project: any;
}

export function PassportManager({ project }: PassportManagerProps) {
    const [publicToken, setPublicToken] = useState<string | null>(project.public_access_token);
    const [isPublic, setIsPublic] = useState(project.is_public);

    // Timeline Form
    const [eventTitle, setEventTitle] = useState('');
    const [eventDesc, setEventDesc] = useState('');
    const [eventCategory, setEventCategory] = useState('maintenance');

    const handleEnable = async () => {
        const token = await enablePassport(project.id);
        setPublicToken(token);
        setIsPublic(true);
    };

    const handleAddEvent = async () => {
        if (!eventTitle) return;
        await addTimelineEvent(project.id, eventTitle, eventCategory, eventDesc);
        setEventTitle('');
        setEventDesc('');
        // Optimistically update or just rely on server validation (revalidatePath will handle refresh)
    };

    const publicUrl = typeof window !== 'undefined' && publicToken
        ? `${window.location.origin}/passport/${publicToken}`
        : '';

    return (
        <div className="grid md:grid-cols-2 gap-8">

            {/* Left: Share & QR */}
            <div className="space-y-6">
                <Card className={isPublic ? "border-green-200 bg-green-50/20" : "border-slate-200"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isPublic ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-slate-500" />}
                            Digital Passport Status
                        </CardTitle>
                        <CardDescription>
                            Enable public read-only access to share this property's history.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!isPublic ? (
                            <Button onClick={handleEnable} className="w-full">
                                Generate Public Passport
                            </Button>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-center p-6 bg-white rounded-xl border shadow-sm">
                                    <QRCode value={publicUrl} size={180} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Public Link</Label>
                                    <div className="flex gap-2">
                                        <Input readOnly value={publicUrl} className="bg-white" />
                                        <Button variant="outline" size="icon" onClick={() => window.open(publicUrl, '_blank')}>
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Tip: Print this QR code and paste it on your electrical panel or boiler.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right: Timeline Editor */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Timeline of Truth</CardTitle>
                        <CardDescription>Log "Hidden Quality" events to increase resale value.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Event Title</Label>
                            <Input
                                placeholder="e.g. Roof Insulation Upgrade"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={eventCategory}
                                onChange={(e) => setEventCategory(e.target.value)}
                            >
                                <option value="maintenance">Maintenance</option>
                                <option value="renovation">Renovation</option>
                                <option value="upgrade">Upgrade</option>
                                <option value="inspection">Inspection</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Details about materials used, contractor name, etc."
                                value={eventDesc}
                                onChange={(e) => setEventDesc(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddEvent} disabled={!eventTitle} className="w-full">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Log Event
                        </Button>
                    </CardContent>
                </Card>

                {/* Latest Generic Events Preview */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900">Recent Events</h3>
                    <div className="space-y-2">
                        {project.timeline_events?.map((e: any) => (
                            <div key={e.id} className="text-sm p-3 bg-slate-50 border rounded-md flex justify-between items-center">
                                <span className="font-medium text-slate-700">{e.title}</span>
                                <span className="text-slate-400 text-xs">{new Date(e.event_date).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {(!project.timeline_events || project.timeline_events.length === 0) && (
                            <div className="text-xs text-slate-400 italic text-center py-4">No events logged yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
