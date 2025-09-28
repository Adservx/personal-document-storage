import React from 'react';
import './EncryptionBadge.css';

interface EncryptionBadgeProps {
  isEncrypted?: boolean;
  size?: 'small' | 'medium';
}

export const EncryptionBadge: React.FC<EncryptionBadgeProps> = ({ 
  isEncrypted = false,
  size = 'small' 
}) => {
  if (!isEncrypted) return null;

  return (
    <div className={`encryption-badge ${size}`} title="This document is encrypted for security">
      <span className="encryption-icon">🔒</span>
      <span className="encryption-text">Encrypted</span>
    </div>
  );
};
