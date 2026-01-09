export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          status: Database["public"]["Enums"]["doc_status"] | null
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
          status?: Database["public"]["Enums"]["doc_status"] | null
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
          status?: Database["public"]["Enums"]["doc_status"] | null
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
          role: Database["public"]["Enums"]["user_role"] | null
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          company_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          company_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
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
          status: Database["public"]["Enums"]["tender_status"] | null
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
          status?: Database["public"]["Enums"]["tender_status"] | null
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
          status?: Database["public"]["Enums"]["tender_status"] | null
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
    }
    Enums: {
      user_role: "owner" | "manager" | "contractor" | "viewer" | "architect" | "consultant" | "inspector"
      doc_status: "processing" | "active" | "archived" | "rejected"
      tender_status: "draft" | "open" | "review" | "awarded" | "closed"
    }
  }
}
