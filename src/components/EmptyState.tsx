// src/components/EmptyState.tsx
// Reusable empty state component for charts with no data

import React from 'react';

export interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  message = "Nessun dato disponibile", 
  icon,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">
          {icon}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

export default EmptyState;
