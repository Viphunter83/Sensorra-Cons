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
                    role: 'owner' | 'manager' | 'contractor' | 'viewer' | 'architect' | 'consultant' | 'inspector'
                    avatar_url: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    company_name?: string | null
                    role?: 'owner' | 'manager' | 'contractor' | 'viewer' | 'architect' | 'consultant' | 'inspector'
                    avatar_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    company_name?: string | null
                    role?: 'owner' | 'manager' | 'contractor' | 'viewer' | 'architect' | 'consultant' | 'inspector'
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
            projects: {
                Row: {
                    id: string
                    property_id: string
                    title: string
                    architect_id: string | null
                    status: 'design' | 'permitting' | 'construction' | 'handover'
                    public_access_token: string | null
                    is_public: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    title: string
                    architect_id?: string | null
                    status?: 'design' | 'permitting' | 'construction' | 'handover'
                    public_access_token?: string | null
                    is_public?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string
                    title?: string
                    architect_id?: string | null
                    status?: 'design' | 'permitting' | 'construction' | 'handover'
                    public_access_token?: string | null
                    is_public?: boolean
                    created_at?: string
                }
            }
            timeline_events: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    category: string
                    event_date: string
                    media_urls: string[] | null
                    verified: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    category: string
                    event_date?: string
                    media_urls?: string[] | null
                    verified?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    event_date?: string
                    media_urls?: string[] | null
                    verified?: boolean
                    created_at?: string
                }
            }
            spaces: {
                Row: {
                    id: string
                    project_id: string
                    name: string
                    dimensions: Json
                    model_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    name: string
                    dimensions?: Json
                    model_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    name?: string
                    dimensions?: Json
                    model_url?: string | null
                    created_at?: string
                }
            }
            design_boards: {
                Row: {
                    id: string
                    space_id: string
                    name: string | null
                    items: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    space_id: string
                    name?: string | null
                    items?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    space_id?: string
                    name?: string | null
                    items?: Json
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
                    ai_metadata: Json | null
                    project_id: string | null
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
                    ai_metadata?: Json | null
                    project_id?: string | null
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
                    ai_metadata?: Json | null
                    project_id?: string | null
                    status?: 'processing' | 'active' | 'archived' | 'rejected'
                    created_at?: string
                }
            }
            tenders: {
                Row: {
                    id: string
                    property_id: string
                    project_id: string | null
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
                    project_id?: string | null
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
                    project_id?: string | null
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
                    pdf_url: string | null
                    score: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tender_id: string
                    contractor_id: string
                    price: number
                    comment?: string | null
                    pdf_url?: string | null
                    score?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tender_id?: string
                    contractor_id?: string
                    price?: number
                    comment?: string | null
                    pdf_url?: string | null
                    score?: number | null
                    created_at?: string
                }
            }
            bid_items: {
                Row: {
                    id: string
                    bid_id: string
                    master_item_id: string | null
                    description: string
                    unit: string | null
                    quantity: number
                    unit_price: number | null
                    total_price: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    bid_id: string
                    master_item_id?: string | null
                    description: string
                    unit?: string | null
                    quantity: number
                    unit_price?: number | null
                    total_price?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    bid_id?: string
                    master_item_id?: string | null
                    description?: string
                    unit?: string | null
                    quantity?: number
                    unit_price?: number | null
                    total_price?: number | null
                    notes?: string | null
                    created_at?: string
                }
            }
            catalog_items: {
                Row: {
                    id: string
                    name: string
                    category: string | null
                    price: number | null
                    dimensions: Json | null
                    image_url: string | null
                    model_url: string | null
                    embedding: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category?: string | null
                    price?: number | null
                    dimensions?: Json | null
                    image_url?: string | null
                    model_url?: string | null
                    embedding?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string | null
                    price?: number | null
                    dimensions?: Json | null
                    image_url?: string | null
                    model_url?: string | null
                    embedding?: string | null
                    created_at?: string
                }
            }
            tender_invites: {
                Row: {
                    id: string
                    tender_id: string
                    email: string
                    token: string
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tender_id: string
                    email: string
                    token: string
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tender_id?: string
                    email?: string
                    token?: string
                    status?: string | null
                    created_at?: string
                }
            }
            timeline_events: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    category: string
                    event_date: string
                    media_urls: string[] | null
                    verified: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    category: string
                    event_date?: string
                    media_urls?: string[] | null
                    verified?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    category?: string
                    event_date?: string
                    media_urls?: string[] | null
                    verified?: boolean
                    created_at?: string
                }
            }
        }
        knowledge_base: {
            Row: {
                id: string
                content: string
                embedding: string | null
                metadata: Json
                created_at: string
            }
            Insert: {
                id?: string
                content: string
                embedding?: string | null
                metadata?: Json
                created_at?: string
            }
            Update: {
                id?: string
                content?: string
                embedding?: string | null
                metadata?: Json
                created_at?: string
            }
        }
        project_embeddings: {
            Row: {
                id: string
                project_id: string
                content: string
                embedding: string | null
                metadata: Json
                created_at: string
            }
            Insert: {
                id?: string
                project_id: string
                content: string
                embedding?: string | null
                metadata?: Json
                created_at?: string
            }
            Update: {
                id?: string
                project_id?: string
                content?: string
                embedding?: string | null
                metadata?: Json
                created_at?: string
            }
        }
    }
    Views: {
        [_ in never]: never
    }
    Functions: {
        match_knowledge_base: {
            Args: {
                query_embedding: string
                match_threshold: number
                match_count: number
            }
            Returns: {
                id: string
                content: string
                metadata: Json
                similarity: number
            }[]
        }
        match_project_context: {
            Args: {
                query_embedding: string
                target_project_id: string
                match_threshold: number
                match_count: number
            }
            Returns: {
                id: string
                content: string
                metadata: Json
                similarity: number
            }[]
        }
        search_catalog_items: {
            Args: {
                query_embedding: string
                match_threshold: number
                match_count: number
                filter_category?: string
            }
            Returns: {
                id: string
                name: string
                description: string
                price: number
                image_url: string
                similarity: number
            }[]
        }
    }
    Enums: {
        user_role: 'owner' | 'manager' | 'contractor' | 'viewer' | 'architect' | 'consultant' | 'inspector'
        doc_status: 'processing' | 'active' | 'archived' | 'rejected'
        tender_status: 'draft' | 'open' | 'review' | 'awarded' | 'closed'
    }
}
}
