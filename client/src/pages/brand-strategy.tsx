import { Layout } from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BrandMission, BrandVision, BrandValue } from "@shared/schema";
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

  const { data: missions, isLoading: isLoadingMissions } = useQuery<BrandMission[]>({
    queryKey: ["/api/missions"],
  });

  const { data: visions, isLoading: isLoadingVisions } = useQuery<BrandVision[]>({
    queryKey: ["/api/visions"],
  });

  const { data: values, isLoading: isLoadingValues } = useQuery<BrandValue[]>({
    queryKey: ["/api/values"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content, type }: { id: number; content: string; type: 'mission' | 'vision' | 'value' }) => {
      let endpoint: string;
      let body: any;
      if (type === 'mission') {
        endpoint = `/api/missions/${id}`;
        body = { mission: content };
      } else if (type === 'vision') {
        endpoint = `/api/visions/${id}`;
        body = { vision: content };
      } else {
        endpoint = `/api/values/${id}`;
        body = { valueProposition: content };
      }
      const res = await apiRequest("PATCH", endpoint, body);
      return res.json();
    },
    onSuccess: (_, variables) => {
      let queryKey: string;
      if (variables.type === 'mission') queryKey = "/api/missions";
      else if (variables.type === 'vision') queryKey = "/api/visions";
      else queryKey = "/api/values";
      
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setEditingId(null);
      toast({ title: "Updated", description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} updated successfully.` });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'mission' | 'vision' | 'value' }) => {
      let endpoint: string;
      if (type === 'mission') endpoint = `/api/missions/${id}`;
      else if (type === 'vision') endpoint = `/api/visions/${id}`;
      else endpoint = `/api/values/${id}`;
      
      await apiRequest("DELETE", endpoint);
    },
    onSuccess: (_, variables) => {
      let queryKey: string;
      if (variables.type === 'mission') queryKey = "/api/missions";
      else if (variables.type === 'vision') queryKey = "/api/visions";
      else queryKey = "/api/values";
      
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Deleted", description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} removed.` });
    }
  });

  const isLoading = isLoadingMissions || isLoadingVisions || isLoadingValues;

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
            Brand Strategy
          </h1>
          <p className="text-xl text-primary/80 font-medium">Your saved brand assets and strategy foundations.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-20">
            {/* Missions Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Mission Statement</h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              {!missions || missions.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl">
                  <p className="text-primary/60 text-lg font-medium italic">No saved mission statements yet.</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {missions.map((m, i) => (
                    <motion.div
                      key={`mission-${m.id}`}
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
                                  onClick={() => updateMutation.mutate({ id: m.id, content: editValue, type: 'mission' })}
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
                                      deleteMutation.mutate({ id: m.id, type: 'mission' });
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
            </section>

            {/* Visions Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Vision Statement</h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              {!visions || visions.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl">
                  <p className="text-primary/60 text-lg font-medium italic">No saved vision statements yet.</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {visions.map((v, i) => (
                    <motion.div
                      key={`vision-${v.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all rounded-3xl bg-white shadow-xl shadow-primary/5">
                        <CardContent className="p-8 space-y-6 relative">
                          <div className="absolute top-6 right-6 flex gap-2">
                            {editingId === v.id ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => updateMutation.mutate({ id: v.id, content: editValue, type: 'vision' })}
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
                                    setEditingId(v.id);
                                    setEditValue(v.vision);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary/40 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this vision?")) {
                                      deleteMutation.mutate({ id: v.id, type: 'vision' });
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
                              {new Date(v.createdAt || "").toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {editingId === v.id ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="text-2xl font-display font-bold text-black leading-tight border-primary/20 focus-visible:ring-primary/30 min-h-[120px]"
                              />
                            ) : (
                              <h3 className="text-3xl font-display font-bold text-black leading-tight pr-12">
                                "{v.vision}"
                              </h3>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Value Propositions Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Value Proposition</h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              {!values || values.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl">
                  <p className="text-primary/60 text-lg font-medium italic">No saved value propositions yet.</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {values.map((v, i) => (
                    <motion.div
                      key={`value-${v.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all rounded-3xl bg-white shadow-xl shadow-primary/5">
                        <CardContent className="p-8 space-y-6 relative">
                          <div className="absolute top-6 right-6 flex gap-2">
                            {editingId === v.id ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => updateMutation.mutate({ id: v.id, content: editValue, type: 'value' })}
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
                                    setEditingId(v.id);
                                    setEditValue(v.valueProposition);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary/40 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this value proposition?")) {
                                      deleteMutation.mutate({ id: v.id, type: 'value' });
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
                              {new Date(v.createdAt || "").toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {editingId === v.id ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="text-2xl font-display font-bold text-black leading-tight border-primary/20 focus-visible:ring-primary/30 min-h-[120px]"
                              />
                            ) : (
                              <h3 className="text-3xl font-display font-bold text-black leading-tight pr-12">
                                "{v.valueProposition}"
                              </h3>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
