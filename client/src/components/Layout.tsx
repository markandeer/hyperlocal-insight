import { Link, useLocation } from "wouter";
import { History, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-border bg-card/30 backdrop-blur-lg px-6 py-4 flex items-center justify-center sticky top-0 z-50">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Hyper Local Marketing AI
            </span>
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
