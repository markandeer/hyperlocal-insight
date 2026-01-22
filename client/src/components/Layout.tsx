import { Link, useLocation } from "wouter";
import { LayoutDashboard, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-body">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card/30 backdrop-blur-lg p-6 flex flex-col gap-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Hyper Local AI
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground leading-relaxed px-4">
            We connect businesses with their local customers by fusing creative brilliance with strategy and AI technology.
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-border flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-foreground")} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 rounded-xl bg-white/10 border border-white/5">
            <h4 className="font-display font-semibold text-sm mb-1 text-foreground">Pro Insights</h4>
            <p className="text-xs text-foreground/80">AI-powered market analysis for your business.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
