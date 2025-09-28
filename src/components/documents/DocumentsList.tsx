import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useProgress } from '../../contexts/ProgressContext';
import { Document } from '../../types';
import { DocumentCard } from './DocumentCard';
import { DOCUMENT_CATEGORIES, getDocumentCategory } from '../../utils/constants';
import { decryptDocument, generateUserEncryptionKey } from '../../utils/encryption';
import './DocumentsList.css';

interface DocumentsListProps {
  refreshTrigger: number;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ refreshTrigger }) => {
  const { user, isReady } = useSupabaseAuth();
  const { addProgress, updateProgress } = useProgress();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // Removed viewMode state - using list view only

  const fetchDocuments = useCallback(async () => {
    if (!user?.id || !isReady) {
      console.log('User not ready or no user ID available, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Use Firebase user ID directly since we're using Firebase auth
      const userId = user.id;
      
      console.log('📋 Fetching documents for user:', userId);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          is_encrypted,
          encryption_metadata,
          encryption_version
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false});
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('✅ Fetched', data?.length || 0, 'documents');
      
      // Debug: Check encryption status of documents
      if (data && data.length > 0) {
        const encryptedCount = data.filter(doc => doc.is_encrypted).length;
        console.log(`🔒 Encrypted documents: ${encryptedCount}/${data.length}`);
        data.forEach(doc => {
          if (doc.is_encrypted) {
            console.log(`🔐 Encrypted: ${doc.name} (metadata: ${!!doc.encryption_metadata})`);
          }
        });
      }
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
      // If there's an auth error, it might be because the user session expired
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Auth') || errorMessage.includes('session')) {
        console.log('Authentication issue detected, user may need to re-login');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isReady]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  const handleDownload = async (doc: Document) => {
    if (!user?.id) {
      console.error('User not authenticated for download');
      return;
    }

    const progressId = addProgress('download', doc.name);
    
    try {
      updateProgress(progressId, 10, 'processing');
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);
      
      if (error) throw error;
      
      updateProgress(progressId, 50, 'processing');
      
      let finalBlob = data;
      let fileName = doc.name;
      
      // Check if document is encrypted
      if (doc.is_encrypted && doc.encryption_metadata) {
        updateProgress(progressId, 70, 'processing');
        
        // Generate user encryption key
        const encryptionKey = await generateUserEncryptionKey(user.id);
        
        // Decrypt the file
        const decryptedBlob = await decryptDocument(data, doc.encryption_metadata, encryptionKey);
        finalBlob = decryptedBlob;
        
        // Use original filename from metadata
        fileName = doc.encryption_metadata.originalName || doc.name;
      }
      
      updateProgress(progressId, 90, 'processing');
      
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      
      updateProgress(progressId, 100, 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      updateProgress(progressId, 0, 'error', 'Download failed');
    }
  };

  const handleDelete = async (doc: Document) => {
    const progressId = addProgress('delete', doc.name);
    
    try {
      updateProgress(progressId, 20, 'processing');
      
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);
      
      if (storageError) throw storageError;
      
      updateProgress(progressId, 70);
      
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);
      
      if (dbError) throw dbError;
      
      updateProgress(progressId, 100, 'success');
      await fetchDocuments();
    } catch (error) {
      updateProgress(progressId, 0, 'error', 'Failed to delete document');
    }
  };

  // Filtered documents (sorted by date descending by default)
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategory]);


  if (loading) {
    return (
      <div className="documents-loading animate-fade-in">
        <div className="loading-skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="loading-skeleton card animate-pulse">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line skeleton-line-short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-line-long"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="documents-list animate-fade-in">
      <div className="documents-header">
        <div className="header-top">
          <h2 className="documents-title">My Documents</h2>
          <div className="documents-stats">
            <span className="total-count">{filteredDocuments.length} of {documents.length}</span>
          </div>
        </div>

        <div className="documents-controls">
          <div className="search-section">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input input focus-ring"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn btn-ghost"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter input focus-ring"
            >
              <option value="">All Categories</option>
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>


            {/* View controls removed - using list view only */}
          </div>
        </div>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="documents-container list-view">
          {filteredDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className="document-item animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <DocumentCard
                document={doc}
                onDownload={handleDownload}
                onDelete={handleDelete}
                viewMode="list"
              />
            </div>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="empty-search-state animate-fade-in">
          <div className="empty-search-icon">🔍</div>
          <h3>No documents found</h3>
          <p>
            {searchQuery && selectedCategory 
              ? `No documents match "${searchQuery}" in the ${getDocumentCategory(selectedCategory)?.label} category`
              : searchQuery 
              ? `No documents match "${searchQuery}"`
              : selectedCategory
              ? `No documents in the ${getDocumentCategory(selectedCategory)?.label} category`
              : 'Try adjusting your search or filters'
            }
          </p>
          <div className="empty-search-actions">
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                Clear Search
              </button>
            )}
            {selectedCategory && (
              <button onClick={() => setSelectedCategory('')} className="btn btn-secondary">
                Show All Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state animate-fade-in">
          <div className="empty-state-icon">📄</div>
          <h3>No documents yet</h3>
          <p>Upload your first document to get started</p>
          <div className="empty-state-features">
            <div className="feature-item">
              <span className="feature-icon">☁️</span>
              <span>Drag & drop support</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure storage</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📁</span>
              <span>Easy organization</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};