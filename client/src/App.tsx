import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import PitchRoom from "@/pages/pitch-room";
import Startups from "@/pages/startups";
import Investors from "@/pages/investors";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import { useState } from "react";

export type UserRole = "founder" | "investor";

function App() {
  const [userRole, setUserRole] = useState<UserRole>("founder");

  return (
    <QueryClientProvider client={queryClient}>
      <Layout userRole={userRole} onRoleChange={setUserRole}>
        <Switch>
          <Route path="/" component={() => <Dashboard userRole={userRole} />} />
          <Route path="/pitch-room" component={PitchRoom} />
          <Route path="/startups" component={Startups} />
          <Route path="/investors" component={Investors} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
