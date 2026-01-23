import { useReports } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Loader2, Calendar, MapPin, Briefcase, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function LocationInsightsPage() {
  const { data: reports, isLoading } = useReports();

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary mb-2 uppercase tracking-tight">Location Insights</h1>
            <p className="text-primary italic relative top-[6px]">Your generated market intelligence profiles.</p>
          </div>
          <Link href="/">
            <button className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 uppercase tracking-widest text-xs relative -top-[10px]">
              New Analysis
            </button>
          </Link>
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
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/report/${report.id}`}>
                  <div className="glass-card p-6 rounded-3xl cursor-pointer border-2 border-primary/5 hover:border-primary/30 bg-white shadow-xl shadow-primary/5 transition-all duration-300 group h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                        <Briefcase className="w-3 h-3" />
                        {report.businessType}
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>

                    <h3 className="text-xl font-bold text-black mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {report.name || report.address}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-primary/60 mb-4">
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
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
