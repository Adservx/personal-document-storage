import React from 'react';
import { useProgress } from '../contexts/ProgressContext';

export const ProgressBar: React.FC = () => {
  const { items, removeProgress, clearCompleted } = useProgress();

  if (items.length === 0) return null;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Operations</h3>
        <button onClick={clearCompleted} className="clear-btn">
          Clear Completed
        </button>
      </div>
      
      {items.map(item => (
        <div key={item.id} className={`progress-item ${item.status}`}>
          <div className="progress-info">
            <span className="progress-icon">
              {item.type === 'upload' ? '📤' : '🗑️'}
            </span>
            <div className="progress-details">
              <div className="progress-filename">{item.fileName}</div>
              <div className="progress-status">
                {item.status === 'pending' && 'Preparing...'}
                {item.status === 'processing' && `${item.type === 'upload' ? 'Uploading' : 'Deleting'}... ${Math.round(item.progress)}%`}
                {item.status === 'success' && `${item.type === 'upload' ? 'Uploaded' : 'Deleted'} successfully`}
                {item.status === 'error' && (item.error || 'Operation failed')}
              </div>
            </div>
            <button 
              onClick={() => removeProgress(item.id)}
              className="remove-btn"
              title="Remove"
            >
              ×
            </button>
          </div>
          
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
      
      <style>{`
        .progress-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          max-height: 400px;
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e5e7eb;
          z-index: 1000;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .progress-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }
        
        .clear-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .clear-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .progress-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f9fafb;
        }
        
        .progress-item:last-child {
          border-bottom: none;
        }
        
        .progress-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .progress-icon {
          font-size: 18px;
          margin-top: 2px;
        }
        
        .progress-details {
          flex: 1;
          min-width: 0;
        }
        
        .progress-filename {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .progress-status {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        
        .remove-btn:hover {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .progress-bar-track {
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-bar-fill {
          height: 100%;
          background: #3b82f6;
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        
        .progress-item.success .progress-bar-fill {
          background: #10b981;
        }
        
        .progress-item.error .progress-bar-fill {
          background: #ef4444;
        }
        
        .progress-item.error .progress-status {
          color: #ef4444;
        }
        
        .progress-item.success .progress-status {
          color: #10b981;
        }
        
        @media (max-width: 640px) {
          .progress-container {
            left: 20px;
            right: 20px;
            width: auto;
          }
        }
      `}</style>
    </div>
  );
};