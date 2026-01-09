export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = "owner" | "manager" | "contractor" | "viewer" | "architect" | "consultant" | "inspector";
export type DocStatus = "processing" | "active" | "archived" | "rejected";
export type TenderStatus = "draft" | "open" | "review" | "awarded" | "closed";

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_id: string | null
          payload: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_id?: string | null
          payload?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_id?: string | null
          payload?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      knowledge_base: {
        Row: {
          id: string
          content: string
          embedding: string | number[] | null // Vector is usually string in JS client or mapped
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content?: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      project_embeddings: {
        Row: {
          id: string
          project_id: string
          content: string
          embedding: string | number[] | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          content: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          content?: string
          embedding?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_embeddings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          property_id: string
          project_id: string | null
          uploader_id: string
          type: string
          file_url: string
          version: number | null
          ai_metadata: Json | null
          status: DocStatus | null
          created_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          project_id?: string | null
          uploader_id: string
          type: string
          file_url: string
          version?: number | null
          ai_metadata?: Json | null
          status?: DocStatus | null
          created_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          project_id?: string | null
          uploader_id?: string
          type?: string
          file_url?: string
          version?: number | null
          ai_metadata?: Json | null
          status?: DocStatus | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_items_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_items_master_item_id_fkey"
            columns: ["master_item_id"]
            isOneToOne: false
            referencedRelation: "boq_items"
            referencedColumns: ["id"]
          }
        ]
      }
      bids: {
        Row: {
          id: string
          tender_id: string
          contractor_id: string
          price: number
          comment: string
          proposal_text: string | null
          project_id: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tender_id: string
          contractor_id: string
          price: number
          comment: string
          proposal_text?: string | null
          project_id?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tender_id?: string
          contractor_id?: string
          price?: number
          comment?: string
          proposal_text?: string | null
          project_id?: string | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          property_id: string
          title: string
          architect_id: string | null
          status: "design" | "permitting" | "construction" | "handover"
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          title: string
          architect_id?: string | null
          status?: "design" | "permitting" | "construction" | "handover"
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          title?: string
          architect_id?: string | null
          status?: "design" | "permitting" | "construction" | "handover"
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_architect_id_fkey"
            columns: ["architect_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      permits: {
        Row: {
          id: string
          project_id: string
          authority: string
          status: "pending" | "approved" | "rejected"
          approval_doc_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          authority: string
          status?: "pending" | "approved" | "rejected"
          approval_doc_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          authority?: string
          status?: "pending" | "approved" | "rejected"
          approval_doc_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permits_approval_doc_id_fkey"
            columns: ["approval_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          company_name: string | null
          role: UserRole | null
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          role?: UserRole | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          role?: UserRole | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          address_data: Json | null
          specs: Json | null
          is_published: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          address_data?: Json | null
          specs?: Json | null
          is_published?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          address_data?: Json | null
          specs?: Json | null
          is_published?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
          status: TenderStatus | null
          project_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          owner_id: string
          title: string
          scope_of_work?: string | null
          budget_max?: number | null
          zone_tag?: string | null
          status?: TenderStatus | null
          project_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          owner_id?: string
          title?: string
          scope_of_work?: string | null
          budget_max?: number | null
          zone_tag?: string | null
          status?: TenderStatus | null
          project_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenders_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      master_boq: {
        Row: {
          id: string
          project_id: string
          status: "draft" | "final" | "approved"
          total_estimated_cost: number | null
          currency: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          status?: "draft" | "final" | "approved"
          total_estimated_cost?: number | null
          currency?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          status?: "draft" | "final" | "approved"
          total_estimated_cost?: number | null
          currency?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_boq_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      boq_items: {
        Row: {
          id: string
          master_boq_id: string
          item_code: string | null
          description: string
          unit: string | null
          quantity: number
          estimated_rate: number | null
          estimated_amount: number | null
          category: string | null
          specification_reference: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          master_boq_id: string
          item_code?: string | null
          description: string
          unit?: string | null
          quantity: number
          estimated_rate?: number | null
          estimated_amount?: number | null
          category?: string | null
          specification_reference?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          master_boq_id?: string
          item_code?: string | null
          description?: string
          unit?: string | null
          quantity?: number
          estimated_rate?: number | null
          estimated_amount?: number | null
          category?: string | null
          specification_reference?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_master_boq_id_fkey"
            columns: ["master_boq_id"]
            isOneToOne: false
            referencedRelation: "master_boq"
            referencedColumns: ["id"]
          }
        ]
      },
      spaces: {
        Row: {
          id: string
          project_id: string
          name: string
          dimensions: Json // { l, w, h }
          model_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          dimensions?: Json
          model_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          dimensions?: Json
          model_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      catalog_items: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          currency: string
          dimensions: Json
          image_url: string
          embedding: string | number[] | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          currency: string
          dimensions?: Json
          image_url: string
          embedding?: string | number[] | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          currency?: string
          dimensions?: Json
          image_url?: string
          embedding?: string | number[] | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      design_boards: {
        Row: {
          id: string
          space_id: string
          items: Json // Array of placed items
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          space_id: string
          items?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          space_id?: string
          items?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_boards_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_catalog_items: {
        Args: {
          query_embedding: string | number[]
          match_threshold: number
          match_count: number
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
      match_knowledge_base: {
        Args: {
          query_embedding: string | number[]
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
          query_embedding: string | number[]
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
    }
  }
}
}
