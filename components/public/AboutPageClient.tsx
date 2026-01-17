"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { storeImage } from "@/lib/image-placeholders";
import { MapPin, Phone, Mail, Clock, Award, Users, Gem } from "lucide-react";
import { useTranslations } from "next-intl";

export function AboutPageClient() {
  const t = useTranslations();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            {t("about.ourHeritage")}
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            {t("about.title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("about.subtitle")}
          </p>
        </div>
      </FadeIn>

      {/* Hero Image */}
      <AnimatedSection>
        <div className="mb-16 overflow-hidden rounded-2xl">
          <Image
            src={storeImage}
            alt="KVT Jewellers Showroom"
            width={1200}
            height={600}
            className="h-[400px] w-full object-cover md:h-[500px]"
          />
        </div>
      </AnimatedSection>

      <div className="mx-auto max-w-4xl space-y-16">
        {/* Our Story */}
        <AnimatedSection>
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Gem className="h-6 w-6 text-brand-600" />
              <h2 className="font-serif text-3xl font-semibold">{t("about.ourStory")}</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                {t("about.ourStoryDesc1")}
              </p>
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                {t("about.ourStoryDesc2")}
              </p>
            </div>
          </section>
        </AnimatedSection>

        <Separator />

        {/* What We Offer */}
        <AnimatedSection delay={0.2}>
          <section>
            <div className="mb-8">
              <h2 className="mb-4 font-serif text-3xl font-semibold">{t("about.whatWeOffer")}</h2>
              <p className="text-muted-foreground">
                {t("about.whatWeOfferDesc")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { icon: Gem, title: t("about.offer916Gold"), desc: t("about.offer916GoldDesc") },
                { icon: Award, title: t("about.offer999Gold"), desc: t("about.offer999GoldDesc") },
                { icon: Users, title: t("about.offerCustom"), desc: t("about.offerCustomDesc") },
                { icon: Gem, title: t("about.offerCoins"), desc: t("about.offerCoinsDesc") },
              ].map((item) => (
                <Card key={item.title} className="border-brand-200">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-brand-100 p-3">
                      <item.icon className="h-5 w-5 text-brand-600" />
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </AnimatedSection>

        <Separator />

        {/* Locations */}
        <AnimatedSection delay={0.3}>
          <section>
            <div className="mb-8">
              <h2 className="mb-4 font-serif text-3xl font-semibold">{t("about.ourLocations")}</h2>
              <p className="text-muted-foreground">
                {t("about.ourLocationsDesc")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    <h3 className="font-serif text-xl font-semibold">{t("about.mainShowroom")}</h3>
                  </div>
                  <p className="mb-2 text-muted-foreground whitespace-pre-line">
                    {t("about.mainShowroomAddress")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    <h3 className="font-serif text-xl font-semibold">{t("about.retailBranch")}</h3>
                  </div>
                  <p className="mb-2 text-muted-foreground whitespace-pre-line">
                    {t("about.retailBranchAddress")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </AnimatedSection>

        <Separator />

        {/* Contact Info */}
        <AnimatedSection delay={0.4}>
          <section>
            <div className="mb-8">
              <h2 className="mb-4 font-serif text-3xl font-semibold">{t("about.getInTouch")}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">{t("about.phone")}</h3>
                  <a href="tel:+60164575547" className="text-brand-600 hover:underline">
                    +(6)016-457-5547
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">{t("about.email")}</h3>
                  <a href="mailto:sales@kvtjewellers.com" className="text-brand-600 hover:underline">
                    sales@kvtjewellers.com
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">{t("about.hours")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("about.hoursWeekday")}
                    <br />
                    {t("about.hoursSaturday")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}
