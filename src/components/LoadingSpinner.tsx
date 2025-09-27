import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse' | 'progress';
  text?: string;
  className?: string;
  progress?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  variant = 'spinner',
  text,
  className = '',
  progress
}) => {
  const containerClassName = `loading-spinner-container ${className}`;
  
  if (variant === 'dots') {
    return (
      <div className={containerClassName}>
        <div className={`loading-dots ${size}`}>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={containerClassName}>
        <div className={`loading-pulse ${size}`}></div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  if (variant === 'progress' && progress !== undefined) {
    return (
      <div className={containerClassName}>
        <div className={`progress-spinner ${size}`}>
          <div className="progress-ring"></div>
          <div 
            className="progress-fill" 
            style={{
              transform: `rotate(${(progress / 100) * 360}deg)`
            }}
          ></div>
          <div className="progress-center">
            {Math.round(progress)}%
          </div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className={`modern-spinner ${size} primary`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-core"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader: React.FC<{
  variant: 'text' | 'avatar' | 'button' | 'custom';
  width?: string;
  height?: string;
  className?: string;
}> = ({ variant, width, height, className = '' }) => {
  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div 
      className={`skeleton-loader skeleton-${variant} ${className}`}
      style={style}
    />
  );
};