"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock } from "lucide-react";

export function LiveRateSidebar() {
  return (
    <div className="space-y-6">
      {/* Online Trading Button - gold/black in dark mode to match theme */}
      <Button
        asChild
        variant="default"
        className="w-full gold-gradient-button font-semibold py-6 text-base relative overflow-hidden group"
      >
        <Link href="/pre-register-trading">
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-lg">📈</span>
            <span>Online Trading</span>
            <span className="text-xs opacity-80">(Pre-Register)</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </Link>
      </Button>

      {/* For Booking - card style that works in dark mode, not bright yellow */}
      <Card className="bg-card border border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-amber-600 dark:text-amber-400">FOR BOOKING</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 rounded-full bg-muted p-2">
              <Phone className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href="https://wa.me/60164575547"
                className="block font-medium text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                +(6)016-457 5547
              </a>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <span>💬</span>
                WhatsApp
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 rounded-full bg-muted p-2">
              <Phone className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href="https://wa.me/60125349916"
                className="block font-medium text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                +(6)012-534 9916
              </a>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <span>💬</span>
                WhatsApp
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 rounded-full bg-muted p-2">
              <Mail className="h-4 w-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href="mailto:sales@kvtjewellers.com"
                className="block font-medium text-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors underline-offset-2 hover:underline break-all"
              >
                sales@kvtjewellers.com
              </a>
              <span className="text-xs text-muted-foreground mt-0.5">Email</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News & Events Button */}
      <Button variant="outline" className="w-full">
        NEWS & EVENTS
      </Button>

      {/* Market Timings */}
      <Card className="bg-brand-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            MARKET TIMINGS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="font-semibold">MONDAY TO FRIDAY</p>
            <p>10:00 AM TO 5:00 PM MYR</p>
          </div>
          <div>
            <p className="font-semibold">SATURDAY</p>
            <p>10:00 AM TO 2:00 PM MYR</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

