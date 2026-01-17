"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { storeImage } from "@/lib/image-placeholders";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactPageClient() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            {t("contact.getInTouch")}
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            {t("contact.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("contact.subtitle")}
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <AnimatedSection>
          <Card className="bg-card-level-2 shadow-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-brand-600" />
                {t("contact.sendMessage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg bg-green-50 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
                  <p className="text-lg font-semibold text-green-800">
                    {t("contact.thankYou")}
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    {t("contact.thankYouDesc")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("contact.form.name")}</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contact.form.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">{t("contact.form.message")}</Label>
                    <textarea
                      id="message"
                      className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>
                  <AnimatedButton type="submit" className="w-full gold-gradient-button" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    {t("contact.form.send")}
                  </AnimatedButton>
                </form>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Contact Information */}
        <div className="space-y-6">
          <AnimatedSection delay={0.1}>
            <Card className="bg-card-level-2 shadow-card-elevated">
              <CardHeader>
                <CardTitle>{t("contact.contactInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-brand-100 p-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">{t("about.mainShowroom")}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {t("about.mainShowroomAddress")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-brand-100 p-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">{t("about.retailBranch")}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                      {t("about.retailBranchAddress")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-brand-100 p-3">
                    <Phone className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">{t("about.phone")}</h3>
                    <a href="tel:+60164575547" className="text-brand-600 hover:underline">
                      +(6)016-457-5547
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-brand-100 p-3">
                    <Mail className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">{t("about.email")}</h3>
                    <a href="mailto:sales@kvtjewellers.com" className="text-brand-600 hover:underline">
                      sales@kvtjewellers.com
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-brand-100 p-3">
                    <Clock className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">{t("contact.businessHours")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("contact.businessHoursWeekday")}
                      <br />
                      {t("contact.businessHoursSaturday")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="overflow-hidden rounded-lg">
              <Image
                src={storeImage}
                alt="KVT Jewellers Location"
                width={600}
                height={400}
                className="h-full w-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
