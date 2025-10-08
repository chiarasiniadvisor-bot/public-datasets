import ConversionDashboard from "@/components/ConversionDashboard";
import { EnvBadge } from "@/components/EnvBadge";
import { DataErrorBanner } from "@/components/DataErrorBanner";

const Index = () => {
  return (
    <>
      <EnvBadge />
      <ConversionDashboard />
      <DataErrorBanner />
    </>
  );
};

export default Index;
