import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.warn('Profile image failed to load:', user?.avatar_url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Profile image loaded successfully:', user?.avatar_url);
    setImageError(false);
  };

  // Get display name with fallback
  const displayName = user?.full_name || user?.displayName || 'User';
  
  // Get avatar URL with fallback to photoURL
  const avatarUrl = user?.avatar_url || user?.photoURL;
  
  // Generate initials for placeholder
  const getInitials = () => {
    if (displayName && displayName !== 'User') {
      const names = displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

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
              {avatarUrl && !imageError ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="user-avatar hover-scale"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="user-avatar-placeholder hover-scale">
                  {getInitials()}
                </div>
              )}
              <div className="user-details">
                <p className="user-name">{displayName}</p>
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