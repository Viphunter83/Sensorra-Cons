import React from 'react';
import { getPublicProject } from '@/actions/passport-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle2, MapPin, Ruler } from 'lucide-react';

// We'll reuse the SpaceViewer but need to make sure it handles read-only gracefully
import SpaceViewer from '@/components/3d/space-viewer';

export default async function PassportPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const project = await getPublicProject(token);

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-slate-400">Passport not found or private.</p>
                </div>
            </div>
        );
    }

    // Prepare primary space for 3D view
    const mainSpace = project.spaces?.[0];
    const designBoard = mainSpace?.design_boards?.[0];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-gold-500 selection:text-black">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-black font-serif">S</div>
                        <span className="font-semibold tracking-wider uppercase text-sm text-yellow-500">Sensorra Passport</span>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-900/20 px-3 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified Property
                    </Badge>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 space-y-16">

                {/* Hero Section */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-serif font-medium leading-tight">
                            {project.title}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-slate-400">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <MapPin className="w-4 h-4 text-yellow-500" />
                                {project.properties?.address || "Unknown Location"}
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <Ruler className="w-4 h-4 text-yellow-500" />
                                {project.properties?.size_sqm} m²
                            </div>
                        </div>
                        <p className="text-xl text-slate-300 font-light leading-relaxed">
                            This digital passport certifies the history, quality, and specifications of this property.
                            Verified on the Sensorra ledger.
                        </p>
                    </div>

                    {/* 3D Showcase */}
                    <div className="h-[400px] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
                        {mainSpace ? (
                            <SpaceViewer
                                modelUrl={mainSpace.model_url}
                                dimensions={mainSpace.dimensions}
                                items={designBoard?.items || []}
                                isDesignMode={false} // Read Only
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-600">No 3D Model Available</div>
                        )}
                        <div className="absolute inset-0 border-[1px] border-white/5 rounded-2xl pointer-events-none"></div>
                    </div>
                </section>

                {/* Timeline of Truth */}
                <section>
                    <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-yellow-500/50"></span>
                        History & Maintenance
                        <span className="flex-1 h-[1px] bg-white/10"></span>
                    </h2>

                    <div className="relative border-l border-white/10 ml-3 space-y-12 pb-12">
                        {project.timeline_events && project.timeline_events.length > 0 ? (
                            project.timeline_events.map((event: any, idx: number) => (
                                <div key={event.id} className="relative pl-12 group">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-colors shadow-[0_0_0_4px_rgba(0,0,0,1)]"></div>
                                    <div className="text-sm text-yellow-500/80 font-mono mb-1 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(event.event_date).toLocaleDateString()}
                                    </div>
                                    <Card className="bg-white/5 border-white/5 hover:border-white/10 transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-lg text-slate-200">{event.title}</h3>
                                                <Badge variant="secondary" className="bg-white/10 text-slate-300 hover:bg-white/20 capitalize">
                                                    {event.category}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {event.description || "No detailed description provided."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        ) : (
                            <div className="pl-12 text-slate-500 italic">No public events logged yet.</div>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center text-slate-600 text-sm py-8 border-t border-white/5">
                    Verified by Sensorra Digital Ledger &bull; {new Date().getFullYear()}
                </footer>

            </main>
        </div>
    );
}
