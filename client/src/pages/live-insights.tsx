import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { useReports } from "@/hooks/use-reports";
import { Cloud, Car, Newspaper, Loader2, MapPin, ExternalLink, Calendar, Briefcase, Pencil, Check, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface LiveInsight {
  weather: {
    temp: string;
    condition: string;
    impact: string;
  };
  traffic: {
    status: string;
    delay: string;
    notablePatterns: string;
  };
  news: Array<{
    title: string;
    source: string;
    summary: string;
    date: string;
    category: string;
  }>;
}

export default function LiveInsights() {
  const { data: reports, isLoading: isLoadingReports } = useReports();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: insights, isLoading: isLoadingInsights } = useQuery<LiveInsight>({
    queryKey: ["/api/live-insights", selectedReportId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/live-insights/${selectedReportId}`);
      return res.json();
    },
    enabled: !!selectedReportId,
  });

  const startEditing = (e: React.MouseEvent, id: number, currentName: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName || "");
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const saveName = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editValue.trim()) return;

    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/reports/${id}`, { name: editValue });
      await queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Name Updated",
        description: "Location name has been saved.",
      });
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save the name. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4"
          >
            Live Insights
          </motion.h1>
          <p className="text-primary/60 italic">Real-time market intelligence affecting your locations.</p>
        </div>

        {isLoadingReports ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports?.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="glass-card p-6 rounded-3xl border-2 border-primary/5 hover:border-primary/30 bg-[#f0f9ff] shadow-xl shadow-primary/5 transition-all duration-300 group h-full flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <AnimatePresence mode="wait">
                      {editingId === report.id ? (
                        <motion.div 
                          key="editing"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex items-center gap-2 flex-1 mr-2"
                        >
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 bg-white border-primary/20 text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1"
                            placeholder="Name Input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveName(e as any, report.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button 
                            onClick={(e) => saveName(e, report.id)}
                            disabled={isSaving}
                            className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="static"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-2"
                        >
                          <span 
                            onClick={(e) => startEditing(e, report.id, report.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10 cursor-pointer hover:bg-white transition-colors"
                          >
                            <Briefcase className="w-3 h-3 text-[#e26e6d]" />
                            {report.name || <span className="text-slate-400 normal-case font-medium">Name Input</span>}
                          </span>
                          <button 
                            onClick={(e) => startEditing(e, report.id, report.name)}
                            className="p-1.5 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mb-4">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedReportId(report.id);
                        setTimeout(() => {
                          const detailsSection = document.getElementById('insight-details');
                          if (detailsSection) {
                            detailsSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className="w-full py-4 bg-[#e26e6d] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#e26e6d]/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      View Live Insights
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#e26e6d]/60 mb-4 px-1">
                    <MapPin className="w-4 h-4 shrink-0 text-[#e26e6d]" />
                    <p className="text-sm font-medium line-clamp-1 italic text-primary/80">
                      {report.address}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.createdAt || "").toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selectedReportId && (
            <motion.div
              id="insight-details"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="space-y-8 pt-8 border-t border-primary/10"
            >
              {isLoadingInsights ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : insights ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Weather */}
                  <motion.div
                    className="glass-card p-6 rounded-3xl border-2 border-primary/5 bg-white shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-sky-50 text-sky-500">
                        <Cloud className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-tight text-primary">Local Weather</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-4xl font-bold text-black">{insights?.weather?.temp || "N/A"}</div>
                        <div className="text-primary/60 font-medium italic">{insights?.weather?.condition || "Conditions unavailable"}</div>
                      </div>
                      <div className="pt-4 border-t border-primary/5">
                        <div className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-1">Business Impact</div>
                        <p className="text-sm text-primary/80 font-medium">{insights?.weather?.impact || "No impact analysis available"}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Traffic */}
                  <motion.div
                    className="glass-card p-6 rounded-3xl border-2 border-primary/5 bg-white shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
                        <Car className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-tight text-primary">Traffic Patterns</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${insights?.traffic?.status === 'Heavy' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="font-bold text-black">{insights?.traffic?.status || "Unknown"} Traffic</span>
                      </div>
                      <p className="text-sm text-primary/80 font-medium">{insights?.traffic?.notablePatterns || "Traffic patterns unavailable"}</p>
                      <div className="pt-4 border-t border-primary/5 text-xs text-primary/40 font-bold uppercase tracking-widest">
                        Est. Delay: {insights?.traffic?.delay || "None reported"}
                      </div>
                    </div>
                  </motion.div>

                  {/* News Feed - 5 Mile Radius */}
                  <motion.div
                    className="glass-card p-6 rounded-3xl border-2 border-primary/5 bg-white shadow-xl md:col-span-3"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-[#e26e6d]/10 text-[#e26e6d]">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-tight text-primary">Local News Feed</h2>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#e26e6d]/60 mb-6 px-1">Coverage: 5 Mile Radius • Real-time Updates</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {["Local Events", "Business & Economy", "Community Updates"].map((category) => (
                        <div key={category} className="space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary/40 pb-2 border-b border-primary/5">
                            {category}
                          </h3>
                          <div className="space-y-6">
                            {insights?.news
                              ?.filter(item => item.category === category || (!item.category && category === "Community Updates"))
                              .map((item, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-bold text-sm leading-snug group-hover:text-[#e26e6d] transition-colors">
                                      {item.title}
                                    </h4>
                                    <ExternalLink className="w-3 h-3 text-primary/20 shrink-0 group-hover:text-[#e26e6d] transition-colors" />
                                  </div>
                                  <p className="text-xs text-primary/60 line-clamp-2 mb-2 leading-relaxed italic">
                                    {item.summary}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-primary/40 font-bold uppercase tracking-widest">
                                    <span>{item.source}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {item.date}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {(insights?.news?.filter(item => item.category === category).length === 0 || !insights?.news) && (
                              <p className="text-xs text-primary/30 italic">No recent updates in this category.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
