import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100-80px)] px-6 py-20 text-center bg-[#c6e4f9]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-block px-8 py-4 bg-white/30 backdrop-blur-md rounded-full border border-white/40 mb-12">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs sm:text-sm">
              Creative Brilliance + AI Strategy
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-bold text-primary mb-12 leading-[1.1] uppercase tracking-tighter">
            Hyper Local<br />Marketing AI Insights
          </h1>

          <p className="max-w-3xl mx-auto text-xl sm:text-2xl md:text-3xl text-primary/80 font-medium leading-relaxed italic">
            Unlock the power of our advanced insight engine to drive local business growth by fusing creative brilliance with strategy and AI technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link href="/location-insights-generator">
            <button className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all uppercase tracking-widest hover:scale-105 active:scale-95 whitespace-nowrap">
              Local Insight Generator
            </button>
          </Link>
          <Link href="/strategy-generator">
            <button className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all uppercase tracking-widest hover:scale-105 active:scale-95 whitespace-nowrap">
              Brand Strategy Generator
            </button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
