import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useReports } from "@/hooks/use-reports";
import { Cloud, Car, Newspaper, Loader2, MapPin, ExternalLink, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  }>;
}

export default function LiveInsights() {
  const { data: reports, isLoading: isLoadingReports } = useReports();
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data: insights, isLoading: isLoadingInsights } = useQuery<LiveInsight>({
    queryKey: ["/api/live-insights", selectedReportId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/live-insights/${selectedReportId}`);
      return res.json();
    },
    enabled: !!selectedReportId,
  });

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
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {reports?.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left group ${
                    selectedReportId === report.id
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-primary/5 bg-white hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={`w-4 h-4 ${selectedReportId === report.id ? "text-primary" : "text-primary/40"}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                      {report.businessType}
                    </span>
                  </div>
                  <h3 className="font-bold text-black line-clamp-1 group-hover:text-primary transition-colors">
                    {report.name || report.address}
                  </h3>
                </button>
              ))}
            </div>

            {selectedReportId ? (
              isLoadingInsights ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : insights ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Weather */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
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
                        <div className="text-4xl font-bold text-black">{insights.weather.temp}</div>
                        <div className="text-primary/60 font-medium italic">{insights.weather.condition}</div>
                      </div>
                      <div className="pt-4 border-t border-primary/5">
                        <div className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-1">Business Impact</div>
                        <p className="text-sm text-primary/80 font-medium">{insights.weather.impact}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Traffic */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                        <div className={`w-2 h-2 rounded-full ${insights.traffic.status === 'Heavy' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="font-bold text-black">{insights.traffic.status} Traffic</span>
                      </div>
                      <p className="text-sm text-primary/80 font-medium">{insights.traffic.notablePatterns}</p>
                      <div className="pt-4 border-t border-primary/5 text-xs text-primary/40 font-bold uppercase tracking-widest">
                        Est. Delay: {insights.traffic.delay}
                      </div>
                    </div>
                  </motion.div>

                  {/* News */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6 rounded-3xl border-2 border-primary/5 bg-white shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <h2 className="text-xl font-bold uppercase tracking-tight text-primary">Recent News</h2>
                    </div>
                    <div className="space-y-6">
                      {insights.news.map((item, idx) => (
                        <div key={idx} className={idx !== 0 ? "pt-4 border-t border-primary/5" : ""}>
                          <h3 className="font-bold text-sm mb-1 leading-snug group cursor-pointer hover:text-primary transition-colors flex items-center justify-between">
                            {item.title}
                            <ExternalLink className="w-3 h-3 text-primary/40" />
                          </h3>
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
                    </div>
                  </motion.div>
                </div>
              ) : null
            ) : (
              <div className="text-center py-20 glass-card rounded-3xl border-2 border-dashed border-primary/20">
                <p className="text-primary/40 font-bold uppercase tracking-[0.2em]">Select a location to view live insights</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
