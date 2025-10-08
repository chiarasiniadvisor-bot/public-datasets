import ConversionDashboard from "@/components/ConversionDashboard";
import { EnvBadge } from "@/components/EnvBadge";
import { DataErrorBanner } from "@/components/DataErrorBanner";
import { TestCharts } from "@/components/TestCharts";

const Index = () => {
  return (
    <>
      <EnvBadge />
      <ConversionDashboard />
      <TestCharts />
      <DataErrorBanner />
    </>
  );
};

export default Index;
