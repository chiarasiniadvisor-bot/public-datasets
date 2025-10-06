import ConversionDashboard from "@/components/ConversionDashboard";
import WeeklyDeltaDashboard from "@/components/WeeklyDeltaDashboard";

const Index = () => {
  return (
    <div className="space-y-8">
      <ConversionDashboard />
      <WeeklyDeltaDashboard />
    </div>
  );
};

export default Index;
