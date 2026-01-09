'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createTender } from '@/actions/create-tender'
import { Loader2, Wand2 } from 'lucide-react'
// removed unused imports

interface CreateTenderDialogProps {
    propertyId: string
    zone: string
}

export function CreateTenderDialog({ propertyId, zone }: CreateTenderDialogProps) {
    const [open, setOpen] = useState(false)
    const [request, setRequest] = useState('')
    const [loading, setLoading] = useState(false)
    const [successId, setSuccessId] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!request.trim()) return
        setLoading(true)
        try {
            const result = await createTender({
                propertyId,
                zone,
                userRequest: request
            })
            if (result.success) {
                setSuccessId(result.tenderId)
                setRequest('')
            }
        } catch (error) {
            console.error(error)
            // Error handling could be better (toast)
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setOpen(false)
        setSuccessId(null)
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
                    <Wand2 className="h-4 w-4" />
                    Create Tender for {zone}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Tender Estimator</DialogTitle>
                    <DialogDescription>
                        Describe the issue in <b>{zone}</b>. AI will generate a professional scope of work and budget.
                    </DialogDescription>
                </DialogHeader>

                {!successId ? (
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="e.g., The air conditioner is making a loud noise and leaking water..."
                            className="min-h-[100px]"
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                        />
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleCreate} disabled={loading || !request.trim()}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>Generate Specs & Publish</>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <Wand2 className="h-6 w-6" />
                        </div>
                        <h3 className="font-medium text-lg">Success! Tender Published</h3>

                        <div className="bg-muted/50 p-4 rounded-md text-left text-sm space-y-2">
                            <p><strong>Status:</strong> <span className="text-green-600">Open for Bidding</span></p>
                            <p>The AI has generated a Scope of Work and distributed it to contractors.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button variant="default" asChild>
                                <a href="/marketplace">View in Marketplace (Simulate Contractor)</a>
                            </Button>
                            <Button variant="outline" onClick={reset}>Close</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
