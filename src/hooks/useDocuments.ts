import { useState, useEffect, useCallback } from 'react';
import { DocumentService } from '../services/documentService';
import type { Document, DocumentFilter } from '../types';
import { debounce } from '../utils/helpers';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocumentFilter>({});

  const fetchDocuments = useCallback(async (currentFilter?: DocumentFilter) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await DocumentService.getDocuments(currentFilter || filter);
      if (result.status === 'success') {
        setDocuments(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch documents');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const debouncedFetch = useCallback(
    debounce((newFilter: DocumentFilter) => {
      fetchDocuments(newFilter);
    }, 300),
    [fetchDocuments]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const updateFilter = useCallback((newFilter: Partial<DocumentFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    debouncedFetch(updatedFilter);
  }, [filter, debouncedFetch]);

  const uploadDocument = useCallback(async (file: File, category: string, metadata?: any) => {
    setLoading(true);
    try {
      const result = await DocumentService.uploadDocument(file, category as any, metadata);
      if (result.status === 'success') {
        await fetchDocuments();
        return result;
      } else {
        setError(result.error || 'Upload failed');
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Upload failed';
      setError(error);
      return { status: 'error' as const, error };
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    setLoading(true);
    try {
      const result = await DocumentService.deleteDocument(documentId);
      if (result.status === 'success') {
        await fetchDocuments();
        return result;
      } else {
        setError(result.error || 'Delete failed');
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Delete failed';
      setError(error);
      return { status: 'error' as const, error };
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const updateDocument = useCallback(async (documentId: string, updates: any) => {
    setLoading(true);
    try {
      const result = await DocumentService.updateDocument(documentId, updates);
      if (result.status === 'success') {
        await fetchDocuments();
        return result;
      } else {
        setError(result.error || 'Update failed');
        return result;
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Update failed';
      setError(error);
      return { status: 'error' as const, error };
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return {
    documents,
    groupedDocuments,
    loading,
    error,
    filter,
    updateFilter,
    uploadDocument,
    deleteDocument,
    updateDocument,
    refetch: fetchDocuments
  };
};