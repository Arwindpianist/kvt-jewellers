"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HomePriceTicker } from "@/components/public/HomePriceTicker";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { StaggerAnimation, StaggerItem } from "@/components/ui/stagger-animation";
import { HoverCard } from "@/components/ui/hover-card";
import { Sparkles, TrendingUp, Shield, Award } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";
import { categoryImages, storeImage } from "@/lib/image-placeholders";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { PWADownloadPrompt } from "@/components/public/PWADownloadPrompt";

interface HomePageContentProps {
  publishedPrices: GoldPrice[];
}

export function HomePageContent({ publishedPrices }: HomePageContentProps) {
  return (
    <div className="flex flex-col bg-transparent">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <HeroGeometric
          badge="Established 2018"
          title1="Premium Gold"
          title2="& Silver Trading"
          description="KVT Jewellers offers premium 916 gold jewelry and 999.9 gold bar bullion. Experience luxury craftsmanship backed by years of expertise in precious metals."
        >
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center">
            <AnimatedButton asChild size="lg" className="gold-gradient-button rounded-xl">
              <Link href="/products">Browse Products</Link>
            </AnimatedButton>
            <AnimatedButton asChild size="lg" className="silver-gradient-button-outline rounded-xl">
              <Link href="/live-rate">View Live Rates</Link>
            </AnimatedButton>
          </div>
        </HeroGeometric>
      </section>

      {/* Gold Price Preview - Moved to be first after hero */}
      <section className="border-y bg-gradient-to-br from-brand-50/50 to-white dark:bg-background dark:from-background dark:to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 md:mb-8 text-center">
                <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
                  Live Prices
                </Badge>
                <h2 className="mb-2 font-serif text-3xl md:text-4xl font-semibold">
                  Today&apos;s Gold Prices
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">Updated in real-time</p>
              </div>
              <Card className="bg-card-level-2 shadow-card-elevated">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg md:text-xl">Current Market Rates</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 md:px-3 py-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
                        <span className="text-xs font-medium text-green-700">Live</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Updates every 2s</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <HomePriceTicker prices={publishedPrices} showLastUpdated={true} />
                  <Separator className="my-4 md:my-6" />
                  <div className="text-center">
                    <AnimatedButton asChild className="w-full sm:w-auto gold-gradient-button-outline rounded-lg">
                      <Link href="/live-rate">View All Rates →</Link>
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-white py-12">
        <div className="container mx-auto px-4">
          <StaggerAnimation>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { icon: Shield, title: "Authentic Quality", desc: "Certified 916 & 999.9 purity" },
                { icon: TrendingUp, title: "Live Market Rates", desc: "Real-time price updates" },
                { icon: Award, title: "Expert Craftsmanship", desc: "Professional goldsmiths" },
              ].map((feature) => (
                <StaggerItem key={feature.title}>
                  <HoverCard>
                    <div className="text-center">
                      <motion.div
                        className="mb-4 inline-flex rounded-full bg-brand-100 p-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="h-6 w-6 text-brand-600" />
                      </motion.div>
                      <h3 className="mb-2 font-serif text-xl font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerAnimation>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
                Collections
              </Badge>
              <h2 className="mb-4 font-serif text-4xl font-semibold md:text-5xl">
                Featured Collections
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Discover our premium selection of gold coins, bars, and exquisite jewelry pieces
              </p>
            </div>
          </AnimatedSection>
          <StaggerAnimation staggerDelay={0.15}>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Gold Coins",
                  description: "Premium gold coins for investment and collection. Limited editions and commemorative pieces available.",
                  href: "/products/coin",
                  image: categoryImages.coin,
                  badge: "Investment Grade",
                },
                {
                  title: "Gold Bars",
                  description: "999.9 pure gold bars in various sizes. Perfect for serious investors and collectors.",
                  href: "/products/bar",
                  image: categoryImages.bar,
                  badge: "999.9 Pure",
                },
                {
                  title: "Jewelry",
                  description: "Exquisite 916 gold jewelry designs. Handcrafted by professional goldsmiths with attention to detail.",
                  href: "/products/jewellery",
                  image: categoryImages.jewellery,
                  badge: "Handcrafted",
                },
              ].map((item) => (
                <StaggerItem key={item.href}>
                  <HoverCard>
                    <Card className="group overflow-hidden bg-card-level-2 shadow-card-elevated transition-all hover:bg-card-level-3 hover:shadow-card-floating">
                      <div className="relative h-64 w-full overflow-hidden">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-black/20 via-transparent to-transparent" />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge className="absolute right-4 top-4 bg-white/90 text-brand-700">
                            {item.badge}
                          </Badge>
                        </motion.div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="mb-2 font-serif text-2xl font-semibold">
                          {item.title}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                        <AnimatedButton asChild className="w-full gold-gradient-button-outline">
                          <Link href={item.href}>Explore Collection →</Link>
                        </AnimatedButton>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerAnimation>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-gradient-to-br from-brand-50/30 via-white to-brand-50/30 dark:bg-background dark:from-background dark:via-background dark:to-background py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={storeImage}
                    alt="KVT Jewellers Store"
                    width={600}
                    height={600}
                    className="rounded-lg shadow-xl"
                  />
                </motion.div>
                <div>
                  <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
                    Our Story
                  </Badge>
                  <h2 className="mb-6 font-serif text-4xl font-semibold md:text-5xl">
                    About KVT Jewellers
                  </h2>
                  <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                    Established in 2018 by Mr. Thangadurai Venkatraman, KVT Jewellers
                    specializes in retail and wholesale of gold jewelry and bullion.
                  </p>
                  <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                    We offer custom-made jewelry crafted by professional goldsmiths, ensuring
                    each piece meets the highest standards of quality and craftsmanship.
                  </p>
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <AnimatedButton asChild className="gold-gradient-button">
                      <Link href="/about">Learn More</Link>
                    </AnimatedButton>
                    <AnimatedButton asChild className="gold-gradient-button-outline">
                      <Link href="/contact">Contact Us</Link>
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* PWA Download Prompt */}
      <PWADownloadPrompt />
    </div>
  );
}

