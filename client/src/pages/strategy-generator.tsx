import { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2, Sparkles, Save, Check, Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BuilderSectionProps {
  title: string;
  label: string;
  tips: string[];
  generateEndpoint: string;
  saveEndpoint: string;
  type: "mission" | "vision" | "value" | "target" | "background";
  maxChars?: number;
}

function BuilderSection({ title, label, tips, generateEndpoint, saveEndpoint, type, maxChars = 500 }: BuilderSectionProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setResult("");
    setIsSaved(false);
    try {
      const res = await apiRequest("POST", generateEndpoint, { input });
      const data = await res.json();
      if (type === "mission") setResult(data.mission);
      else if (type === "vision") setResult(data.vision);
      else if (type === "value") setResult(data.value);
      else if (type === "target") setResult(data.targetMarket);
      else setResult(data.background);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to process ${type}.`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || isSaving) return;
    setIsSaving(true);
    try {
      let body: any;
      if (type === "mission") body = { mission: result, originalInput: input };
      else if (type === "vision") body = { vision: result, originalInput: input };
      else if (type === "value") body = { valueProposition: result, originalInput: input };
      else if (type === "target") body = { targetMarket: result, originalInput: input };
      else body = { background: result, originalInput: input };
      
      await apiRequest("POST", saveEndpoint, body);
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: [saveEndpoint] });
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} saved to Brand Strategy.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: `Failed to save ${type}.`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="space-y-2 relative">
          <div className="flex items-end justify-between ml-1 -translate-y-[10px]">
            <label className="text-sm font-bold uppercase tracking-widest text-primary/70">
              {label}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-full translate-y-[20px]">
                  <Info className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6 rounded-2xl border-primary/10 shadow-xl" align="end">
                <div className="space-y-4">
                  <p className="font-bold text-primary uppercase tracking-widest text-xs">3 Tips for Building a {type.charAt(0).toUpperCase() + type.slice(1)} Statement:</p>
                  {tips.map((tip, i) => (
                    <p key={i} className="text-sm text-primary/80 leading-relaxed italic">{tip}</p>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value.slice(0, maxChars));
                setIsSaved(false);
              }}
              className="min-h-[350px] bg-white border-primary/20 text-black rounded-2xl p-6 text-lg focus-visible:ring-primary/30"
            />
          </div>
          <div className="text-right text-xs text-primary/60 font-bold">
            {input.length}/{maxChars}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !input.trim()}
          className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-xl shadow-lg shadow-primary/25"
        >
          {isGenerating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            type === "background" ? "AI TRANSFORM" : "RESULT"
          )}
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-3xl relative border-2 border-primary/20"
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className={cn(
                "rounded-lg transition-colors",
                isSaved ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            </Button>
            <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Pencil className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">Generated Result</h4>
              <div className="text-xl font-medium text-black leading-relaxed whitespace-pre-wrap">
                {result.replace(/\*\*/g, '')}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function StrategyGenerator() {
  const missionTips = [
    "1. Define your core purpose: Why does your business exist beyond making a profit?",
    "2. Identify your target audience: Who are you serving and what problem are you solving for them?",
    "3. Highlight your unique value: What makes your approach different or better than competitors?"
  ];

  const visionTips = [
    "1. Think long-term: Where do you see your business in 5-10 years?",
    "2. Be ambitious: What is the ultimate impact you want to have on your industry or community?",
    "3. Keep it inspiring: What future state will motivate your team and attract customers?"
  ];

  const valueTips = [
    "1. Focus on the 'Why': What core benefit do you provide that no one else does?",
    "2. Address the customer's pain: How specifically do you solve their biggest frustration?",
    "3. Keep it punchy: A great value proposition should be understood in under 5 seconds."
  ];

  const targetTips = [
    "1. Define the 'Who': Be specific about demographics like age, location, and income level.",
    "2. Understand the 'Why': What motivates their purchasing decisions? What are their core values?",
    "3. Identify the 'How': Where do they hang out (online and offline)? How do they prefer to be contacted?"
  ];

  const backgroundTips = [
    "1. Tell your story: Share how and why your business was started.",
    "2. Highlight expertise: What unique experience or background do you bring to the table?",
    "3. Show personality: Let your brand's voice and character shine through."
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
            Strategy Generator
          </h1>
          <p className="text-xl text-primary/80 font-medium tracking-tight">Build your brand strategy foundations.</p>
        </motion.div>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Business Background</h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <BuilderSection
            title="Business Background"
            label="Business Background (Max 1000 characters)"
            tips={backgroundTips}
            generateEndpoint="/api/generate-background"
            saveEndpoint="/api/backgrounds"
            type="background"
            maxChars={1000}
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Target Market Builder</h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <BuilderSection
            title="Target Market Builder"
            label="Target Market Concept (Max 500 characters)"
            tips={targetTips}
            generateEndpoint="/api/generate-target"
            saveEndpoint="/api/target-markets"
            type="target"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Mission Builder</h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <BuilderSection
            title="Mission Builder"
            label="Mission Statement Concept (Max 500 characters)"
            tips={missionTips}
            generateEndpoint="/api/generate-mission"
            saveEndpoint="/api/missions"
            type="mission"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Vision Builder</h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <BuilderSection
            title="Vision Builder"
            label="Vision Statement Concept (Max 500 characters)"
            tips={visionTips}
            generateEndpoint="/api/generate-vision"
            saveEndpoint="/api/visions"
            type="vision"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-primary/10" />
            <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-widest">Value Proposition Builder</h2>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <BuilderSection
            title="Value Proposition Builder"
            label="Value Proposition Concept (Max 500 characters)"
            tips={valueTips}
            generateEndpoint="/api/generate-value"
            saveEndpoint="/api/values"
            type="value"
          />
        </section>
      </div>
    </Layout>
  );
}