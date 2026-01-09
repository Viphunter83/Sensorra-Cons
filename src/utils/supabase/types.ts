export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    company_name: string | null
                    role: 'owner' | 'manager' | 'contractor' | 'viewer'
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    company_name?: string | null
                    role?: 'owner' | 'manager' | 'contractor' | 'viewer'
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    company_name?: string | null
                    role?: 'owner' | 'manager' | 'contractor' | 'viewer'
                    avatar_url?: string | null
                    created_at?: string
                }
            }
            properties: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    address_data: Json
                    specs: Json
                    is_published: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    address_data?: Json
                    specs?: Json
                    is_published?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    address_data?: Json
                    specs?: Json
                    is_published?: boolean
                    created_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    property_id: string
                    uploader_id: string
                    type: string
                    file_url: string
                    version: number
                    ai_metadata: {
                        tags?: string[]
                        doc_type?: string
                        monetary_value?: string | number
                        date?: string
                    } | null
                    status: 'processing' | 'active' | 'archived' | 'rejected'
                    created_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    uploader_id: string
                    type: string
                    file_url: string
                    version?: number
                    ai_metadata?: Json
                    status?: 'processing' | 'active' | 'archived' | 'rejected'
                    created_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string
                    uploader_id?: string
                    type?: string
                    file_url?: string
                    version?: number
                    ai_metadata?: Json
                    status?: 'processing' | 'active' | 'archived' | 'rejected'
                    created_at?: string
                }
            }
            tenders: {
                Row: {
                    id: string
                    property_id: string
                    owner_id: string
                    title: string
                    scope_of_work: string | null
                    budget_max: number | null
                    zone_tag: string | null
                    status: 'draft' | 'open' | 'review' | 'awarded' | 'closed'
                    winning_bid_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    owner_id: string
                    title: string
                    scope_of_work?: string | null
                    budget_max?: number | null
                    zone_tag?: string | null
                    status?: 'draft' | 'open' | 'review' | 'awarded' | 'closed'
                    winning_bid_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string
                    owner_id?: string
                    title?: string
                    scope_of_work?: string | null
                    budget_max?: number | null
                    zone_tag?: string | null
                    status?: 'draft' | 'open' | 'review' | 'awarded' | 'closed'
                    winning_bid_id?: string | null
                    created_at?: string
                }
            }
            bids: {
                Row: {
                    id: string
                    tender_id: string
                    contractor_id: string
                    price: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tender_id: string
                    contractor_id: string
                    price: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tender_id?: string
                    contractor_id?: string
                    price?: number
                    comment?: string | null
                    created_at?: string
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    entity_id: string | null
                    payload: Json
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action: string
                    entity_id?: string | null
                    payload?: Json
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string
                    entity_id?: string | null
                    payload?: Json
                    created_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'owner' | 'manager' | 'contractor' | 'viewer'
            doc_status: 'processing' | 'active' | 'archived' | 'rejected'
            tender_status: 'draft' | 'open' | 'review' | 'awarded' | 'closed'
        }
    }
}
