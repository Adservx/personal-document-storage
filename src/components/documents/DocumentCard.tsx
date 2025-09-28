import React from 'react';
import { Document } from '../../types';
import { getDocumentCategory } from '../../utils/constants';
import { EncryptionBadge } from './EncryptionBadge';
import { EncryptedImagePreview } from './EncryptedImagePreview';
import './DocumentCard.css';

interface DocumentCardProps {
  document: Document;
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
  viewMode?: 'list'; // Only supports list view
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('text')) return '📋';
  return '📄';
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDownload,
  onDelete,
  viewMode = 'list' // Default to list view
}) => {
  const isImage = document.file_type?.startsWith('image/');

  return (
    <div className="document-card card hover-lift animate-fade-in list-mode">
      <div className="document-preview">
        {isImage ? (
          document.is_encrypted ? (
            <EncryptedImagePreview
              document={document}
              className="preview-image hover-scale"
              alt={document.name}
            />
          ) : (
            <img
              src={document.file_url}
              alt={document.name}
              className="preview-image hover-scale"
              loading="lazy"
            />
          )
        ) : (
          <div className="file-icon animate-float">
            <span className="icon-symbol">{getFileIcon(document.file_type || '')}</span>
            <div className="file-type-label">{document.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}</div>
          </div>
        )}
        <div className="preview-overlay">
          <button
            onClick={() => onDownload(document)}
            className="preview-action btn-ghost"
            title="Quick Download"
          >
            ⬇️
          </button>
        </div>
      </div>
      
      <div className="document-content">
        <div className="document-header">
          <div className="category-badge animate-pulse">{getDocumentCategory(document.category)?.label || document.category}</div>
          <div className="document-badges">
            <EncryptionBadge isEncrypted={document.is_encrypted} />
            <div className="document-status">
              <span className="status-dot"></span>
            </div>
          </div>
        </div>
        
        <h3 className="document-title" title={document.name}>{document.name}</h3>
        
        <div className="document-meta">
          <div className="meta-item">
            <span className="meta-icon">📊</span>
            <span className="file-size">{formatFileSize(document.file_size)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="upload-date">{formatDate(document.created_at)}</span>
          </div>
        </div>
        
        <div className="document-actions">
          <button
            onClick={() => onDownload(document)}
            className="btn btn-primary hover-glow"
          >
            <span className="btn-icon">⬇️</span>
            <span>Download</span>
          </button>
          <button
            onClick={() => onDelete(document)}
            className="btn btn-secondary hover-lift"
            title="Delete Document"
          >
            <span className="btn-icon">🗑️</span>
          </button>
        </div>
      </div>
    </div>
  );
};