import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LocationInsightsGenerator from "@/pages/location-insights-generator";
import ReportPage from "@/pages/report";
import HistoryPage from "@/pages/history";
import StrategyGenerator from "@/pages/strategy-generator";
import BrandStrategy from "@/pages/brand-strategy";
import BrandIdentity from "@/pages/brand-identity";
import LiveInsights from "@/pages/live-insights";
import LocationInsightsPage from "@/pages/location-insights";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-primary uppercase tracking-tighter">
            Sign Up Required
          </DialogTitle>
          <DialogDescription className="text-primary/60">
            Please sign up or log in to access this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button 
            className="w-full h-12 bg-primary text-white font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign Up / Log In
          </Button>
          <Button 
            variant="ghost" 
            className="text-primary/40 font-bold uppercase tracking-widest text-[10px]"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if the current route is not root and not a public route
    // In this app, everything except navigating the hamburger (which stays on current page)
    // or the initial landing page might be considered "doing something"
    // The user specifically said "anytime the user wants to do anything except navigate the three line hamburger"
    // We'll trigger it on any route change away from "/" if not authenticated
    if (!isLoading && !isAuthenticated && location !== "/") {
      setIsAuthModalOpen(true);
      // We don't force a redirect yet, just show the modal
    }
  }, [location, isAuthenticated, isLoading]);

  return (
    <>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/location-insights-generator">
          {() => isAuthenticated ? <LocationInsightsGenerator /> : <LandingPage />}
        </Route>
        <Route path="/location-insights">
          {() => isAuthenticated ? <LocationInsightsPage /> : <LandingPage />}
        </Route>
        <Route path="/history">
          {() => isAuthenticated ? <HistoryPage /> : <LandingPage />}
        </Route>
        <Route path="/report/:id">
          {() => isAuthenticated ? <ReportPage /> : <LandingPage />}
        </Route>
        <Route path="/strategy-generator">
          {() => isAuthenticated ? <StrategyGenerator /> : <LandingPage />}
        </Route>
        <Route path="/brand-strategy">
          {() => isAuthenticated ? <BrandStrategy /> : <LandingPage />}
        </Route>
        <Route path="/brand-identity">
          {() => isAuthenticated ? <BrandIdentity /> : <LandingPage />}
        </Route>
        <Route path="/live-insights">
          {() => isAuthenticated ? <LiveInsights /> : <LandingPage />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          if (location !== "/") setLocation("/");
        }} 
      />
    </>
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
