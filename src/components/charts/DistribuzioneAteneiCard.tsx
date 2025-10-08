// src/components/charts/DistribuzioneAteneiCard.tsx
// Example: Universities distribution chart using useDashboardSeries

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useDashboardSeries } from "@/hooks/useDashboardSeries";
import { EmptyState } from "@/components/EmptyState";

export function DistribuzioneAteneiCard() {
  const { universitiesDistribution, loading, error } = useDashboardSeries("corsisti");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Atenei</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Caricamento...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Atenei</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message={`Errore: ${error}`} />
        </CardContent>
      </Card>
    );
  }

  if (!universitiesDistribution.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Atenei</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Nessun dato disponibile" />
        </CardContent>
      </Card>
    );
  }

  // Convert to format expected by BarChart
  const chartData = universitiesDistribution
    .sort((a, b) => b.value - a.value)
    .slice(0, 20) // Show top 20
    .map(item => ({
      name: item.label,
      value: item.value
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Atenei (Top 20)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={180}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#ec4899" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
