'use client'

import { usePropertyStore } from '@/lib/store/property-store'
import PropertySpaceWrapper from '@/components/design/property-space-wrapper'
import { DocumentFeed } from '@/components/dashboard/document-feed'
import { CreateTenderDialog } from '@/components/tenders/create-tender-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface ClientPropertyPageProps {
    propertyId: string;
    initialSpace: any;
    initialBoard: any;
}

export default function ClientPropertyPage({ propertyId, initialSpace, initialBoard }: ClientPropertyPageProps) {
    const { setSearch, selectedZone } = usePropertyStore()

    // Use the board items or empty array
    const initialItems = initialBoard?.items || [];

    return (
        <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-background font-sans">
            {/* Left Panel - 3D Twin */}
            <div className="w-full md:w-[40%] h-[50vh] md:h-full border-r relative bg-slate-50">
                <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-sm backdrop-blur border pointer-events-none">
                    <h2 className="font-semibold text-sm">Digital Twin Navigator</h2>
                    <p className="text-xs text-muted-foreground mt-1">Click "AI Magic Design" to dream up a new room.</p>
                </div>

                {selectedZone && (
                    <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
                        <div className="pointer-events-auto bg-white/90 p-2 rounded-lg shadow-lg backdrop-blur">
                            <CreateTenderDialog propertyId={propertyId} zone={selectedZone} />
                        </div>
                    </div>
                )}

                {/* 3D Canvas with Persistence */}
                <div className="h-full w-full">
                    {initialBoard ? (
                        <PropertySpaceWrapper
                            boardId={initialBoard.id}
                            modelUrl={initialSpace?.model_url}
                            initialItems={initialItems}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Initializing Space...
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Data */}
            <div className="w-full md:w-[60%] flex flex-col h-[50vh] md:h-full">
                {/* Header / Search */}
                <div className="border-b p-4 flex gap-4 items-center bg-card sticky top-0 z-20">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search invoices, warranties..."
                            className="pl-9 bg-muted/50 border-muted-foreground/20 focus-visible:ring-1"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="default" className="shadow-sm">Upload New</Button>
                </div>

                {/* Feed */}
                <div className="flex-1 overflow-auto bg-slate-50/50 p-2">
                    <DocumentFeed propertyId={propertyId} />
                </div>
            </div>
        </div>
    )
}
