import React, { useRef, useState, useCallback } from 'react';
import { DOCUMENT_CATEGORIES } from '../../utils/constants';
import './UploadSection.css';

interface UploadSectionProps {
  onFileUpload: (file: File, category: string) => void;
  loading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  loading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const handleFileSelect = useCallback((file: File) => {
    if (!selectedCategory) return;
    
    onFileUpload(file, selectedCategory);
    setSelectedCategory('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedCategory, onFileUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (!selectedCategory) return;
    fileInputRef.current?.click();
  };



  return (
    <section className="upload-section animate-fade-in">
      <div className="upload-header">
        <h2 className="section-title">Upload Document</h2>
        <p className="section-subtitle">Drag & drop your files or click to browse</p>
      </div>
      
      <div className="upload-form">
        <div className="form-group animate-fade-in animate-stagger-1">
          <label htmlFor="category" className="form-label">
            <span className="label-icon">📁</span>
            Document Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select input focus-ring"
            disabled={loading}
          >
            <option value="">Choose a category...</option>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div 
          className={`drop-zone ${isDragActive ? 'drag-active' : ''} ${!selectedCategory ? 'disabled' : ''} animate-fade-in animate-stagger-2`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={selectedCategory ? handleUploadClick : undefined}
        >
          <div className="drop-zone-content">
            <div className={`drop-zone-icon ${isDragActive ? 'bounce' : 'float'}`}>
              {isDragActive ? '📤' : '☁️'}
            </div>
            <div className="drop-zone-text">
              <p className="drop-zone-primary">
                {isDragActive ? 'Drop your file here' : 'Drop files here or click to browse'}
              </p>
              <p className="drop-zone-secondary">
                Supports: Images, PDFs, Word docs, Text files (max 25MB)
              </p>
            </div>
            {!selectedCategory && (
              <div className="drop-zone-warning">
                <span className="warning-icon">⚠️</span>
                Please select a category first
              </div>
            )}
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={loading}
      />
    </section>
  );
};