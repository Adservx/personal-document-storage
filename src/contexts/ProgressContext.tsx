import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ProgressItem {
  id: string;
  type: 'upload' | 'delete' | 'download';
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface ProgressContextType {
  items: ProgressItem[];
  addProgress: (type: 'upload' | 'delete' | 'download', fileName: string) => string;
  updateProgress: (id: string, progress: number, status?: ProgressItem['status'], error?: string) => void;
  removeProgress: (id: string) => void;
  clearCompleted: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ProgressItem[]>([]);

  const addProgress = (type: 'upload' | 'delete' | 'download', fileName: string): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const item: ProgressItem = {
      id,
      type,
      fileName,
      progress: 0,
      status: 'pending'
    };
    
    setItems(prev => [...prev, item]);
    return id;
  };

  const updateProgress = (id: string, progress: number, status?: ProgressItem['status'], error?: string) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, progress, status: status || item.status, error }
        : item
    ));
  };

  const removeProgress = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => item.status === 'processing' || item.status === 'pending'));
  };

  return (
    <ProgressContext.Provider value={{
      items,
      addProgress,
      updateProgress,
      removeProgress,
      clearCompleted
    }}>
      {children}
    </ProgressContext.Provider>
  );
};