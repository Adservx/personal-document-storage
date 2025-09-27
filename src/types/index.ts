export interface Document {
  id: string;
  user_id: string;
  name: string;
  category: DocumentCategory;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  description?: string;
  tags?: string[];
  version?: number;
  is_encrypted?: boolean;
  shared_with?: string[];
  access_level?: 'private' | 'shared' | 'public';
}

export type DocumentCategory = 
  | 'nepali_citizenship'
  | 'passport'
  | 'national_id'
  | 'birth_registration'
  | 'marriage_registration'
  | 'death_registration'
  | 'minor_citizenship'
  | 'nrn_id'
  | 'voter_id'
  | 'driving_license'
  | 'slc_see'
  | 'higher_secondary'
  | 'bachelors_degree'
  | 'masters_degree'
  | 'academic_transcripts'
  | 'character_certificate';

export interface DocumentFilter {
  category?: DocumentCategory;
  searchTerm?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  fileType?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  displayName?: string;
  photoURL?: string;
  created_at: string;
  updated_at?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  defaultCategory: DocumentCategory;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'download';
  resource_type: 'document' | 'user' | 'settings';
  resource_id: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}