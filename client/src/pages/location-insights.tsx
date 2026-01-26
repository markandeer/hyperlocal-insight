import { Zap } from "lucide-react";
import { useReports } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Loader2, Calendar, MapPin, Briefcase, ArrowRight, FileText, Pencil, Check, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function LocationInsightsPage() {
  const { data: reports, isLoading } = useReports();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = reports?.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (report.name?.toLowerCase() || "").includes(searchLower) ||
      (report.businessType?.toLowerCase() || "").includes(searchLower) ||
      (report.address?.toLowerCase() || "").includes(searchLower)
    );
  });

  const startEditing = (e: React.MouseEvent, id: number, currentName: string | null, businessType: string) => {
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
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary mb-2 uppercase tracking-tight">Location Insights</h1>
            <p className="text-primary italic relative top-[6px]">Your generated market intelligence profiles.</p>
          </div>
          <div className="flex flex-col items-center gap-2 relative -top-[25px]">
            <a href="https://buy.stripe.com/6oU5kDaPVgFdetBckF7Zu01" target="_blank" rel="noopener noreferrer" className="w-48">
              <button className="w-full px-4 py-1.5 bg-[hsl(var(--linen))] text-primary rounded-xl font-bold hover:opacity-90 transition-colors shadow-lg shadow-black/5 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                Get Insights
              </button>
            </a>
            <Link href="/" className="w-48">
              <button className="w-full px-4 py-1.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px]">
                New Analysis
              </button>
            </Link>
          </div>
        </div>

        <div className="mb-8 max-w-md">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by Location Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-primary/10 h-12 rounded-xl pl-12 focus-visible:ring-primary/30 text-black font-medium placeholder:text-slate-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border-2 border-primary/10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 uppercase tracking-tight text-primary">No Insights Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Start by generating your first location insight on the home page.
            </p>
            <Link href="/">
              <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 uppercase tracking-widest">
                Create First Report
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports?.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="glass-card p-6 rounded-3xl border-2 border-primary/5 hover:border-primary/30 bg-white shadow-xl shadow-primary/5 transition-all duration-300 group h-full flex flex-col relative overflow-hidden">
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
                            className="h-8 bg-primary/5 border-primary/20 text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 placeholder:text-slate-400 placeholder:normal-case"
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
                          <button 
                            onClick={cancelEditing}
                            className="p-1 text-primary/40 hover:bg-primary/5 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
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
                            onClick={(e) => startEditing(e, report.id, report.name, report.businessType)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10 cursor-pointer hover:bg-primary/20 transition-colors"
                          >
                            <Briefcase className="w-3 h-3" />
                            {report.name || <span className="text-slate-400 normal-case font-medium">Name Input</span>}
                          </span>
                          <button 
                            onClick={(e) => startEditing(e, report.id, report.name, report.businessType)}
                            className="p-1.5 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mb-4">
                    <Link href={`/report/${report.id}`}>
                      <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                        Location Insights
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary/60 mb-4 px-1">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-medium line-clamp-1 italic">
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
      </div>
    </Layout>
  );
}
