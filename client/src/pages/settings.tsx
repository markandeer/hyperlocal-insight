import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CreditCard, User, ExternalLink, Shield, FileText } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const { data: subscriptionData } = useQuery<any>({
    queryKey: ["/api/subscription"],
  });

  const handleStripePortal = async () => {
    try {
      setIsPortalLoading(true);
      const response = await fetch("/api/checkout/portal", { method: "POST" });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const claims = user?.claims || {};

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-24">
      <h1 className="text-3xl font-display font-bold text-primary uppercase tracking-tighter mb-8 text-center">
        Member Dashboard
      </h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-primary/5 p-1 rounded-xl mb-8">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary font-bold uppercase tracking-widest text-xs">
            <User className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary font-bold uppercase tracking-widest text-xs">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-primary/10 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                  <AvatarImage src={claims.profile_image_url} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {claims.first_name?.[0]}
                    {claims.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-display font-bold text-primary uppercase tracking-tighter">
                    {claims.first_name} {claims.last_name}
                  </CardTitle>
                  <CardDescription className="text-primary/60">
                    {claims.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid gap-6">
                <div className="space-y-4">
                  <Link href="/terms">
                    <Button variant="outline" className="w-full justify-start gap-3 border-primary/10 hover:bg-primary/5 text-primary/60 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl">
                      <FileText className="w-4 h-4" />
                      Terms & Conditions
                    </Button>
                  </Link>
                  <Link href="/privacy">
                    <Button variant="outline" className="w-full justify-start gap-3 border-primary/10 hover:bg-primary/5 text-primary/60 font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl">
                      <Shield className="w-4 h-4" />
                      Privacy Policy
                    </Button>
                  </Link>
                </div>
                <div className="pt-4 border-t border-primary/5">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 text-primary font-bold uppercase tracking-widest text-xs h-12 rounded-xl hover:bg-primary/5"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border-primary/10 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-display font-bold text-primary uppercase tracking-tighter">
                Subscription Plan
              </CardTitle>
              <CardDescription className="text-primary/60">
                Manage your subscription and billing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-lg font-bold text-primary">
                      {subscriptionData?.subscription ? "Pro Plan" : "Free Plan"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold text-primary">
                      {subscriptionData?.subscription ? "$5.00" : "$0.00"}
                      <span className="text-xs font-normal text-primary/40 ml-1 uppercase tracking-widest">/ month</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {subscriptionData?.subscription ? (
                  <Button 
                    className="w-full bg-primary text-white font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-2xl hover:opacity-90 shadow-lg transition-all"
                    disabled={isPortalLoading}
                    onClick={handleStripePortal}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                ) : (
                  <a href="https://buy.stripe.com/6oU5kDaPVgFdetBckF7Zu01" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs h-12 px-8 rounded-2xl shadow-lg transition-all">
                      Upgrade to Pro
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8 border-primary/10 shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-xl font-display font-bold text-primary uppercase tracking-tighter">
                Member Details
              </CardTitle>
              <CardDescription className="text-primary/60">
                Personal information for your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Name</p>
                  <p className="font-bold text-primary">{claims.first_name} {claims.last_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Email</p>
                  <p className="font-bold text-primary">{claims.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Phone</p>
                  <p className="font-bold text-primary">{claims.phone_number || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Address</p>
                  <p className="font-bold text-primary/60 italic">Optional</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Billing Address</p>
                  <p className="font-bold text-primary/60 italic">Optional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
