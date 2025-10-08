// src/components/DebugData.tsx
// Debug component to show raw data structure and processing steps

import React from 'react';
import { fetchDatasets } from '@/lib/dataService';
import { toLabelValueSeries } from '@/lib/dataAdapters';

export function DebugData() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const datasets = await fetchDatasets({ scope: "corsisti" });
        setData(datasets);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-4">🔄 Loading debug data...</div>;
  if (error) return <div className="p-4 text-red-500">❌ Error: {error}</div>;
  if (!data) return <div className="p-4">No data</div>;

  const datasets = data.datasets || {};
  const atenei = datasets.distribuzione_atenei || [];
  const fonte = datasets.distribuzione_fonte || [];
  const annoNascita = datasets.distribuzione_anno_nascita || [];

  // Test adapter
  const ateneiAdapter = toLabelValueSeries(atenei);
  const fonteAdapter = toLabelValueSeries(fonte);
  const annoNascitaAdapter = toLabelValueSeries(annoNascita);

  return (
    <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-2xl font-bold">🔍 Debug Data Structure</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Distribuzione Atenei */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded border">
          <h3 className="font-bold mb-2">🏛️ Distribuzione Atenei</h3>
          <div className="text-sm space-y-1">
            <div>Raw count: {atenei.length}</div>
            <div>Adapter count: {ateneiAdapter.length}</div>
            {atenei.length > 0 && (
              <div className="mt-2">
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  First item: {JSON.stringify(atenei[0], null, 2)}
                </div>
              </div>
            )}
            {ateneiAdapter.length > 0 && (
              <div className="mt-2">
                <div className="text-xs">Adapter result:</div>
                <div className="font-mono text-xs bg-green-100 dark:bg-green-900 p-2 rounded">
                  {JSON.stringify(ateneiAdapter[0], null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distribuzione Fonte */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded border">
          <h3 className="font-bold mb-2">📊 Distribuzione Fonte</h3>
          <div className="text-sm space-y-1">
            <div>Raw count: {fonte.length}</div>
            <div>Adapter count: {fonteAdapter.length}</div>
            {fonte.length > 0 && (
              <div className="mt-2">
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  First item: {JSON.stringify(fonte[0], null, 2)}
                </div>
              </div>
            )}
            {fonteAdapter.length > 0 && (
              <div className="mt-2">
                <div className="text-xs">Adapter result:</div>
                <div className="font-mono text-xs bg-green-100 dark:bg-green-900 p-2 rounded">
                  {JSON.stringify(fonteAdapter[0], null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Distribuzione Anno Nascita */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded border">
          <h3 className="font-bold mb-2">🎂 Distribuzione Anno Nascita</h3>
          <div className="text-sm space-y-1">
            <div>Raw count: {annoNascita.length}</div>
            <div>Adapter count: {annoNascitaAdapter.length}</div>
            {annoNascita.length > 0 && (
              <div className="mt-2">
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  First item: {JSON.stringify(annoNascita[0], null, 2)}
                </div>
              </div>
            )}
            {annoNascitaAdapter.length > 0 && (
              <div className="mt-2">
                <div className="text-xs">Adapter result:</div>
                <div className="font-mono text-xs bg-green-100 dark:bg-green-900 p-2 rounded">
                  {JSON.stringify(annoNascitaAdapter[0], null, 2)}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* All Available Keys */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
        <h3 className="font-bold mb-2">🔑 All Available Keys in datasets</h3>
        <div className="text-sm">
          <div className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {Object.keys(datasets).join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
}
