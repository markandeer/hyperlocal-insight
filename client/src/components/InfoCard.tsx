import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: React.ReactNode;
  icon: LucideIcon;
  color: "primary" | "secondary" | "orange" | "green";
  children: React.ReactNode;
  delay?: number;
}

export function InfoCard({ title, icon: Icon, color, children }: InfoCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    secondary: "text-secondary bg-secondary/10 border-secondary/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed flex-1">
        {children}
      </div>
    </div>
  );
}
