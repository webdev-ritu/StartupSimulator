import { UserRole } from "@/App";
import FounderDashboard from "@/components/dashboard/founder-dashboard";
import InvestorDashboard from "@/components/dashboard/investor-dashboard";

interface DashboardProps {
  userRole: UserRole;
}

export default function Dashboard({ userRole }: DashboardProps) {
  return userRole === "founder" ? <FounderDashboard /> : <InvestorDashboard />;
}
