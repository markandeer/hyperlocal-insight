import { Link, useLocation } from "wouter";
import { History, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-border bg-card/30 backdrop-blur-lg px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Hyper Local AI
            </span>
          </div>
        </Link>

        <Link href="/history">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 group cursor-pointer border",
              location === "/history"
                ? "bg-primary/10 text-primary border-primary/20"
                : "text-foreground border-transparent hover:bg-white/5 hover:border-white/10"
            )}
          >
            <History className={cn("w-5 h-5", location === "/history" ? "text-primary" : "text-foreground")} />
            <span className="font-medium">History</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
