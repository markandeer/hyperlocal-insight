import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function MarketReach() {
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter"
        >
          Market Reach
        </motion.h1>
        <p className="text-xl text-primary/80 font-medium">Coming Soon</p>
      </div>
    </Layout>
  );
}
