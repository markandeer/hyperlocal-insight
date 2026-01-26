import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Check, Zap, Shield, ArrowRight, CreditCard } from "lucide-react";

export default function PaymentPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscriptionData } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "price_1ABC123" }), // This should be dynamic or from the synced data
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = !!subscriptionData?.subscription;

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-24 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
          Upgrade to Pro
        </h1>
        <p className="text-primary/60 text-lg max-w-2xl mx-auto">
          Get unlimited access to hyperlocal market intelligence and advanced brand strategy tools.
        </p>
      </div>

      <div className="grid md:grid-cols-1 max-w-lg mx-auto">
        <Card className="border-primary shadow-2xl rounded-3xl overflow-hidden relative border-2">
          <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl">
            Popular
          </div>
          <CardHeader className="bg-primary/5 pb-8 pt-10 text-center">
            <CardTitle className="text-3xl font-display font-bold text-primary uppercase tracking-tighter mb-2">
              Pro Subscription
            </CardTitle>
            <div className="flex items-center justify-center gap-1">
              <span className="text-5xl font-display font-bold text-primary">$5</span>
              <span className="text-primary/40 font-bold uppercase tracking-widest text-sm">/ month</span>
            </div>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-10">
            <ul className="space-y-4 mb-10">
              {[
                "Unlimited Market Analysis Reports",
                "Advanced Demographics & Psychographics",
                "Full Brand Strategy Suite",
                "Brand Identity Generator",
                "Real-time Local Insights Feed",
                "Premium PDF Exports",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-primary/80 font-medium">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full h-14 bg-primary text-white font-bold uppercase tracking-widest text-sm rounded-2xl hover:opacity-90 shadow-xl transition-all group"
              disabled={isLoading || isPro}
              onClick={handleCheckout}
            >
              {isPro ? "Current Plan" : "Get Insights Now"}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center mt-6 text-[10px] text-primary/40 font-bold uppercase tracking-widest">
              Cancel anytime • Secure SSL payment
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16 text-center">
        <div className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold text-primary uppercase tracking-tight">Instant Access</h3>
          <p className="text-sm text-primary/60 leading-relaxed">Get your market reports generated in seconds after upgrading.</p>
        </div>
        <div className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold text-primary uppercase tracking-tight">Secure Billing</h3>
          <p className="text-sm text-primary/60 leading-relaxed">Your data is protected with enterprise-grade encryption.</p>
        </div>
        <div className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display font-bold text-primary uppercase tracking-tight">Flexible Payments</h3>
          <p className="text-sm text-primary/60 leading-relaxed">Monthly billing with no long-term contracts or hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
