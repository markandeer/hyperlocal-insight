import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateReport } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Search, MapPin, Briefcase, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReport = useCreateReport();
  
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !businessType) {
      toast({
        title: "Missing Information",
        description: "Please provide both an address and a business type.",
        variant: "destructive"
      });
      return;
    }

    try {
      const report = await createReport.mutateAsync({ address, businessType });
      setLocation(`/report/${report.id}`);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] md:min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[128px] -z-10" />

        <div className="w-full max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Creative Brilliance + AI Strategy
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight uppercase tracking-tighter">
              Hyper Local <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-white to-primary neon-text">
                Marketing AI
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mx-auto font-medium">
              We connect businesses with their local customers by fusing creative brilliance with strategy and AI technology.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-card p-2 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-secondary transition-colors" />
                <input
                  type="text"
                  placeholder="Enter specific address (e.g., 210 S Desplaines St, Chicago)"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Business Type (e.g., Coffee Shop, Gym, Dentist)"
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={createReport.isPending}
                className="mt-2 w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {createReport.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Market Data...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Generate Analysis
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Decorative elements */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
             {[
               { label: "Data Points", value: "50M+" },
               { label: "AI Analysis", value: "Real-time" },
               { label: "Accuracy", value: "98%" }
             ].map((stat) => (
               <div key={stat.label}>
                 <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
