/**
 * Supabase database types — source of truth for the schema.
 * Keep in sync with supabase/migrations/001_normalized_schema.sql
 *
 * Row/Insert/Update aliases are derived from this type (not the other way around)
 * so Supabase client generics resolve correctly.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      allowed_users: {
        Row: {
          email: string;
          created_at: string;
        };
        Insert: {
          email: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          book_id: string;
          title: string;
          story: string;
          location: string | null;
          memory_date: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          title: string;
          story?: string;
          location?: string | null;
          memory_date: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          title?: string;
          story?: string;
          location?: string | null;
          memory_date?: string;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      memory_photos: {
        Row: {
          id: string;
          memory_id: string;
          image_url: string;
          storage_path: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          image_url: string;
          storage_path?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          image_url?: string;
          storage_path?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      memory_perspectives: {
        Row: {
          id: string;
          memory_id: string;
          author_id: string;
          story: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memory_id: string;
          author_id: string;
          story: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          memory_id?: string;
          author_id?: string;
          story?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      memory_tags: {
        Row: {
          memory_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          memory_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          memory_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Derived row / insert / update aliases
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type AllowedUserRow = Database["public"]["Tables"]["allowed_users"]["Row"];
export type AllowedUserInsert =
  Database["public"]["Tables"]["allowed_users"]["Insert"];

export type BookRow = Database["public"]["Tables"]["books"]["Row"];
export type BookInsert = Database["public"]["Tables"]["books"]["Insert"];
export type BookUpdate = Database["public"]["Tables"]["books"]["Update"];

export type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];
export type MemoryInsert = Database["public"]["Tables"]["memories"]["Insert"];
export type MemoryUpdate = Database["public"]["Tables"]["memories"]["Update"];

export type MemoryPhotoRow = Database["public"]["Tables"]["memory_photos"]["Row"];
export type MemoryPhotoInsert =
  Database["public"]["Tables"]["memory_photos"]["Insert"];
export type MemoryPhotoUpdate =
  Database["public"]["Tables"]["memory_photos"]["Update"];

export type MemoryPerspectiveRow =
  Database["public"]["Tables"]["memory_perspectives"]["Row"];
export type MemoryPerspectiveInsert =
  Database["public"]["Tables"]["memory_perspectives"]["Insert"];
export type MemoryPerspectiveUpdate =
  Database["public"]["Tables"]["memory_perspectives"]["Update"];

export type TagRow = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export type MemoryTagRow = Database["public"]["Tables"]["memory_tags"]["Row"];
export type MemoryTagInsert =
  Database["public"]["Tables"]["memory_tags"]["Insert"];
export type MemoryTagUpdate =
  Database["public"]["Tables"]["memory_tags"]["Update"];

export type TableName = keyof Database["public"]["Tables"];

// Join types for nested selects
export interface MemoryWithRelations extends MemoryRow {
  memory_photos: Pick<
    MemoryPhotoRow,
    "image_url" | "display_order" | "storage_path"
  >[];
  memory_tags: { tag_id: string; tags: Pick<TagRow, "name"> | null }[];
  memory_perspectives: {
    story: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    profiles: Pick<ProfileRow, "display_name" | "email"> | null;
  }[];
  profiles: Pick<ProfileRow, "display_name" | "email"> | null;
}

export interface BookWithMemoryCount extends BookRow {
  memory_count: number;
}
