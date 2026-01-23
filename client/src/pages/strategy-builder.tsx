import { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function StrategyBuilder() {
  const [missionInput, setMissionInput] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const tips = [
    "1. Define your core purpose: Why does your business exist beyond making a profit?",
    "2. Identify your target audience: Who are you serving and what problem are you solving for them?",
    "3. Highlight your unique value: What makes your approach different or better than competitors?"
  ];

  const handleGenerate = async () => {
    if (!missionInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/generate-mission", { input: missionInput });
      const data = await res.json();
      setResult(data.mission);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
            Strategy Builder
          </h1>
          <p className="text-xl text-primary/80 font-medium">Build your mission statement.</p>
        </motion.div>

        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-2 relative">
            <label className="text-sm font-bold uppercase tracking-widest text-primary/70 ml-1">
              Mission Statement Concept (Max 500 chars)
            </label>
            <div className="relative">
              {!missionInput && (
                <div className="absolute inset-0 p-6 pointer-events-none text-primary/40 font-medium space-y-4">
                  <p className="font-bold text-primary/60 uppercase tracking-widest text-xs mb-2">3 Tips for Building a Mission Statement:</p>
                  {tips.map((tip, i) => (
                    <p key={i} className="text-sm italic">{tip}</p>
                  ))}
                </div>
              )}
              <Textarea
                value={missionInput}
                onChange={(e) => setMissionInput(e.target.value.slice(0, 500))}
                className="min-h-[250px] bg-white border-primary/20 text-black rounded-2xl p-6 text-lg focus-visible:ring-primary/30"
              />
            </div>
            <div className="text-right text-xs text-primary/60 font-bold">
              {missionInput.length}/500
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !missionInput.trim()}
            className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-xl shadow-lg shadow-primary/25"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : "RESULT"}
          </Button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-3xl relative border-2 border-primary/20"
          >
            <button className="absolute top-4 right-4 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Pencil className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4">
              <Sparkles className="w-8 h-8 text-primary shrink-0 mt-1" />
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">Generated Result</h4>
                <div className="text-2xl font-display font-bold text-black leading-tight">
                  {result}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
