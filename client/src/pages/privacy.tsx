import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-4xl font-display font-bold text-primary uppercase tracking-tighter">Privacy Policy</h1>
          <div className="prose prose-slate max-w-none text-primary/80">
            <p>Your privacy is important to us. This policy explains how we handle your data.</p>
            <h2 className="text-xl font-bold mt-6">1. Data Collection</h2>
            <p>We collect business addresses and types you provide to generate reports. We also collect email addresses for account management.</p>
            <h2 className="text-xl font-bold mt-6">2. Data Security</h2>
            <p>We use industry-standard measures to protect your information and secure your account.</p>
            <h2 className="text-xl font-bold mt-6">3. Third-Party Services</h2>
            <p>We use OpenAI for report generation and Stripe for payment processing. Your data is handled according to their respective privacy policies.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
