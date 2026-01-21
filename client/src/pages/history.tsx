import { useReports } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { Loader2, Calendar, MapPin, Briefcase, ArrowRight, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { data: reports, isLoading } = useReports();

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Analysis History</h1>
            <p className="text-muted-foreground">Archive of your generated market reports.</p>
          </div>
          <Link href="/">
            <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors border border-primary/20">
              New Analysis
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !reports || reports.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Start by generating your first hyper-local market analysis for any business location.
            </p>
            <Link href="/">
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-lg shadow-primary/20">
                Create First Report
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => (
              <Link key={report.id} href={`/report/${report.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 rounded-2xl group cursor-pointer hover:border-primary/30 hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-secondary -translate-x-2 group-hover:translate-x-0 transition-transform" />
                  </div>

                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/10">
                      <Briefcase className="w-3 h-3" />
                      {report.businessType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {report.address}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.createdAt || "").toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Completed
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
