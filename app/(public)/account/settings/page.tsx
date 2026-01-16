import { redirect } from "next/navigation";
import { getCustomerUser } from "@/lib/auth/customer";
import { AccountNav } from "@/components/public/AccountNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/public/SettingsForm";

export const dynamic = 'force-dynamic'; // This page requires authentication, so it can't be statically generated

export default async function SettingsPage() {
  const user = await getCustomerUser();

  if (!user) {
    redirect("/login?from=/account/settings");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold md:text-5xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <AccountNav />
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm user={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}