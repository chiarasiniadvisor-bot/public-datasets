// src/components/EnvBadge.tsx
import React from 'react';

export function EnvBadge() {
  // Read environment variables
  const mode = import.meta.env.MODE;
  const envLabel = import.meta.env.VITE_ENV_LABEL;
  
  // Determine badge text and visibility
  const isProduction = mode === 'production';
  const badgeText = envLabel || (isProduction ? 'PROD' : 'STAGING');
  
  // Don't show badge in production unless explicitly set
  if (isProduction && !envLabel) {
    return null;
  }
  
  return (
    <div 
      className="fixed top-3 right-3 z-50 px-2 py-1 text-xs font-medium rounded-md border"
      style={{
        opacity: 0.7,
        backgroundColor: badgeText === 'PROD' ? '#10b981' : '#f59e0b',
        color: '#ffffff',
        borderColor: badgeText === 'PROD' ? '#059669' : '#d97706',
      }}
    >
      {badgeText}
    </div>
  );
}
