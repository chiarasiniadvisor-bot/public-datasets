import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchHistoricalData, calculateDeltaData, getWeeklyTrendData, type DeltaData, type HistoricalData } from '@/lib/historicalData';

export default function WeeklyDeltaDashboard() {
  const [deltaData, setDeltaData] = useState<DeltaData | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const historicalData = await fetchHistoricalData();
        
        if (historicalData.weekly.length < 2) {
          setError('Dati storici insufficienti per calcolare i delta settimanali. Servono almeno 2 settimane di dati.');
          return;
        }
        
        const delta = calculateDeltaData(historicalData);
        const trends = getWeeklyTrendData(historicalData);
        
        setDeltaData(delta);
        setTrendData(trends);
        setError(null);
      } catch (err: any) {
        console.error('Error loading historical data:', err);
        setError(`Errore nel caricamento dei dati: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Caricamento dati storici...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!deltaData || deltaData.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Nessun dato disponibile</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Trend ultimi periodi</h2>
        <button
          onClick={() => setShowPercentage(!showPercentage)}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          {showPercentage ? 'Mostra valori assoluti' : 'Mostra variazione %'}
        </button>
      </div>

      {/* Period Info */}
      <div className="text-sm text-gray-600">
        Dal {deltaData.week_previous} al {deltaData.week_current}
      </div>

      {/* Delta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deltaData.items.map((item, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valore attuale:</span>
                  <span className="font-semibold">{item.current?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prev:</span>
                  <span className="text-sm">{item.previous?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rate attuale:</span>
                  <span className="font-semibold">
                    {item.rate_current ? `${(item.rate_current * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prev:</span>
                  <span className="text-sm">
                    {item.rate_previous ? `${(item.rate_previous * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Δ assoluto:</span>
                  <span className={`font-semibold ${(item.delta_abs || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.delta_abs !== null ? `${item.delta_abs > 0 ? '+' : ''}${item.delta_abs.toLocaleString()}` : 'N/A'}
                    {(item.delta_abs || 0) !== 0 && (
                      <span className="ml-1">
                        {(item.delta_abs || 0) > 0 ? '↗' : '↘'}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Δ punti %:</span>
                  <span className={`font-semibold ${(item.delta_pp || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.delta_pp !== null ? `${item.delta_pp > 0 ? '+' : ''}${item.delta_pp.toFixed(1)} pp` : 'N/A'}
                    {(item.delta_pp || 0) !== 0 && (
                      <span className="ml-1">
                        {(item.delta_pp || 0) > 0 ? '↗' : '↘'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trendData.map((trend, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{trend.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        showPercentage ? `${(value * 100).toFixed(1)}%` : value.toLocaleString(),
                        showPercentage ? 'Rate' : 'Valore'
                      ]}
                      labelFormatter={(label) => `Settimana: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={showPercentage ? "rate" : "value"} 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {showPercentage ? 'Valore assoluto per settimana' : 'Valore assoluto per settimana'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}