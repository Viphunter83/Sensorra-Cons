'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { placeBid } from '@/actions/place-bid'
import { Loader2 } from 'lucide-react'

export function PlaceBidDialog({ tenderId, tenderTitle }: { tenderId: string, tenderTitle: string }) {
    const [open, setOpen] = useState(false)
    const [price, setPrice] = useState('')
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await placeBid({
                tenderId,
                price: Number(price),
                comment
            })
            setDone(true)
            setTimeout(() => {
                setOpen(false)
                setDone(false)
                setPrice('')
                setComment('')
            }, 2000)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Place Bid</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bid for: {tenderTitle}</DialogTitle>
                </DialogHeader>

                {!done ? (
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price (AED)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Proposal / Comment</label>
                            <Textarea
                                placeholder="I can start tomorrow..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" onClick={handleSubmit} disabled={loading || !price}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Submit Sealed Bid'}
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-6 text-green-600 font-medium">
                        Bid Placed Successfully!
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
