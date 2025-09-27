import { supabase } from '../supabaseClient';
import type { Document, DocumentCategory, DocumentFilter, ApiResponse } from '../types';
import { generateFileName } from '../utils/helpers';

export class DocumentService {
  static async getDocuments(filter?: DocumentFilter): Promise<ApiResponse<Document[]>> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.searchTerm) {
        query = query.or(`name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
      }

      if (filter?.tags && filter.tags.length > 0) {
        query = query.contains('tags', filter.tags);
      }

      if (filter?.fileType) {
        query = query.eq('file_type', filter.fileType);
      }

      if (filter?.dateRange) {
        query = query
          .gte('created_at', filter.dateRange.start.toISOString())
          .lte('created_at', filter.dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        status: 'success',
        data: data || []
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch documents'
      };
    }
  }

  static async uploadDocument(
    file: File,
    category: DocumentCategory,
    metadata?: {
      description?: string;
      tags?: string[];
    }
  ): Promise<ApiResponse<Document>> {
    try {
      const fileName = generateFileName(file.name, category);
      const filePath = `${category}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document metadata
      const documentData = {
        name: file.name,
        category,
        file_path: filePath,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        description: metadata?.description || null,
        tags: metadata?.tags || null,
        version: 1,
        access_level: 'private' as const
      };

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        status: 'success',
        data: data as Document
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to upload document'
      };
    }
  }

  static async downloadDocument(document: Document): Promise<ApiResponse<Blob>> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      return {
        status: 'success',
        data
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to download document'
      };
    }
  }

  static async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      return {
        status: 'success'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to delete document'
      };
    }
  }

  static async updateDocument(
    documentId: string,
    updates: Partial<Pick<Document, 'name' | 'description' | 'tags' | 'category'>>
  ): Promise<ApiResponse<Document>> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;

      return {
        status: 'success',
        data: data as Document
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to update document'
      };
    }
  }
}