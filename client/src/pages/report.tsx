import { useRoute } from "wouter";
import { useReport } from "@/hooks/use-reports";
import { Layout } from "@/components/Layout";
import { MarketFunnelChart } from "@/components/MarketFunnelChart";
import { DemographicsChart } from "@/components/DemographicsChart";
import { InfoCard } from "@/components/InfoCard";
import { Loader2, MapPin, Store, Users, Sun, Car, TrendingUp, AlertTriangle, Target, Download } from "lucide-react";
import { motion } from "framer-motion";
import { AnalysisData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

export default function ReportPage() {
  const [, params] = useRoute("/report/:id");
  const id = parseInt(params?.id || "0");
  const { data: report, isLoading, error } = useReport(id);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#030303" // Match app background
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`market-report-${report?.businessType.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Retrieving market intelligence...</p>
        </div>
      </Layout>
    );
  }

  if (error || !report) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 glass-card rounded-2xl">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Analysis Not Found</h2>
            <p className="text-muted-foreground">We couldn't locate the report you requested. It may have been deleted or the ID is invalid.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Cast the generic JSONB data to our strongly typed schema
  const analysis = report.data as unknown as AnalysisData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-white/5"
        >
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Analysis Result</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">{report.businessType}</h1>
            <div className="flex items-center gap-2 text-primary font-medium">
              <MapPin className="w-4 h-4" />
              <span className="text-lg">{report.address}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
               <div className="text-sm text-primary/60 font-medium uppercase tracking-wider">Generated on</div>
               <div className="font-bold text-primary text-lg">
                 {new Date(report.createdAt || "").toLocaleDateString(undefined, { 
                   year: 'numeric', month: 'long', day: 'numeric' 
                 })}
               </div>
            </div>
            <Button 
              onClick={downloadPDF}
              variant="outline" 
              className="gap-2 bg-white/5 border-primary/20 text-primary hover:bg-primary/10 font-bold"
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </motion.div>

        <div ref={reportRef} className="space-y-8 bg-[#030303] p-6 rounded-2xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Market Size Section */}
            <motion.section variants={itemVariants}>
              <MarketFunnelChart data={analysis.marketSize} />
            </motion.section>

            {/* Demographics Section */}
            <motion.section variants={itemVariants}>
              <DemographicsChart data={analysis.demographics} />
              <div className="bg-white/5 border border-white/10 p-6 mt-6 rounded-xl">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-secondary" />
                  Demographic Insights
                </h4>
                <p className="text-white text-sm leading-relaxed">
                  {analysis.demographics.description}
                </p>
              </div>
            </motion.section>

            {/* Grid Section for Psychographics, Weather, Traffic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Psychographics */}
              <motion.div variants={itemVariants} className="h-full">
                <InfoCard title="Customer Profile" icon={Target} color="primary">
                  <div className="space-y-4 text-white">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Lifestyle</span>
                      <p>{analysis.psychographics.lifestyle}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Interests</span>
                      <div className="flex flex-wrap gap-2">
                        {analysis.psychographics.interests.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-white/10 rounded-md text-xs font-medium text-white">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Buying Behavior</span>
                      <p>{analysis.psychographics.buyingBehavior}</p>
                    </div>
                  </div>
                </InfoCard>
              </motion.div>

              {/* Weather & Seasonality */}
              <motion.div variants={itemVariants} className="h-full">
                <InfoCard title="Weather Impact" icon={Sun} color="orange">
                  <div className="space-y-4 text-white">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Seasonal Trends</span>
                      <p>{analysis.weather.seasonalTrends}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Business Impact</span>
                      <p>{analysis.weather.impactOnBusiness}</p>
                    </div>
                  </div>
                </InfoCard>
              </motion.div>

              {/* Traffic & Access */}
              <motion.div variants={itemVariants} className="h-full">
                <InfoCard title="Traffic & Access" icon={Car} color="green">
                  <div className="space-y-4 text-white">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Patterns</span>
                      <p>{analysis.traffic.typicalTraffic}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Peak Hours</span>
                      <p className="font-medium text-white">{analysis.traffic.peakHours}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide text-white/60 font-semibold mb-1 block">Challenges</span>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.traffic.challenges.map((challenge, i) => (
                          <li key={i}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </InfoCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
