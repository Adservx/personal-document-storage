export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          name: string;
          category: string;
          file_path: string;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          created_at: string;
          updated_at: string | null;
          description: string | null;
          tags: string[] | null;
          version: number | null;
          is_encrypted: boolean | null;
          user_id: string | null;
          access_level: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          file_path: string;
          file_url: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string | null;
          description?: string | null;
          tags?: string[] | null;
          version?: number | null;
          is_encrypted?: boolean | null;
          user_id?: string | null;
          access_level?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          file_path?: string;
          file_url?: string;
          file_type?: string | null;
          file_size?: number | null;
          created_at?: string;
          updated_at?: string | null;
          description?: string | null;
          tags?: string[] | null;
          version?: number | null;
          is_encrypted?: boolean | null;
          user_id?: string | null;
          access_level?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string | null;
          preferences: Record<string, any> | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          preferences?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          preferences?: Record<string, any> | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          details?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
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
  };
}