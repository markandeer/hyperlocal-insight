import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ReportPage from "@/pages/report";
import HistoryPage from "@/pages/history";
import StrategyBuilder from "@/pages/strategy-builder";
import BrandIdentity from "@/pages/brand-identity";
import MarketReach from "@/pages/market-reach";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/report/:id" component={ReportPage} />
      <Route path="/strategy-builder" component={StrategyBuilder} />
      <Route path="/brand-identity" component={BrandIdentity} />
      <Route path="/market-reach" component={MarketReach} />
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
