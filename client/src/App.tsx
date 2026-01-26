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
import SettingsPage from "@/pages/settings";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-3xl shadow-2xl">
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display font-bold text-primary uppercase tracking-tighter text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <DialogDescription className="text-primary/60 text-center font-medium">
              {isLogin 
                ? "Sign in to access your business insights and strategy reports." 
                : "Join hyperlocalmarketing.ai to start generating powerful market intelligence."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button 
              className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => window.location.href = "/api/login"}
            >
              {isLogin ? "Sign In with Replit" : "Sign Up with Replit"}
            </Button>
            
            <div className="text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary/40 hover:text-primary font-bold uppercase tracking-widest text-[10px] transition-colors underline underline-offset-4 decoration-primary/20"
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 p-4 text-center">
          <Button 
            variant="ghost" 
            className="text-primary/40 hover:text-primary font-bold uppercase tracking-widest text-[10px]"
            onClick={onClose}
          >
            Not now, take me back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Router() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleInactivity = () => {
      const choice = localStorage.getItem("autoLogoutChoice") || "never";
      if (choice === "5min") {
        const lastActive = parseInt(localStorage.getItem("lastActive") || "0");
        if (Date.now() - lastActive > 5 * 60 * 1000) {
          logout();
        }
      }
    };

    const updateActivity = () => {
      localStorage.setItem("lastActive", Date.now().toString());
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    const interval = setInterval(handleInactivity, 30000);

    const handleBeforeUnload = () => {
      const choice = localStorage.getItem("autoLogoutChoice") || "never";
      if (choice === "immediately") {
        // We can't await async logout here reliably, but we can clear auth status
        // and let the next visit handle it or hit the logout endpoint via beacon
        navigator.sendBeacon("/api/logout");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
    };
  }, [logout]);

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
        <Route path="/settings">
          {() => isAuthenticated ? <SettingsPage /> : <LandingPage />}
        </Route>
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
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
