"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Settings, LayoutDashboard } from "lucide-react";

const navItems = [
  {
    href: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: ShoppingBag,
  },
  {
    href: "/account/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-100 text-brand-900 dark:bg-brand-900 dark:text-brand-100"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}