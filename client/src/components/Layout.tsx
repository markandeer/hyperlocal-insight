import { Link, useLocation } from "wouter";
import { History, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/location-insights", label: "Location Insights" },
    { href: "/brand-strategy", label: "Brand Strategy" },
    { href: "/brand-identity", label: "Brand Identity" },
    { href: "/live-insights", label: "Live Insights" },
    { href: "/history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      {/* Top Navigation Header */}
      <header className="w-full border-b border-border bg-card/30 backdrop-blur-lg px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#c6e4f9] border-r-primary/20">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-primary font-display font-bold text-2xl uppercase tracking-tighter">
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-xl font-display font-bold uppercase tracking-tight py-2 transition-colors cursor-pointer",
                      location === item.href ? "text-primary" : "text-primary/60 hover:text-primary"
                    )}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group flex-1 justify-center mr-10">
            <span className="font-display font-bold text-xl tracking-tight text-foreground text-center">
              Hyper Local Marketing AI Insights
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
