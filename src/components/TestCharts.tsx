// src/components/TestCharts.tsx
// Test component to verify useDashboardSeries hook is working

import React from 'react';
import { useDatasets } from '@/hooks/useDatasets';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TestCharts() {
  const { comprehensive, loading, error } = useDatasets({ scope: "corsisti" });
  
  // Extract data from comprehensive normalized datasets
  const sourceDistribution = comprehensive?.dsCorsisti?.fonte ?? [];
  const universitiesDistribution = comprehensive?.dsCorsisti?.atenei ?? [];
  const birthYearDistribution = comprehensive?.dsProfilo?.annoNascita ?? [];
  const profileYearDistribution = comprehensive?.dsProfilo?.annoProfilazione ?? [];

  console.log('[TEST] comprehensive normalized datasets result:', {
    loading,
    error,
    sourceDistribution: sourceDistribution.length,
    universitiesDistribution: universitiesDistribution.length,
    birthYearDistribution: birthYearDistribution.length,
    profileYearDistribution: profileYearDistribution.length,
  });

  if (loading) {
    return <div className="p-4">🔄 Caricamento dati...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">❌ Errore: {error}</div>;
  }

  // Check if any series has data
  const hasData = sourceDistribution.length > 0 || universitiesDistribution.length > 0 || 
                  birthYearDistribution.length > 0 || profileYearDistribution.length > 0;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">🧪 Test Charts - Comprehensive Normalized Data</h2>
      
      {!hasData && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          ⚠️ Nessun dato disponibile nei dataset normalizzati
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Count: {sourceDistribution.length}
          </div>
          {sourceDistribution.length > 0 ? (
            <div className="space-y-1">
              {sourceDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-mono">{item.value}</span>
                </div>
              ))}
              {sourceDistribution.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... e altri {sourceDistribution.length - 5} elementi
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nessun dato</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Atenei</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Count: {universitiesDistribution.length}
          </div>
          {universitiesDistribution.length > 0 ? (
            <div className="space-y-1">
              {universitiesDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-mono">{item.value}</span>
                </div>
              ))}
              {universitiesDistribution.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... e altri {universitiesDistribution.length - 5} elementi
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nessun dato</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno Nascita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Count: {birthYearDistribution.length}
          </div>
          {birthYearDistribution.length > 0 ? (
            <div className="space-y-1">
              {birthYearDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.x}</span>
                  <span className="font-mono">{item.y}</span>
                </div>
              ))}
              {birthYearDistribution.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... e altri {birthYearDistribution.length - 5} elementi
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nessun dato</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno Profilazione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Count: {profileYearDistribution.length}
          </div>
          {profileYearDistribution.length > 0 ? (
            <div className="space-y-1">
              {profileYearDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.x}</span>
                  <span className="font-mono">{item.y}</span>
                </div>
              ))}
              {profileYearDistribution.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ... e altri {profileYearDistribution.length - 5} elementi
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nessun dato</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
