import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LocationInsightsGenerator from "@/pages/location-insights-generator";
import ReportPage from "@/pages/report";
import HistoryPage from "@/pages/history";
import StrategyBuilder from "@/pages/strategy-builder";
import BrandStrategy from "@/pages/brand-strategy";
import BrandIdentity from "@/pages/brand-identity";
import LiveInsights from "@/pages/live-insights";
import LocationInsightsPage from "@/pages/location-insights";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/location-insights-generator" component={LocationInsightsGenerator} />
      <Route path="/location-insights" component={LocationInsightsPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/report/:id" component={ReportPage} />
      <Route path="/strategy-builder" component={StrategyBuilder} />
      <Route path="/brand-strategy" component={BrandStrategy} />
      <Route path="/brand-identity" component={BrandIdentity} />
      <Route path="/live-insights" component={LiveInsights} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
