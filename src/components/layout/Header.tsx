import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <div className="brand animate-fade-in">
          <span className="brand-icon animate-float">📄</span>
          <span className="brand-title">SecureDoc Manager</span>
        </div>
        

        
        {user && (
          <div className="user-section animate-slide-in">
            <div className="user-info">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name || 'User'} 
                  className="user-avatar hover-scale"
                />
              ) : (
                <div className="user-avatar-placeholder hover-scale">
                  {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="user-details">
                <p className="user-name">{user.full_name || 'User'}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="logout-btn btn-secondary hover-lift">
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};