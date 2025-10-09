// src/components/charts/DistribuzioneAnniCard.tsx
// Example: Year distributions (birth/profile) using useDashboardSeries

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useDatasets } from "@/hooks/useDatasets";
import { EmptyState } from "@/components/EmptyState";

export function DistribuzioneAnniNascitaCard() {
  const { comprehensive, loading, error } = useDatasets({ scope: "corsisti" });
  
  // Guardie robuste
  const safe = (arr?: {label: string; value: number}[]) =>
    Array.isArray(arr) ? arr.filter(d => d && d.value > 0) : [];

  const birthYearDistribution = safe(comprehensive?.dsProfilo?.annoNascita);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno di Nascita</CardTitle>
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
          <CardTitle>Distribuzione Anno di Nascita</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message={`Errore: ${error}`} />
        </CardContent>
      </Card>
    );
  }

  if (!loading && birthYearDistribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno di Nascita</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Nessun dato disponibile" />
        </CardContent>
      </Card>
    );
  }

  // Convert to format expected by BarChart
  const chartData = birthYearDistribution.map(item => ({
    year: item.label,
    count: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Anno di Nascita</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DistribuzioneAnniProfilazioneCard() {
  const { comprehensive, loading, error } = useDatasets({ scope: "corsisti" });
  
  // Guardie robuste
  const safe = (arr?: {label: string; value: number}[]) =>
    Array.isArray(arr) ? arr.filter(d => d && d.value > 0) : [];

  const profileYearDistribution = safe(comprehensive?.dsProfilo?.annoProfilazione);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno Profilazione</CardTitle>
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
          <CardTitle>Distribuzione Anno Profilazione</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message={`Errore: ${error}`} />
        </CardContent>
      </Card>
    );
  }

  if (!loading && profileYearDistribution.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuzione Anno Profilazione</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Nessun dato disponibile" />
        </CardContent>
      </Card>
    );
  }

  // Convert to format expected by BarChart
  const chartData = profileYearDistribution.map(item => ({
    year: item.label,
    count: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuzione Anno Profilazione</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
