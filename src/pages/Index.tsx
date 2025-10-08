import ConversionDashboard from "@/components/ConversionDashboard";
import { EnvBadge } from "@/components/EnvBadge";
import { DataErrorBanner } from "@/components/DataErrorBanner";
import { TestCharts } from "@/components/TestCharts";
import { DebugData } from "@/components/DebugData";

const Index = () => {
  return (
    <>
      <EnvBadge />
      <ConversionDashboard />
      <TestCharts />
      <DebugData />
      <DataErrorBanner />
    </>
  );
};

export default Index;
