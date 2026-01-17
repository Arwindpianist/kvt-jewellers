import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NotFound() {
  // Get translations directly (this page is outside the public route group)
  // so it doesn't have I18nProvider, but we can still read translations
  let title = "404";
  let pageNotFound = "Page Not Found";
  let description = "The page you're looking for doesn't exist.";
  let goToHomepage = "Go to Homepage";
  
  try {
    // MEMORY LEAK FIX: Use cached message loader instead of direct import
    const { getMessages } = await import("@/i18n/request");
    const messages = await getMessages();
    const errors = messages.errors?.['404'];
    if (errors) {
      title = errors.title || title;
      pageNotFound = errors.pageNotFound || pageNotFound;
      description = errors.description || description;
      goToHomepage = errors.goToHomepage || goToHomepage;
    }
  } catch {
    // Fallback to English if translation loading fails
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-4xl">{title}</CardTitle>
          <CardTitle className="font-serif text-2xl">{pageNotFound}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {description}
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/home">{goToHomepage}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

