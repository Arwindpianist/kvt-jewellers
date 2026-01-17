"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from "@/components/ui/phone-input";
import { CheckCircle2, AlertCircle, TrendingUp, Shield, Clock, Zap, Globe, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";

const plannedFeatures = [
  {
    icon: TrendingUp,
    title: "Real-Time Trading",
    description: "Buy and sell gold & silver at live market rates with instant execution",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Bank-level security with encrypted transactions and secure wallet management",
  },
  {
    icon: Clock,
    title: "24/7 Market Access",
    description: "Trade anytime, anywhere - access global precious metals markets around the clock",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "No delays, no waiting - execute trades instantly with real-time price updates",
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description: "Trade in USD, MYR, or INR with automatic currency conversion",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track your portfolio, view price history, and get insights for smarter trading",
  },
];

export function PreRegisterTradingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "MY",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/trading/pre-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", country: "MY" });
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-serif font-bold text-green-800">Pre-Registration Successful!</h2>
              <p className="text-muted-foreground">
                Thank you for your interest in our Online Trading Platform. We've sent a confirmation email to <strong>{formData.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll be among the first to know when we launch, and we'll send you exclusive early access details.
              </p>
              <div className="pt-4">
                <Button asChild variant="outline">
                  <Link href="/home">Back to Home</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-600">
            Online Trading Platform
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Pre-Register for Early Access
          </p>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Planned Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-600" />
                Planned Features
              </CardTitle>
              <CardDescription>
                Get ready for a revolutionary trading experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {plannedFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="p-4 rounded-lg border bg-card-level-1 hover:shadow-md transition-shadow"
                    >
                      <Icon className="h-6 w-6 text-brand-600 mb-2" />
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Pre-Register Now</CardTitle>
              <CardDescription>
                Be among the first to experience our online trading platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value, phone: "" })}
                    required
                    disabled={loading}
                  >
                    <option value="MY">🇲🇾 Malaysia</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                </div>

                <PhoneInput
                  id="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  countryCode={formData.country}
                  required
                  disabled={loading}
                  helperText="Include country code (auto-formatted based on selected country)"
                />

                <Button
                  type="submit"
                  className="w-full gold-gradient-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Pre-Register Now"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By pre-registering, you agree to receive updates about our online trading platform launch.
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
