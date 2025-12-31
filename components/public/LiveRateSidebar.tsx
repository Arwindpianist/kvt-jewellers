import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock } from "lucide-react";

export function LiveRateSidebar() {
  return (
    <div className="space-y-6">
      {/* Online Trading Banner */}
      <div className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 p-4 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">✓</span>
          <span className="font-bold text-white">ONLINE TRADING</span>
        </div>
      </div>

      {/* For Booking */}
      <Card className="bg-brand-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">FOR BOOKING</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a
              href="https://wa.me/60164575547"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              +(6)016-457 5547
            </a>
            <span className="text-green-400">💬</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a
              href="https://wa.me/60125349916"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              +(6)012-534 9916
            </a>
            <span className="text-green-400">💬</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href="mailto:sales@kvtjewellers.com" className="hover:underline">
              sales@kvtjewellers.com
            </a>
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

