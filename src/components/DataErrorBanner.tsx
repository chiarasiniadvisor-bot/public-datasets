// src/components/DataErrorBanner.tsx
import React, { useState, useEffect } from 'react';
import { getLastFetchError } from '@/lib/dataService';

export function DataErrorBanner() {
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for fetch errors periodically
    const checkError = () => {
      const fetchError = getLastFetchError();
      if (fetchError) {
        setError(fetchError);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check immediately and then every 10 seconds
    checkError();
    const interval = setInterval(checkError, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !error) {
    return null;
  }

  const isFallback = error.includes('fallback');
  const message = isFallback 
    ? "⚠️ Dati non aggiornati — caricamento fallback / riprova più tardi"
    : "⚠️ Errore nel caricamento dati — riprova più tardi";

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-md mx-auto">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              {message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setIsVisible(false)}
              className="text-yellow-400 hover:text-yellow-600"
            >
              <span className="sr-only">Chiudi</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
