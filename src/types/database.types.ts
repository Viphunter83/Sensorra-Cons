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
      documents: {
        Row: {
          id: string
          property_id: string
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
            foreignKeyName: "documents_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "owner" | "manager" | "contractor" | "viewer"
      doc_status: "processing" | "active" | "archived" | "rejected"
      tender_status: "draft" | "open" | "review" | "awarded" | "closed"
    }
  }
}
