import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { Document } from '../../types';
import { DocumentCard } from './DocumentCard';
import { DOCUMENT_CATEGORIES, getDocumentCategory } from '../../utils/constants';
import './DocumentsList.css';

interface DocumentsListProps {
  refreshTrigger: number;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { addProgress, updateProgress } = useProgress();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchDocuments = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get the authenticated user ID from Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      const userId = authUser?.id || user.id;
      
      if (!userId) {
        throw new Error('No user ID available');
      }
      
      console.log('📋 Fetching documents for user:', userId);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false});
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('✅ Fetched', data?.length || 0, 'documents');
      setDocuments(data || []);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshTrigger]);

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
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

  // Filtered and sorted documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: 'date' | 'name' | 'size') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

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
            <span className="total-count">{filteredAndSortedDocuments.length} of {documents.length}</span>
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

            <div className="sort-controls">
              <button
                onClick={() => handleSortChange('date')}
                className={`sort-btn btn ${sortBy === 'date' ? 'btn-primary' : 'btn-secondary'}`}
                title={`Sort by date ${sortBy === 'date' ? (sortOrder === 'desc' ? '(newest first)' : '(oldest first)') : ''}`}
              >
                📅 Date
                {sortBy === 'date' && (
                  <span className="sort-indicator">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSortChange('name')}
                className={`sort-btn btn ${sortBy === 'name' ? 'btn-primary' : 'btn-secondary'}`}
                title={`Sort by name ${sortBy === 'name' ? (sortOrder === 'desc' ? '(Z-A)' : '(A-Z)') : ''}`}
              >
                🔤 Name
                {sortBy === 'name' && (
                  <span className="sort-indicator">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSortChange('size')}
                className={`sort-btn btn ${sortBy === 'size' ? 'btn-primary' : 'btn-secondary'}`}
                title={`Sort by size ${sortBy === 'size' ? (sortOrder === 'desc' ? '(largest first)' : '(smallest first)') : ''}`}
              >
                📊 Size
                {sortBy === 'size' && (
                  <span className="sort-indicator">
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            </div>

            <div className="view-controls">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                title="Grid view"
              >
                ⚏
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedDocuments.length > 0 ? (
        <div className={`documents-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
          {filteredAndSortedDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className="document-item animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <DocumentCard
              document={doc}
              onDownload={handleDownload}
              onDelete={handleDelete}
                viewMode={viewMode}
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