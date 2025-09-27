import React from 'react';
import { DocumentsList } from './documents/DocumentsList';
import './MyDocumentsPage.css';

interface MyDocumentsPageProps {
  refreshTrigger: number;
}

export const MyDocumentsPage: React.FC<MyDocumentsPageProps> = ({ refreshTrigger }) => {
  return (
    <div className="my-documents-page animate-fade-in">
      <div className="container">
        <div className="page-header">
          <h1>My Documents</h1>
          <p>Secure document storage and management at your fingertips</p>
        </div>
        
        <div className="documents-content">
          <DocumentsList key={refreshTrigger} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};