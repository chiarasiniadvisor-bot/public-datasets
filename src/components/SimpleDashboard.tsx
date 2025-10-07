import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchDatasets } from "@/lib/dataService";
import { useTranslation } from "react-i18next";

export function SimpleDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Loading data from backend...");
        const datasets = await fetchDatasets();
        console.log("✅ Data loaded:", datasets);
        setData(datasets);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-500 mb-4">No Data Available</h2>
        </div>
      </div>
    );
  }

  const funnel = data.datasets?.funnel || [];
  const locale = "it-IT";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Secret SSM</h1>
          <p className="text-xl text-gray-300">SCUOLE DI SPECIALIZZAZIONE IN MEDICINA</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white text-center">
                Panel de Analytics
              </CardTitle>
              <p className="text-center text-gray-300">Embudo de Conversión</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Funnel Steps */}
              <div className="space-y-4">
                {funnel.map((step: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {step.step}
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {step.value.toLocaleString(locale)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {index === 0 ? "100%" : 
                           `${((step.value / funnel[0].value) * 100).toFixed(1)}% de leads`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${index === 0 ? 100 : (step.value / funnel[0].value) * 100}%`,
                          background: `hsl(${index * 60}, 70%, 50%)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Debug Info */}
              <div className="mt-8 p-4 bg-black/20 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Debug Info</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Generated At: {data.meta?.generatedAt || "N/A"}</p>
                  <p>Total Contacts: {data.meta?.totalRows || "N/A"}</p>
                  <p>Funnel Steps: {funnel.length}</p>
                  <p>Data Source: Backend (GitHub Raw)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
