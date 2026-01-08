'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { usePropertyStore } from '@/lib/store/property-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, DollarSign } from 'lucide-react'

// Define type based on expected DB structure
interface Document {
    id: string
    name: string
    url: string
    created_at: string
    ai_metadata: {
        tags?: string[]
        doc_type?: string
        monetary_value?: string | number
        date?: string
    } | null
}

export function DocumentFeed({ propertyId }: { propertyId: string }) {
    const [documents, setDocuments] = useState<Document[]>([])
    const { selectedZone, searchQuery } = usePropertyStore()
    const supabase = createClient()

    useEffect(() => {
        const fetchDocs = async () => {
            // Fetching all for now, in prod filter by propertyId
            const { data, error } = await supabase
                .from('documents')
                .select('*')

            if (error) {
                console.error('Error fetching docs:', error)
            } else {
                setDocuments(data as unknown as Document[])
            }
        }
        fetchDocs()
    }, [propertyId])

    const filteredDocs = documents.filter((doc) => {
        const matchesSearch = (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase())

        let matchesZone = true
        if (selectedZone) {
            // Check if any tag contains the selected zone (case insensitive)
            matchesZone = doc.ai_metadata?.tags?.some(tag =>
                tag && typeof tag === 'string' && tag.toLowerCase().includes(selectedZone.toLowerCase())
            ) ?? false
        }

        return matchesSearch && matchesZone
    })

    return (
        <div className="space-y-4 p-4">
            {filteredDocs.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No documents found {selectedZone ? `for ${selectedZone}` : ''}
                </div>
            )}
            {filteredDocs.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium truncate max-w-[70%]">
                            {doc.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {doc.ai_metadata?.doc_type || 'DOC'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                            {doc.ai_metadata?.monetary_value && (
                                <div className="flex items-center text-green-600 font-medium">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    {doc.ai_metadata.monetary_value}
                                </div>
                            )}
                            {doc.ai_metadata?.date && (
                                <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {doc.ai_metadata.date}
                                </div>
                            )}
                            {(!doc.ai_metadata?.monetary_value && !doc.ai_metadata?.date) && (
                                <div className="flex items-center">
                                    <FileText className="mr-1 h-3 w-3" />
                                    File
                                </div>
                            )}
                        </div>
                        {doc.ai_metadata?.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {doc.ai_metadata.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
