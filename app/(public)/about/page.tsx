import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { storeImage } from "@/lib/image-placeholders";
import { MapPin, Phone, Mail, Clock, Award, Users, Gem } from "lucide-react";

export const metadata = {
  title: "About Us | KVT Jewellers",
  description: "Learn about KVT Jewellers, established in 2018",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            Our Heritage
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            About KVT Jewellers
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Excellence in precious metals since 2018
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
              <h2 className="font-serif text-3xl font-semibold">Our Story</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                Established in 2018 by <strong className="text-foreground">Mr. Thangadurai Venkatraman</strong>, 
                KVT Jewellers has been a trusted name in the Malaysian jewelry industry. We specialize 
                in retail and wholesale of gold jewelry and bullion, offering premium quality products 
                to our valued customers.
              </p>
              <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
                Our commitment to excellence and customer satisfaction has made us a preferred choice 
                for those seeking quality gold and silver products. With years of experience in the 
                precious metals market, we understand the value of trust, authenticity, and superior 
                craftsmanship.
              </p>
            </div>
          </section>
        </AnimatedSection>

        <Separator />

        {/* What We Offer */}
        <AnimatedSection delay={0.2}>
          <section>
            <div className="mb-8">
              <h2 className="mb-4 font-serif text-3xl font-semibold">What We Offer</h2>
              <p className="text-muted-foreground">
                A comprehensive range of premium products and services
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { icon: Gem, title: "916 Gold Jewelry", desc: "Beautiful designs crafted with precision" },
                { icon: Award, title: "999.9 Gold Bars", desc: "Investment-grade pure gold bullion" },
                { icon: Users, title: "Custom Jewelry", desc: "Professional goldsmiths create unique pieces" },
                { icon: Gem, title: "Gold & Silver Coins", desc: "Collectible and investment coins" },
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
              <h2 className="mb-4 font-serif text-3xl font-semibold">Our Locations</h2>
              <p className="text-muted-foreground">
                Visit us at our showrooms in Kuala Lumpur
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    <h3 className="font-serif text-xl font-semibold">Main Showroom</h3>
                  </div>
                  <p className="mb-2 text-muted-foreground">
                    No.5, Ground Floor, Wisma Yakin
                    <br />
                    Jalan Masjid India, 50100 Kuala Lumpur
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-brand-600" />
                    <h3 className="font-serif text-xl font-semibold">Retail Branch</h3>
                  </div>
                  <p className="mb-2 text-muted-foreground">
                    KVT Gold & Diamonds Sdn. Bhd.
                    <br />
                    1009 GF Selangor Mansion, 50100 Kuala Lumpur
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
              <h2 className="mb-4 font-serif text-3xl font-semibold">Get In Touch</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">Phone</h3>
                  <a href="tel:+60164575547" className="text-brand-600 hover:underline">
                    +(6)016-457-5547
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">Email</h3>
                  <a href="mailto:sales@kvtjewellers.com" className="text-brand-600 hover:underline">
                    sales@kvtjewellers.com
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-brand-600" />
                  <h3 className="mb-2 font-semibold">Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri: 10AM-5PM
                    <br />
                    Sat: 10AM-2PM
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
