import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { BrandMission } from "@shared/schema";
import { motion } from "framer-motion";
import { Loader2, Quote, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandStrategy() {
  const { data: missions, isLoading } = useQuery<BrandMission[]>({
    queryKey: ["/api/missions"],
  });

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
            Brand Strategy
          </h1>
          <p className="text-xl text-primary/80 font-medium">Your saved brand assets and mission statements.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : !missions || missions.length === 0 ? (
          <div className="text-center p-12 glass-card rounded-3xl">
            <p className="text-primary/60 text-lg font-medium italic">No saved mission statements yet. Use the Strategy Builder to create one!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {missions.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all rounded-3xl bg-white shadow-xl shadow-primary/5">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <Quote className="w-10 h-10 text-primary/20" />
                      <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.createdAt || "").toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-3xl font-display font-bold text-black leading-tight">
                        {m.mission}
                      </h3>
                    </div>

                    <div className="pt-6 border-t border-primary/5">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">Original Concept:</p>
                      <p className="text-sm text-primary/70 italic line-clamp-2">
                        "{m.originalInput}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
