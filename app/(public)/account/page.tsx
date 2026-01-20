import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth/customer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag, Settings, Package, User } from "lucide-react";
import { AccountNav } from "@/components/public/AccountNav";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic'; // This page requires authentication, so it can't be statically generated

export async function generateMetadata() {
  return generatePageMetadata({
    title: "My Account | KVT Jewellers",
    description: "Manage your account, view orders, and update settings",
    url: "/account",
    noIndex: true, // Account page is user-specific, shouldn't be indexed
    keywords: ["account", "profile", "orders", "settings", "KVT Jewellers"],
  });
}

export default async function AccountPage() {
  const user = await getCustomerUser();

  if (!user) {
    redirect("/login?from=/account");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">My Account</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {user.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  My Orders
                </CardTitle>
                <CardDescription>
                  View and track your orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/account/orders">View Orders</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/account/settings">Settings</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}