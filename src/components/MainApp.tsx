import React, { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { Header } from './layout/Header';
import { UploadSection } from './documents/UploadSection';
import { MyDocumentsPage } from './MyDocumentsPage';
import { ProgressBar } from './ProgressBar';
import './MainApp.css';

export const MainApp: React.FC = () => {
  const { user } = useAuth();
  const { addProgress, updateProgress } = useProgress();
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState<'upload' | 'documents'>('documents');

  const handleFileUpload = useCallback(async (file: File, category: string) => {
    if (!user?.id) return;

    // Validate file
    if (!file) return;
    
    if (file.size > 25 * 1024 * 1024) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) return;

    const progressId = addProgress('upload', file.name);
    
    try {
      setLoading(true);
      updateProgress(progressId, 10, 'processing');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      updateProgress(progressId, 30);
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      updateProgress(progressId, 70);
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(`Authentication error: ${authError.message}`);
      
      const userId = authUser?.id || user.id;
      
      const documentData = {
        user_id: userId,
        name: file.name,
        category,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        file_path: fileName,
        file_url: publicUrl
      };
      
      updateProgress(progressId, 90);
      const { error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select();

      if (dbError) {
        await supabase.storage.from('documents').remove([fileName]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      updateProgress(progressId, 100, 'success');
      setCurrentPage('documents');
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 100);

    } catch (error: any) {
      updateProgress(progressId, 0, 'error', error.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [user?.id, addProgress, updateProgress]);

  return (
    <div className="main-app theme-transition">
      <Header />
      
      <nav className="main-nav animate-slide-in">
        <div className="container">
          <div className="nav-buttons">
            <button
              onClick={() => setCurrentPage('upload')}
              className={`nav-btn hover-lift ${currentPage === 'upload' ? 'active' : ''}`}
            >
              <span className="nav-icon">📤</span>
              <span>Upload Documents</span>
            </button>
            <button
              onClick={() => setCurrentPage('documents')}
              className={`nav-btn hover-lift ${currentPage === 'documents' ? 'active' : ''}`}
            >
              <span className="nav-icon">📁</span>
              <span>My Documents</span>
            </button>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <div className={`page-content ${currentPage === 'upload' ? 'animate-fade-in' : 'animate-slide-up'}`}>
          {currentPage === 'upload' ? (
            <div className="container">
              <div className="page-header animate-fade-in animate-stagger-1">
                <h1 className="page-title">SecureDoc Manager</h1>
                <p className="page-subtitle">Upload and manage your documents securely</p>
              </div>
              
              <div className="animate-fade-in animate-stagger-2">
                <UploadSection
                  onFileUpload={handleFileUpload}
                  loading={loading}
                />
              </div>
            </div>
          ) : (
            <MyDocumentsPage key={refreshTrigger} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </main>
      
      <ProgressBar />
    </div>
  );
};