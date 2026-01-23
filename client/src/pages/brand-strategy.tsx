import { Layout } from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BrandMission } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Quote, Calendar, Pencil, Trash2, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function BrandStrategy() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: missions, isLoading } = useQuery<BrandMission[]>({
    queryKey: ["/api/missions"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, mission }: { id: number; mission: string }) => {
      const res = await apiRequest("PATCH", `/api/missions/${id}`, { mission });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Mission statement updated successfully." });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/missions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Deleted", description: "Mission statement removed." });
    }
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
                  <CardContent className="p-8 space-y-6 relative">
                    <div className="absolute top-6 right-6 flex gap-2">
                      {editingId === m.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:bg-green-50"
                            onClick={() => updateMutation.mutate({ id: m.id, mission: editValue })}
                            disabled={updateMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary/40 hover:text-primary hover:bg-primary/5"
                            onClick={() => {
                              setEditingId(m.id);
                              setEditValue(m.mission);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary/40 hover:text-red-500 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this mission?")) {
                                deleteMutation.mutate(m.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-start">
                      <Quote className="w-10 h-10 text-primary/20" />
                      <div className="flex items-center gap-2 text-xs font-bold text-primary/40 uppercase tracking-widest mr-20">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.createdAt || "").toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {editingId === m.id ? (
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-2xl font-display font-bold text-black leading-tight border-primary/20 focus-visible:ring-primary/30 min-h-[120px]"
                        />
                      ) : (
                        <h3 className="text-3xl font-display font-bold text-black leading-tight pr-12">
                          "{m.mission}"
                        </h3>
                      )}
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
