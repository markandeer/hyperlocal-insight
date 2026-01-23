import { Layout } from "@/components/Layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BrandMission, BrandVision, BrandValue, BrandTargetMarket, BrandBackground } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Quote, Calendar, Pencil, Trash2, X, Check, Upload, Plus, Palette, Type, Box, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BrandStrategy() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("brand_logo"));
  const [elements, setElements] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem("brand_elements");
    return saved ? JSON.parse(saved) : [null, null, null];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const elementInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem("brand_colors");
    return saved ? JSON.parse(saved) : [
      { label: "Coral Red", hex: "#e26e6d" },
      { label: "Light Blue", hex: "#c6e4f9" },
      { label: "Highlight", hex: "#f0f9ff" },
      { label: "Deep Charcoal", hex: "#1a1a1a" },
      { label: "Accent 1", hex: "#f5f5f5" },
      { label: "Accent 2", hex: "#ffffff" }
    ];
  });

  useEffect(() => {
    try {
      if (logo) {
        if (logo.length > 2000000) {
          toast({ variant: "destructive", title: "File too large", description: "Please upload a smaller image to save it." });
          return;
        }
        localStorage.setItem("brand_logo", logo);
      } else {
        localStorage.removeItem("brand_logo");
      }
    } catch (e) {
      console.error("Storage quota exceeded", e);
      toast({ variant: "destructive", title: "Storage full", description: "Could not save logo. Try a smaller image." });
    }
  }, [logo]);

  useEffect(() => {
    try {
      localStorage.setItem("brand_elements", JSON.stringify(elements));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      toast({ variant: "destructive", title: "Storage full", description: "Could not save elements." });
    }
  }, [elements]);

  useEffect(() => {
    try {
      localStorage.setItem("brand_colors", JSON.stringify(colors));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [colors]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 2MB for storage." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 1MB for elements." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newElements = [...elements];
        newElements[index] = reader.result as string;
        setElements(newElements);
      };
      reader.readAsDataURL(file);
    }
  };

  const [typography, setTypography] = useState(() => {
    const saved = localStorage.getItem("brand_typography");
    return saved ? JSON.parse(saved) : {
      display: { name: "Clash Display", style: "Bold" },
      body: { name: "Inter", style: "Medium" }
    };
  });
  const [editingFont, setEditingFont] = useState<'display' | 'body' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("brand_typography", JSON.stringify(typography));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [typography]);

  const handleColorChange = (index: number, newHex: string) => {
    const newColors = [...colors];
    if (!newHex.startsWith("#") && newHex.length > 0) {
      newHex = "#" + newHex;
    }
    newColors[index].hex = newHex;
    setColors(newColors);
  };

  const handleFontChange = (type: 'display' | 'body', name: string) => {
    setTypography((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], name }
    }));
  };

  // Dynamically load Google Fonts
  useEffect(() => {
    const fontsToLoad = [typography.display.name, typography.body.name];
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const fontQuery = fontsToLoad
      .map(font => font.replace(/\s+/g, '+'))
      .join('|');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery.split('|').map((f, i) => {
      const weight = i === 0 ? typography.display.style : typography.body.style;
      const weightMap: Record<string, string> = {
        'Light': '300',
        'Regular': '400',
        'Medium': '500',
        'Semi-Bold': '600',
        'Bold': '700',
        'Extra-Bold': '800'
      };
      const w = weightMap[weight] || '400';
      return `${f}:wght@${w}`;
    }).join('&family=')}&display=swap`;
  }, [typography]);

  const { data: missions, isLoading: isLoadingMissions } = useQuery<BrandMission[]>({
    queryKey: ["/api/missions"],
  });

  const { data: visions, isLoading: isLoadingVisions } = useQuery<BrandVision[]>({
    queryKey: ["/api/visions"],
  });

  const { data: values, isLoading: isLoadingValues } = useQuery<BrandValue[]>({
    queryKey: ["/api/values"],
  });

  const { data: targetMarkets, isLoading: isLoadingTargetMarkets } = useQuery<BrandTargetMarket[]>({
    queryKey: ["/api/target-markets"],
  });

  const { data: backgrounds, isLoading: isLoadingBackgrounds } = useQuery<BrandBackground[]>({
    queryKey: ["/api/backgrounds"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content, type }: { id: number; content: string; type: 'mission' | 'vision' | 'value' | 'target' | 'background' }) => {
      let endpoint: string;
      let body: any;
      if (type === 'mission') {
        endpoint = `/api/missions/${id}`;
        body = { mission: content };
      } else if (type === 'vision') {
        endpoint = `/api/visions/${id}`;
        body = { vision: content };
      } else if (type === 'value') {
        endpoint = `/api/values/${id}`;
        body = { valueProposition: content };
      } else if (type === 'target') {
        endpoint = `/api/target-markets/${id}`;
        body = { targetMarket: content };
      } else {
        endpoint = `/api/backgrounds/${id}`;
        body = { background: content };
      }
      const res = await apiRequest("PATCH", endpoint, body);
      return res.json();
    },
    onSuccess: (_, variables) => {
      let queryKey: string;
      if (variables.type === 'mission') queryKey = "/api/missions";
      else if (variables.type === 'vision') queryKey = "/api/visions";
      else if (variables.type === 'value') queryKey = "/api/values";
      else if (variables.type === 'target') queryKey = "/api/target-markets";
      else queryKey = "/api/backgrounds";
      
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setEditingId(null);
      toast({ title: "Updated", description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} updated successfully.` });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'mission' | 'vision' | 'value' | 'target' | 'background' }) => {
      let endpoint: string;
      if (type === 'mission') endpoint = `/api/missions/${id}`;
      else if (type === 'vision') endpoint = `/api/visions/${id}`;
      else if (type === 'value') endpoint = `/api/values/${id}`;
      else if (type === 'target') endpoint = `/api/target-markets/${id}`;
      else endpoint = `/api/backgrounds/${id}`;
      
      await apiRequest("DELETE", endpoint);
    },
    onSuccess: (_, variables) => {
      let queryKey: string;
      if (variables.type === 'mission') queryKey = "/api/missions";
      else if (variables.type === 'vision') queryKey = "/api/visions";
      else if (variables.type === 'value') queryKey = "/api/values";
      else if (variables.type === 'target') queryKey = "/api/target-markets";
      else queryKey = "/api/backgrounds";
      
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Deleted", description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} removed.` });
    }
  });

  const isLoading = isLoadingMissions || isLoadingVisions || isLoadingValues || isLoadingTargetMarkets || isLoadingBackgrounds;

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
            {/* Background Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Business Background</h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              {!backgrounds || backgrounds.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl">
                  <p className="text-primary/60 text-lg font-medium italic">No saved business background profiles yet.</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {backgrounds.map((b, i) => (
                    <motion.div
                      key={`background-${b.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all rounded-3xl bg-white shadow-xl shadow-primary/5">
                        <CardContent className="p-8 space-y-6 relative">
                          <div className="absolute top-6 right-6 flex gap-2">
                            {editingId === b.id ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => updateMutation.mutate({ id: b.id, content: editValue, type: 'background' })}
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
                                    setEditingId(b.id);
                                    setEditValue(b.background);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary/40 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this business background profile?")) {
                                      deleteMutation.mutate({ id: b.id, type: 'background' });
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
                              {new Date(b.createdAt || "").toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {editingId === b.id ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="text-lg font-medium text-black leading-relaxed border-primary/20 focus-visible:ring-primary/30 min-h-[120px]"
                              />
                            ) : (
                              <p className="text-xl font-medium text-black leading-relaxed pr-12">
                                {b.background}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Target Market Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Target Market</h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              {!targetMarkets || targetMarkets.length === 0 ? (
                <div className="text-center p-12 glass-card rounded-3xl">
                  <p className="text-primary/60 text-lg font-medium italic">No saved target market profiles yet.</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {targetMarkets.map((t, i) => (
                    <motion.div
                      key={`target-${t.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all rounded-3xl bg-white shadow-xl shadow-primary/5">
                        <CardContent className="p-8 space-y-6 relative">
                          <div className="absolute top-6 right-6 flex gap-2">
                            {editingId === t.id ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:bg-green-50"
                                  onClick={() => updateMutation.mutate({ id: t.id, content: editValue, type: 'target' })}
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
                                    setEditingId(t.id);
                                    setEditValue(t.targetMarket);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-primary/40 hover:text-red-500 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this target market profile?")) {
                                      deleteMutation.mutate({ id: t.id, type: 'target' });
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
                              {new Date(t.createdAt || "").toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {editingId === t.id ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="text-2xl font-display font-bold text-black leading-tight border-primary/20 focus-visible:ring-primary/30 min-h-[120px]"
                              />
                            ) : (
                              <h3 className="text-3xl font-display font-bold text-black leading-tight pr-12">
                                "{t.targetMarket}"
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

            {/* Visual Identity Sections */}
            <div className="grid gap-20">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">1. Brand Logo</h2>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {!logo ? (
                  <Card 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-primary/10 rounded-3xl bg-[#f0f9ff]/30 p-12 text-center border-dashed cursor-pointer hover:bg-[#f0f9ff]/50 transition-all"
                  >
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-primary/40" />
                    </div>
                    <p className="text-primary/60 font-bold uppercase tracking-widest text-sm">Upload Primary Logo</p>
                    <Button variant="outline" className="mt-4 border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl">Choose File</Button>
                  </Card>
                ) : (
                  <div className="relative group max-w-md mx-auto">
                    <Card className="border-2 border-primary/10 rounded-3xl p-[10px] bg-white/80 flex items-center justify-center overflow-hidden shadow-inner min-h-[200px]">
                      <img src={logo} alt="Logo Preview" className="max-h-48 w-full object-contain rounded-2xl" />
                    </Card>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                      >
                        Change Logo
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">2. Brand Colors</h2>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {colors.map((c: any, idx: number) => (
                    <div key={idx} className="space-y-3 bg-white/40 p-4 rounded-2xl border-2 border-primary/5">
                      <div 
                        className="h-24 rounded-xl border-2 border-primary/5 shadow-inner transition-colors duration-300" 
                        style={{ background: c.hex.length === 7 || c.hex.length === 4 ? c.hex : "#cccccc" }} 
                      />
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{c.label}</label>
                        <Input 
                          value={c.hex}
                          onChange={(e) => handleColorChange(idx, e.target.value)}
                          className="h-9 text-xs font-mono uppercase border-primary/10 focus-visible:ring-primary/20 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">3. Typography</h2>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>
                <div className="grid gap-6">
                  <div className="p-8 bg-[#f0f9ff]/30 rounded-3xl border-2 border-primary/10 relative group overflow-hidden">
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-6">Primary Font (Display)</p>
                    {editingFont === 'display' ? (
                      <Input
                        autoFocus
                        value={typography.display.name}
                        onChange={(e) => handleFontChange('display', e.target.value)}
                        onBlur={() => setEditingFont(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingFont(null)}
                        className="text-4xl font-bold text-primary tracking-tighter uppercase h-auto py-2 bg-transparent border-primary/20"
                        style={{ fontFamily: typography.display.name }}
                      />
                    ) : (
                      <h2 className="text-4xl font-bold text-primary tracking-tighter uppercase" style={{ 
                        fontFamily: typography.display.name,
                        fontWeight: 
                          typography.display.style === 'Light' ? 300 :
                          typography.display.style === 'Regular' ? 400 :
                          typography.display.style === 'Medium' ? 500 :
                          typography.display.style === 'Semi-Bold' ? 600 :
                          typography.display.style === 'Bold' ? 700 : 800
                      }}>{typography.display.name}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/40">{typography.display.style}</p>
                      <Select 
                        value={typography.display.style} 
                        onValueChange={(val) => setTypography((prev: any) => ({ ...prev, display: { ...prev.display, style: val } }))}
                      >
                        <SelectTrigger className="h-7 w-28 text-[10px] uppercase font-bold tracking-widest border-primary/10 bg-white/50">
                          <SelectValue placeholder="Weight" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Light', 'Regular', 'Medium', 'Semi-Bold', 'Bold', 'Extra-Bold'].map(w => (
                            <SelectItem key={w} value={w} className="text-[10px] uppercase font-bold tracking-widest">{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingFont('display')}
                        className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                      >
                        Change Font
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 bg-[#f0f9ff]/30 rounded-3xl border-2 border-primary/10 relative group overflow-hidden">
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-6">Secondary Font (Body)</p>
                    {editingFont === 'body' ? (
                      <Input
                        autoFocus
                        value={typography.body.name}
                        onChange={(e) => handleFontChange('body', e.target.value)}
                        onBlur={() => setEditingFont(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingFont(null)}
                        className="text-lg text-primary leading-relaxed font-medium h-auto py-1 bg-transparent border-primary/20"
                        style={{ fontFamily: typography.body.name }}
                      />
                    ) : (
                      <p className="text-lg text-primary leading-relaxed" style={{ 
                        fontFamily: typography.body.name,
                        fontWeight: 
                          typography.body.style === 'Light' ? 300 :
                          typography.body.style === 'Regular' ? 400 :
                          typography.body.style === 'Medium' ? 500 :
                          typography.body.style === 'Semi-Bold' ? 600 :
                          typography.body.style === 'Bold' ? 700 : 800
                      }}>The quick brown fox jumps over the lazy dog. ({typography.body.name})</p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/40">{typography.body.style}</p>
                      <Select 
                        value={typography.body.style} 
                        onValueChange={(val) => setTypography((prev: any) => ({ ...prev, body: { ...prev.body, style: val } }))}
                      >
                        <SelectTrigger className="h-7 w-28 text-[10px] uppercase font-bold tracking-widest border-primary/10 bg-white/50">
                          <SelectValue placeholder="Weight" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Light', 'Regular', 'Medium', 'Semi-Bold', 'Bold', 'Extra-Bold'].map(w => (
                            <SelectItem key={w} value={w} className="text-[10px] uppercase font-bold tracking-widest">{w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingFont('body')}
                        className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                      >
                        Change Font
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">4. Brand Elements</h2>
                  <div className="h-px flex-1 bg-primary/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="space-y-4">
                      <input
                        type="file"
                        ref={elementInputRefs[idx]}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleElementUpload(idx, e)}
                      />
                      {!elements[idx] ? (
                        <div 
                          onClick={() => elementInputRefs[idx].current?.click()}
                          className="aspect-square rounded-3xl bg-[#f0f9ff]/30 border-2 border-primary/10 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-[#f0f9ff]/50 transition-all group"
                        >
                          <Plus className="w-8 h-8 text-primary/20 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-2">Upload Element</p>
                        </div>
                      ) : (
                        <div className="relative group aspect-square">
                          <Card className="h-full w-full border-2 border-primary/10 rounded-3xl p-[10px] bg-white/80 flex items-center justify-center overflow-hidden shadow-inner">
                            <img src={elements[idx]!} alt={`Element ${idx + 1}`} className="max-h-full w-full object-contain rounded-xl" />
                          </Card>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => elementInputRefs[idx].current?.click()}
                              className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
