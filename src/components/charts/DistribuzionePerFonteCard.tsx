// src/components/charts/DistribuzionePerFonteCard.tsx
// Example: Distribution by Source chart using useDashboardSeries

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useDatasets } from "@/hooks/useDatasets";
import { EmptyState } from "@/components/EmptyState";

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

export function DistribuzionePerFonteCard() {
  const { comprehensive, loading, error } = useDatasets({ scope: "corsisti" });
  
  // Guardie robuste
  const safe = (arr?: {label: string; value: number}[]) =>
    Array.isArray(arr) ? arr.filter(d => d && d.value > 0) : [];

  const sourceDistribution = safe(comprehensive?.dsCorsisti?.fonte);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Fonte</CardTitle>
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
          <CardTitle>Distribuzione per Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message={`Errore: ${error}`} />
        </CardContent>
      </Card>
    );
  }

  if (!loading && sourceDistribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione per Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Nessun dato disponibile" />
        </CardContent>
      </Card>
    );
  }

  // Convert to format expected by PieChart
  const chartData = sourceDistribution.map(item => ({
    name: item.label,
    value: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione per Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
