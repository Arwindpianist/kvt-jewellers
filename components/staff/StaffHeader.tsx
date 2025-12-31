import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function StaffHeader() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/staff/dashboard" className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold text-brand-500">
              KVT Staff
            </span>
          </Link>
          <nav className="hidden items-center space-x-4 md:flex">
            <Link
              href="/staff/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/staff/prices"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Prices
            </Link>
            <Link
              href="/staff/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {session.user.name} ({session.user.role})
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

