import { useReports } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Loader2, Calendar, MapPin, Briefcase, ArrowRight, FileText, Pencil, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const { data: reports, isLoading } = useReports();
  const { toast } = useToast();
  const [editingReport, setEditingReport] = useState<{ id: number; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (e: React.MouseEvent, id: number, currentName: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingReport({ id, name: currentName || "" });
    setNewName(currentName || "");
  };

  const handleSave = async () => {
    if (!editingReport) return;
    setIsSaving(true);
    try {
      await apiRequest("PATCH", `/api/reports/${editingReport.id}`, { name: newName });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Renamed",
        description: "Your report has been updated successfully.",
      });
      setEditingReport(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not rename the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#c6e4f9] min-h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-2 uppercase tracking-tighter">Analysis History</h1>
            <p className="text-primary/60 italic font-medium">Archive of your generated market reports.</p>
          </div>
          <Link href="/">
            <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              New <br />Analysis
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border-2 border-primary/5 bg-[#f0f9ff]">
            <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-2 uppercase tracking-tight">No Reports Yet</h3>
            <p className="text-primary/60 italic max-w-sm mx-auto mb-8 font-medium">
              Start by generating your first hyper-local market analysis for any business location.
            </p>
            <Link href="/">
              <button className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all uppercase tracking-widest hover:scale-105 active:scale-95">
                Create First Report
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reports.map((report, index) => (
              <div key={report.id} className="relative group">
                <Link href={`/report/${report.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-6 rounded-3xl cursor-pointer border-2 border-primary/5 bg-[#f0f9ff] hover:border-primary/30 shadow-xl shadow-primary/5 transition-all duration-300 h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-primary/40 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <button
                        onClick={(e) => handleEditClick(e, report.id, report.name)}
                        className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-all z-20"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                        <Briefcase className="w-3 h-3 text-primary" />
                        {report.businessType}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-primary mb-3 line-clamp-2 uppercase tracking-tight leading-tight">
                      {report.name || report.address}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-primary/60 mb-6 px-1 italic">
                      <MapPin className="w-4 h-4 shrink-0 text-primary" />
                      <p className="text-sm font-medium line-clamp-1">
                        {report.address}
                      </p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-primary/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(report.createdAt || "").toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Completed
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Branded Renaming Modal */}
      <AnimatePresence>
        {editingReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingReport(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#c6e4f9] p-8 rounded-3xl shadow-2xl border-4 border-primary/20"
            >
              <h3 className="text-2xl font-display font-bold text-primary mb-6 uppercase tracking-tight">
                Rename Analysis
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/70 ml-1">
                    Analysis Name
                  </label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white border-primary/20 text-black h-12 rounded-xl focus-visible:ring-primary/30"
                    placeholder="Enter custom name..."
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingReport(null)}
                    className="flex-1 h-12 rounded-xl border-primary/10 text-primary hover:bg-primary/5 font-bold"
                  >
                    CANCEL
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !newName.trim()}
                    className="flex-1 h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "SAVE"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
