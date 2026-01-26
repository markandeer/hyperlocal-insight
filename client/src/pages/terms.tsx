import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-display font-bold text-primary uppercase tracking-tighter">Terms and Conditions</h1>
          <div className="prose prose-slate max-w-none text-primary/80">
            <p>Welcome to hyperlocalmarketing.ai. By using our service, you agree to these terms.</p>
            <h2 className="text-xl font-bold mt-6">1. Use of Service</h2>
            <p>You must provide accurate information when generating reports. The AI-generated insights are for informational purposes only.</p>
            <h2 className="text-xl font-bold mt-6">2. Subscriptions</h2>
            <p>Subscriptions are billed monthly. You can cancel at any time via your account settings.</p>
            <h2 className="text-xl font-bold mt-6">3. Limitation of Liability</h2>
            <p>We are not responsible for business decisions made based on AI-generated data.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
